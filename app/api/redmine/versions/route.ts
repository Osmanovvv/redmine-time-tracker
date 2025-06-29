import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	try {
		const { url, apiKey } = await request.json()

		// Сначала получаем список всех проектов
		const projectsRes = await fetch(`${url}/projects.json?limit=100`, {
			headers: {
				"X-Redmine-API-Key": apiKey,
				"Content-Type": "application/json",
			},
		})

		if (!projectsRes.ok) {
			return NextResponse.json({ error: "Failed to fetch projects" }, { status: projectsRes.status })
		}

		const projectsData = await projectsRes.json()
		const projects = projectsData.projects || []

		// Загружаем версии для каждого проекта
		const allVersions: any[] = []

		for (const project of projects) {
			const versionsRes = await fetch(`${url}/projects/${project.id}/versions.json`, {
				headers: {
					"X-Redmine-API-Key": apiKey,
					"Content-Type": "application/json",
				},
			})

			if (versionsRes.ok) {
				const versionsData = await versionsRes.json()
				allVersions.push(...(versionsData.versions || []))
			}
		}

		return NextResponse.json({ versions: allVersions })
	} catch (error) {
		console.error("Error fetching versions:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
