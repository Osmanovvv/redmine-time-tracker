import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey, timeEntry } = await request.json()

    const response = await fetch(`${url}/time_entries.json`, {
      method: "POST",
      headers: {
        "X-Redmine-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ time_entry: timeEntry }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to create time entry", details: errorText },
        { status: response.status },
      )
    }
	  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
