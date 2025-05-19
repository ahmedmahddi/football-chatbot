import { NextResponse } from "next/server"

// This route allows the frontend to check if we have an API key
export async function GET() {
  const hasApiKey = process.env.FOOTBALL_DATA_API_KEY !== undefined && process.env.FOOTBALL_DATA_API_KEY !== ""

  return NextResponse.json({
    hasApiKey,
    message: hasApiKey
      ? "Football-Data.org API key is configured"
      : "No Football-Data.org API key found, using mock data",
  })
}
