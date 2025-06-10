// import { type NextRequest, NextResponse } from "next/server"

// type Role = {
// 	id: number
// 	name: string
// }

// type Membership = {
// 	id: number
// 	project: { id: number; name: string }
// 	user: { id: number; name: string }
// 	roles: Role[]
// }

// export async function POST(request: NextRequest) {
// 	try {
// 		const { url, apiKey, userId } = await request.json()

// 		const membershipsResponse = await fetch(`${url}/memberships.json`, {
// 			headers: {
// 				"X-Redmine-API-Key": apiKey,
// 				"Content-Type": "application/json",
// 			},
// 		})

// 		if (!membershipsResponse.ok) {
// 			return NextResponse.json({ error: "Failed to fetch memberships" }, { status: membershipsResponse.status })
// 		}

// 		const membershipsData = await membershipsResponse.json()
// 		const memberships: Membership[] = membershipsData.memberships

// 		const userMembership = memberships.find((m) => m.user.id === userId)
// 		const roles = userMembership?.roles.map((r) => r.name) || []

// 		return NextResponse.json({ roles })
// 		// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 	} catch (error) {
// 		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
// 	}
// }
