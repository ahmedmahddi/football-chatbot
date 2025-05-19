import { NextResponse } from "next/server"

// This route allows the frontend to check if we should use SofaScore
export async function GET() {
  // We're using direct SofaScore API now, so we'll always return true
  return NextResponse.json({
    hasApiKey: true,
    message: "Using direct SofaScore API",
  })
}
