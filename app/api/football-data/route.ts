import { NextResponse } from "next/server"
import { mockLiveMatches } from "@/lib/football-data"

// This is the API key for Football-Data.org
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY || ""

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || ""

  // Check if we have an API key
  const hasApiKey = FOOTBALL_DATA_API_KEY !== ""

  if (!hasApiKey) {
    console.log("No Football-Data.org API key found, using mock data")
    return handleMockData(endpoint)
  }

  try {
    console.log(`Fetching from Football-Data.org: ${endpoint}`)

    // Base URL for Football-Data.org API
    const baseUrl = "https://api.football-data.org/v4"

    // Map our simplified endpoints to the actual Football-Data.org endpoints
    let apiEndpoint = endpoint

    // Handle special cases for endpoints
    if (endpoint === "matches/live") {
      // Football-Data.org doesn't have a direct "live matches" endpoint
      // Use only valid status values according to the API documentation
      apiEndpoint = "matches?status=LIVE,IN_PLAY,PAUSED"
    } else if (endpoint.startsWith("matches/")) {
      // For specific match details, format correctly
      const matchId = endpoint.split("/")[1]
      apiEndpoint = `matches/${matchId}`
    }

    const url = `${baseUrl}/${apiEndpoint}`
    console.log(`Full URL: ${url}`)

    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": FOOTBALL_DATA_API_KEY,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      console.error(`Football-Data.org API error: ${response.status} ${response.statusText}`)
      // Log more details about the error
      const errorText = await response.text()
      console.error(`Error details: ${errorText}`)
      throw new Error(`Football-Data.org API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from Football-Data.org:", error)

    // Fall back to mock data
    console.log("Falling back to mock data")
    return handleMockData(endpoint)
  }
}

// Helper function to handle mock data requests
async function handleMockData(endpoint: string) {
  // Add artificial delay to simulate network request
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    // Handle different endpoint types
    if (endpoint === "matches/live") {
      // Transform mock data to match Football-Data.org format
      const matches = mockLiveMatches.map((match) => ({
        id: match.id,
        utcDate: new Date().toISOString(),
        status: match.status.description === "HT" ? "PAUSED" : "IN_PLAY", // Changed from HALF_TIME to PAUSED
        matchday: 1,
        stage: "REGULAR_SEASON",
        group: null,
        lastUpdated: new Date().toISOString(),
        score: {
          winner: null,
          duration: "REGULAR",
          fullTime: {
            home: match.homeScore.current,
            away: match.awayScore.current,
          },
          halfTime: {
            home: Math.floor(match.homeScore.current / 2),
            away: Math.floor(match.awayScore.current / 2),
          },
        },
        homeTeam: {
          id: match.id * 10,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
          tla: match.homeTeam.shortName,
          crest: `/placeholder.svg?height=50&width=50`,
        },
        awayTeam: {
          id: match.id * 10 + 1,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
          tla: match.awayTeam.shortName,
          crest: `/placeholder.svg?height=50&width=50`,
        },
        competition: {
          id: 1,
          name: match.tournament.uniqueTournament.name,
          code: match.tournament.uniqueTournament.name.substring(0, 3).toUpperCase(),
          type: "LEAGUE",
          emblem: `/placeholder.svg?height=50&width=50`,
        },
        minute: match.status.description.replace("'", ""),
      }))

      return NextResponse.json({
        matches,
        resultSet: {
          count: matches.length,
          first: new Date().toISOString(),
          last: new Date().toISOString(),
          played: matches.length,
        },
        usingMockData: true,
      })
    }

    // Match details endpoint (e.g., matches/10001)
    else if (endpoint.startsWith("matches/")) {
      const matchId = Number.parseInt(endpoint.split("/")[1])

      if (isNaN(matchId)) {
        return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
      }

      // Find the match
      const match = mockLiveMatches.find((m) => m.id === matchId)

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 })
      }

      // Transform to Football-Data.org format
      const matchData = {
        id: match.id,
        utcDate: new Date().toISOString(),
        status: match.status.description === "HT" ? "PAUSED" : "IN_PLAY", // Changed from HALF_TIME to PAUSED
        matchday: 1,
        stage: "REGULAR_SEASON",
        group: null,
        lastUpdated: new Date().toISOString(),
        score: {
          winner: null,
          duration: "REGULAR",
          fullTime: {
            home: match.homeScore.current,
            away: match.awayScore.current,
          },
          halfTime: {
            home: Math.floor(match.homeScore.current / 2),
            away: Math.floor(match.awayScore.current / 2),
          },
        },
        homeTeam: {
          id: match.id * 10,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
          tla: match.homeTeam.shortName,
          crest: `/placeholder.svg?height=50&width=50`,
        },
        awayTeam: {
          id: match.id * 10 + 1,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
          tla: match.awayTeam.shortName,
          crest: `/placeholder.svg?height=50&width=50`,
        },
        competition: {
          id: 1,
          name: match.tournament.uniqueTournament.name,
          code: match.tournament.uniqueTournament.name.substring(0, 3).toUpperCase(),
          type: "LEAGUE",
          emblem: `/placeholder.svg?height=50&width=50`,
        },
        minute: match.status.description.replace("'", ""),
        // Add head to head data
        head2head: {
          numberOfMatches: 10,
          totalGoals: 25,
          homeTeam: {
            wins: 4,
            draws: 2,
            losses: 4,
          },
          awayTeam: {
            wins: 4,
            draws: 2,
            losses: 4,
          },
        },
        usingMockData: true,
      }

      return NextResponse.json(matchData)
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
