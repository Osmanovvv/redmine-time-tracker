import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	try {
		const { url, apiKey, query, limit = 50 } = await request.json()

		if (!query || query.trim().length === 0) {
			return NextResponse.json({ issues: [] })
		}

		const searchTerm = query.trim()

		// Проверяем, является ли запрос числом (поиск по ID)
		const isNumericSearch = /^\d+$/.test(searchTerm)

		let searchParams: URLSearchParams

		if (isNumericSearch) {
			// Поиск по ID задачи
			searchParams = new URLSearchParams({
				assigned_to_id: "me",
				status_id: "open",
				limit: limit.toString(),
				issue_id: searchTerm,
			})
		} else {
			// Поиск по тексту - используем несколько запросов для поиска по разным полям
			// Redmine API не поддерживает одновременный поиск по нескольким полям,
			// поэтому делаем несколько запросов и объединяем результаты

			const searches = [
				// Поиск по названию (subject)
				{
					subject: `~${searchTerm}`,
				},
				// Поиск по описанию (description)
				{
					description: `~${searchTerm}`,
				},
			]

			const allResults = new Map() // Используем Map для избежания дублей

			for (const searchCriteria of searches) {
				const params = new URLSearchParams({
					assigned_to_id: "me",
					status_id: "open",
					limit: limit.toString(),
				});

				if (searchCriteria.subject) {
					params.append("subject", searchCriteria.subject);
				}
				if (searchCriteria.description) {
					params.append("description", searchCriteria.description);
				}

				try {
					const response = await fetch(`${url}/issues.json?${params.toString()}`, {
						headers: {
							"X-Redmine-API-Key": apiKey,
							"Content-Type": "application/json",
						},
					});

					if (response.ok) {
						const data = await response.json();
						const issues = data.issues || [];

						issues.forEach((issue: any) => {
							allResults.set(issue.id, issue);
						});
					}
				} catch (error) {
					console.error(`Ошибка поиска по ${Object.keys(searchCriteria)[0]}:`, error);
				}
			}

			// Преобразуем Map обратно в массив и сортируем по релевантности
			const combinedResults = Array.from(allResults.values())

			// Сортируем результаты по релевантности:
			// 1. Точное совпадение в названии
			// 2. Начинается с поискового запроса в названии
			// 3. Содержит поиско��ый запрос в названии
			// 4. Содержит в описании
			const sortedResults = combinedResults.sort((a: any, b: any) => {
				const aSubject = a.subject.toLowerCase()
				const bSubject = b.subject.toLowerCase()
				const searchLower = searchTerm.toLowerCase()

				// Точное совпадение в названии
				if (aSubject === searchLower && bSubject !== searchLower) return -1
				if (bSubject === searchLower && aSubject !== searchLower) return 1

				// Начинается с поискового запроса
				if (aSubject.startsWith(searchLower) && !bSubject.startsWith(searchLower)) return -1
				if (bSubject.startsWith(searchLower) && !aSubject.startsWith(searchLower)) return 1

				// Содержит в названии
				const aInSubject = aSubject.includes(searchLower)
				const bInSubject = bSubject.includes(searchLower)

				if (aInSubject && !bInSubject) return -1
				if (bInSubject && !aInSubject) return 1

				// По умолчанию сортируем по ID (новые сначала)
				return b.id - a.id
			})

			return NextResponse.json({
				issues: sortedResults.slice(0, limit),
				total_count: sortedResults.length,
			})
		}

		// Для поиска по ID делаем обычный запрос
		const response = await fetch(`${url}/issues.json?${searchParams}`, {
			headers: {
				"X-Redmine-API-Key": apiKey,
				"Content-Type": "application/json",
			},
		})

		if (response.ok) {
			const data = await response.json()
			return NextResponse.json(data)
		} else {
			return NextResponse.json({ error: "Failed to search issues" }, { status: response.status })
		}
	} catch (error) {
		console.error("Search error:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
