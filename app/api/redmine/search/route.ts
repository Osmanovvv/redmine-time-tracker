import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	try {
		const { url, apiKey, query, limit = 50 } = await request.json()

		if (!query || query.trim().length < 2) {
			return NextResponse.json({ issues: [] })
		}

		// Формируем параметры поиска для Redmine API
		const searchParams = new URLSearchParams({
			assigned_to_id: "me",
			status_id: "open",
			limit: limit.toString(),
			// Поиск по subject и description
			subject: `~${query.trim()}`,
		})

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
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
