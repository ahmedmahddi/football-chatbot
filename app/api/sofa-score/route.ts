import { NextResponse } from "next/server"

// This is a server-side route handler that acts as a proxy to SofaScore
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 })
  }

  try {
    // Base URL for SofaScore API
    const baseUrl = "https://api.sofascore.com/api/v1"
    const url = `${baseUrl}/${endpoint}`

    console.log(`Fetching from SofaScore: ${url}`)

    const response = await fetch(url, {
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
    })

    if (!response.ok) {
      console.error(`SofaScore API error: ${response.status} ${response.statusText}`)
      throw new Error(`SofaScore API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from SofaScore:", error)
    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch data from SofaScore",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
      },
      { status: 500 },
    )
  }
}
