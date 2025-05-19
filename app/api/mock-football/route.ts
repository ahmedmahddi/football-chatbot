import { NextResponse } from "next/server"
import { mockLiveMatches, mockMatchStatistics, mockLineups } from "@/lib/football-data"

// This is a fallback API route that returns mock football data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || ""

  // Add artificial delay to simulate network request
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    // Handle different endpoint types
    if (endpoint === "live-matches") {
      return NextResponse.json({ events: mockLiveMatches })
    }

    // Match details endpoint (e.g., match/10001)
    else if (endpoint.startsWith("match/")) {
      const matchId = Number.parseInt(endpoint.split("/")[1])

      if (isNaN(matchId)) {
        return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
      }

      // Find the match
      const match = mockLiveMatches.find((m) => m.id === matchId)

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 })
      }

      // Get statistics and lineups
      const statistics = mockMatchStatistics[matchId as keyof typeof mockMatchStatistics]
      const lineups = mockLineups[matchId as keyof typeof mockLineups]

      return NextResponse.json({
        match,
        statistics,
        lineups,
      })
    }

    // Unknown endpoint
    else {
      return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in mock football API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
