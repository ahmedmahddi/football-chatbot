import { NextResponse } from "next/server";
import { mockLiveMatches, mockMatchStatistics } from "@/lib/football-data";

// This is a server-side route handler that acts as a proxy to SofaScore
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "";
  const useMock = searchParams.get("useMock") === "true";

  // If mock data is explicitly requested, use it
  if (useMock) {
    console.log("Mock data explicitly requested");
    return handleMockData(endpoint);
  }

  try {
    console.log(`Fetching from SofaScore: ${endpoint}`);

    // Map our simplified endpoints to the actual SofaScore API endpoints
    let apiUrl = "";
    let fallbackUrl = ""; // Declare fallback URL variable

    if (endpoint === "live-matches") {
      apiUrl = "http://www.sofascore.com/api/v1/sport/football/events/live";
    } else if (endpoint.startsWith("match/")) {
      const matchId = endpoint.split("/")[1];
      apiUrl = `http://www.sofascore.com/api/v1/event/${matchId}`;
    } else if (endpoint.startsWith("match-statistics/")) {
      const matchId = endpoint.split("/")[1];
      // Updated endpoint URL structure for match statistics
      apiUrl = `http://www.sofascore.com/api/v1/event/${matchId}/statistics`;

      // Fallback URL in case the primary one fails
      fallbackUrl = `http://www.sofascore.com/api/v1/match/${matchId}/statistics`;
    } else if (endpoint.startsWith("match-lineups/")) {
      const matchId = endpoint.split("/")[1];
      apiUrl = `http://www.sofascore.com/api/v1/event/${matchId}/lineups`;
    } else if (endpoint.startsWith("match-events/")) {
      const matchId = endpoint.split("/")[1];
      apiUrl = `http://www.sofascore.com/api/v1/event/${matchId}/incidents`;
    } else {
      return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
    }

    console.log(`Full URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        // SofaScore requires specific headers to work properly
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.sofascore.com/",
        Origin: "https://www.sofascore.com",
      },
      cache: "no-store", // Don't cache to ensure fresh data
    });

    if (!response.ok) {
      console.error(
        `SofaScore API error: ${response.status} ${response.statusText}`
      );

      // If we're trying to get match statistics and the primary URL failed, try the fallback URL
      if (endpoint.startsWith("match-statistics/") && fallbackUrl) {
        console.log(`Trying fallback URL for match statistics: ${fallbackUrl}`);
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            Referer: "https://www.sofascore.com/",
            Origin: "https://www.sofascore.com",
          },
          cache: "no-store",
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          return NextResponse.json(data);
        }

        console.error(
          `Fallback URL also failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`
        );
      }

      throw new Error(
        `SofaScore API responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from SofaScore:", error);

    // Fall back to mock data if the API request fails
    console.log("Falling back to mock data due to API error");
    return handleMockData(endpoint);
  }
}

// Helper function to handle mock data requests
async function handleMockData(endpoint: string) {
  // Add artificial delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Handle different endpoint types
    if (endpoint === "live-matches") {
      // Transform mock data to ensure proper structure
      const structuredMatches = mockLiveMatches.map(match => ({
        id: match.id,
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
        },
        homeScore: {
          current: match.homeScore.current,
          display: match.homeScore.current,
          period1: 0,
          period2: 0,
          normaltime: match.homeScore.current,
        },
        awayScore: {
          current: match.awayScore.current,
          display: match.awayScore.current,
          period1: 0,
          period2: 0,
          normaltime: match.awayScore.current,
        },
        tournament: match.tournament,
        status: match.status,
      }));

      return NextResponse.json({
        events: structuredMatches,
        usingMockData: true,
      });
    }

    // Match details endpoint (e.g., match/10001)
    else if (endpoint.startsWith("match/")) {
      const matchId = Number.parseInt(endpoint.split("/")[1]);

      if (isNaN(matchId)) {
        return NextResponse.json(
          { error: "Invalid match ID" },
          { status: 400 }
        );
      }

      // Find the match
      const match = mockLiveMatches.find(m => m.id === matchId);

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      return NextResponse.json({
        event: match,
        usingMockData: true,
      });
    }

    // Match statistics endpoint (e.g., match-statistics/10001)
    else if (endpoint.startsWith("match-statistics/")) {
      const matchId = Number.parseInt(endpoint.split("/")[1]);

      if (isNaN(matchId)) {
        return NextResponse.json(
          { error: "Invalid match ID" },
          { status: 400 }
        );
      }

      // Get statistics for the match
      const statistics =
        mockMatchStatistics[matchId as keyof typeof mockMatchStatistics];

      // If we don't have mock data for this specific match ID, create some default statistics
      // This ensures we always return something even for unknown match IDs
      if (!statistics) {
        console.log(
          `No mock statistics found for match ID ${matchId}, using default statistics`
        );
        const defaultStats = {
          possession: { home: 50, away: 50 },
          shots: { home: 10, away: 10 },
          shotsOnTarget: { home: 5, away: 5 },
          corners: { home: 5, away: 5 },
          fouls: { home: 10, away: 10 },
          yellowCards: { home: 1, away: 1 },
          redCards: { home: 0, away: 0 },
        };

        return NextResponse.json({
          statistics: {
            periods: {
              ALL: {
                possession: {
                  home: defaultStats.possession.home,
                  away: defaultStats.possession.away,
                },
                totalShots: {
                  home: defaultStats.shots.home,
                  away: defaultStats.shots.away,
                },
                shotsOnTarget: {
                  home: defaultStats.shotsOnTarget.home,
                  away: defaultStats.shotsOnTarget.away,
                },
                corners: {
                  home: defaultStats.corners.home,
                  away: defaultStats.corners.away,
                },
                fouls: {
                  home: defaultStats.fouls.home,
                  away: defaultStats.fouls.away,
                },
                yellowCards: {
                  home: defaultStats.yellowCards.home,
                  away: defaultStats.yellowCards.away,
                },
                redCards: {
                  home: defaultStats.redCards.home,
                  away: defaultStats.redCards.away,
                },
              },
            },
          },
          usingMockData: true,
          isDefaultData: true,
        });
      }

      return NextResponse.json({
        statistics: {
          periods: {
            ALL: {
              possession: {
                home: statistics.possession.home,
                away: statistics.possession.away,
              },
              totalShots: {
                home: statistics.shots.home,
                away: statistics.shots.away,
              },
              shotsOnTarget: {
                home: statistics.shotsOnTarget.home,
                away: statistics.shotsOnTarget.away,
              },
              corners: {
                home: statistics.corners.home,
                away: statistics.corners.away,
              },
              fouls: {
                home: statistics.fouls.home,
                away: statistics.fouls.away,
              },
              yellowCards: {
                home: statistics.yellowCards.home,
                away: statistics.yellowCards.away,
              },
              redCards: {
                home: statistics.redCards.home,
                away: statistics.redCards.away,
              },
            },
          },
        },
        usingMockData: true,
      });
    }

    // Match lineups endpoint (e.g., match-lineups/10001)
    else if (endpoint.startsWith("match-lineups/")) {
      const matchId = Number.parseInt(endpoint.split("/")[1]);

      if (isNaN(matchId)) {
        return NextResponse.json(
          { error: "Invalid match ID" },
          { status: 400 }
        );
      }

      // For mock data, we'll return a simple lineup structure
      return NextResponse.json({
        home: {
          players: [
            { player: { name: "Player 1", position: "GK" } },
            { player: { name: "Player 2", position: "DF" } },
            { player: { name: "Player 3", position: "DF" } },
            { player: { name: "Player 4", position: "DF" } },
            { player: { name: "Player 5", position: "DF" } },
            { player: { name: "Player 6", position: "MF" } },
            { player: { name: "Player 7", position: "MF" } },
            { player: { name: "Player 8", position: "MF" } },
            { player: { name: "Player 9", position: "FW" } },
            { player: { name: "Player 10", position: "FW" } },
            { player: { name: "Player 11", position: "FW" } },
          ],
        },
        away: {
          players: [
            { player: { name: "Player 12", position: "GK" } },
            { player: { name: "Player 13", position: "DF" } },
            { player: { name: "Player 14", position: "DF" } },
            { player: { name: "Player 15", position: "DF" } },
            { player: { name: "Player 16", position: "DF" } },
            { player: { name: "Player 17", position: "MF" } },
            { player: { name: "Player 18", position: "MF" } },
            { player: { name: "Player 19", position: "MF" } },
            { player: { name: "Player 20", position: "FW" } },
            { player: { name: "Player 21", position: "FW" } },
            { player: { name: "Player 22", position: "FW" } },
          ],
        },
        usingMockData: true,
      });
    }

    // Match events endpoint (e.g., match-events/10001)
    else if (endpoint.startsWith("match-events/")) {
      const matchId = Number.parseInt(endpoint.split("/")[1]);

      if (isNaN(matchId)) {
        return NextResponse.json(
          { error: "Invalid match ID" },
          { status: 400 }
        );
      }

      // For mock data, we'll return some sample events
      return NextResponse.json({
        incidents: [
          {
            time: 10,
            isHome: true,
            player: { name: "Player 9" },
            incidentType: "goal",
            incidentClass: "regular",
          },
          {
            time: 23,
            isHome: false,
            player: { name: "Player 20" },
            incidentType: "card",
            incidentClass: "yellow",
          },
          {
            time: 45,
            isHome: false,
            player: { name: "Player 21" },
            incidentType: "goal",
            incidentClass: "regular",
          },
          {
            time: 67,
            isHome: true,
            player: { name: "Player 7" },
            incidentType: "card",
            incidentClass: "red",
          },
          {
            time: 78,
            isHome: true,
            player: { name: "Player 10" },
            incidentType: "penalty",
            incidentClass: "scored",
          },
        ],
        usingMockData: true,
      });
    }

    // Unknown endpoint
    else {
      return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in mock SofaScore API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
