import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey } = await request.json()

    const response = await fetch(`${url}/issues.json?assigned_to_id=me&status_id=open&limit=100`, {
      headers: {
        "X-Redmine-API-Key": apiKey,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: "Failed to fetch issues" }, { status: response.status })
    }
	  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
