"use client"

import { useState, useEffect } from "react"
import { RefreshCw, AlertCircle, Info, Clock } from "lucide-react"
import Image from "next/image"

// Define types for SofaScore API
type SofaScoreTeam = {
  id: number
  name: string
  shortName?: string
  slug?: string
  sport?: {
    id: number
    name: string
  }
}

type SofaScoreScore = {
  current: number
  display: number
  period1: number
  period2: number
  normaltime: number
}

type SofaScoreStatus = {
  code: number
  description: string
  type: string
}

type SofaScoreTournament = {
  id: number
  name: string
  slug: string
  uniqueTournament: {
    id: number
    name: string
    slug: string
    category: {
      id: number
      name: string
      slug: string
    }
  }
}

type SofaScoreMatch = {
  id: number
  homeTeam: SofaScoreTeam
  awayTeam: SofaScoreTeam
  homeScore: SofaScoreScore
  awayScore: SofaScoreScore
  status: SofaScoreStatus
  tournament: SofaScoreTournament
  time?: {
    currentPeriodStartTimestamp: number
  }
  startTimestamp: number
}

export default function LiveMatches() {
  const [matches, setMatches] = useState<SofaScoreMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  // Function to format time remaining
  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return "Ready"

    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Update time remaining every second
  useEffect(() => {
    if (!nextRefreshTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = nextRefreshTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Ready")
        clearInterval(interval)
      } else {
        setTimeRemaining(formatTimeRemaining(diff))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nextRefreshTime])

  // Check if we have a stored refresh time in localStorage
  useEffect(() => {
    const storedRefreshTime = localStorage.getItem("nextSofaScoreRefreshTime")
    if (storedRefreshTime) {
      const refreshTime = new Date(storedRefreshTime)
      const now = new Date()

      if (refreshTime > now) {
        setNextRefreshTime(refreshTime)
        setTimeRemaining(formatTimeRemaining(refreshTime.getTime() - now.getTime()))
      }
    }
  }, [])

  // Function to fetch live matches from SofaScore
  const fetchSofaScoreLiveMatches = async () => {
    // Check if we need to wait before refreshing
    const now = new Date()
    if (nextRefreshTime && now < nextRefreshTime) {
      const timeToWait = nextRefreshTime.getTime() - now.getTime()
      console.log(`Need to wait ${formatTimeRemaining(timeToWait)} before next refresh`)
      setError(`Please wait ${formatTimeRemaining(timeToWait)} before refreshing`)
      return
    }

    try {
      setIsRefreshing(true)
      setError(null)

      console.log("Fetching live matches from SofaScore...")

      // Fetch live football matches
      const response = await fetch("/api/sofascore?endpoint=live-matches")

      if (!response.ok) {
        throw new Error(`SofaScore API responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Check if we're using mock data
      setUsingMockData(!!data.usingMockData)

      // Extract and format the matches
      if (data.events && Array.isArray(data.events)) {
        console.log(`Found ${data.events.length} live matches from SofaScore`)

        // Filter out events that don't have proper match data
        const validMatches = data.events.filter(
          (match: any) => match.homeTeam && match.awayTeam && match.homeScore && match.awayScore && match.status,
        )

        setMatches(validMatches)

        // If no matches are found, show a message
        if (validMatches.length === 0) {
          setError("No live matches currently in progress")
        } else {
          setError(null)
        }
      } else {
        throw new Error("No live matches found or unexpected format")
      }

      // Set next refresh time to 10 minutes from now
      const refreshTime = new Date()
      refreshTime.setMinutes(refreshTime.getMinutes() + 10)
      setNextRefreshTime(refreshTime)
      setTimeRemaining(formatTimeRemaining(10 * 60 * 1000))

      // Store the refresh time in localStorage so it persists across components
      localStorage.setItem("nextSofaScoreRefreshTime", refreshTime.toISOString())
    } catch (error) {
      console.error("Error fetching matches from SofaScore:", error)
      setError("Failed to load matches")

      // Try to load mock data if real data fails
      try {
        const mockResponse = await fetch("/api/sofascore?endpoint=live-matches&useMock=true")
        const mockData = await mockResponse.json()

        if (mockData.events && Array.isArray(mockData.events)) {
          setMatches(mockData.events)
          setError("Using demo data (API error)")
          setUsingMockData(true)

          // Set next refresh time to 10 minutes from now even for mock data
          const refreshTime = new Date()
          refreshTime.setMinutes(refreshTime.getMinutes() + 10)
          setNextRefreshTime(refreshTime)
          setTimeRemaining(formatTimeRemaining(10 * 60 * 1000))
          localStorage.setItem("nextSofaScoreRefreshTime", refreshTime.toISOString())
        }
      } catch (mockError) {
        console.error("Error fetching mock data:", mockError)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Function to fetch live matches based on available APIs
  const fetchLiveMatches = async () => {
    await fetchSofaScoreLiveMatches()
  }

  // Initial fetch
  useEffect(() => {
    fetchLiveMatches()

    // Don't set up an interval since we now have a 10-minute timeout
    // The user will need to manually refresh
  }, [])

  // Function to handle match selection
  const handleMatchSelect = (match: SofaScoreMatch) => {
    setSelectedMatchId(match.id)

    // Create a chat message about the selected match
    const matchInfo = {
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: `${match.homeScore.current}-${match.awayScore.current}`,
      time: match.status.description,
      tournament: match.tournament.uniqueTournament.name,
      status: match.status.type,
    }

    // Store the selected match in localStorage for the chat component to use
    localStorage.setItem("selectedMatch", JSON.stringify(matchInfo))

    // Dispatch a custom event that the chat component can listen for
    const event = new CustomEvent("matchSelected", { detail: matchInfo })
    window.dispatchEvent(event)
  }

  // Format match status
  const formatMatchStatus = (status: SofaScoreStatus) => {
    // SofaScore status codes
    // 0: Not started
    // 1: In progress
    // 2: Halftime
    // 3: Finished
    // 4: Postponed
    // 5: Cancelled
    // 6: Interrupted
    // 7: Abandoned
    // 8: Coverage lost
    // 9: About to start

    switch (status.code) {
      case 0:
        return "Not started"
      case 1:
        return status.description || "Live"
      case 2:
        return "HT"
      case 3:
        return "FT"
      case 4:
        return "Postponed"
      case 5:
        return "Cancelled"
      case 6:
        return "Interrupted"
      case 7:
        return "Abandoned"
      case 8:
        return "Coverage lost"
      case 9:
        return "Starting soon"
      default:
        return status.description || "Unknown"
    }
  }

  // Get team logo URL
  const getTeamLogoUrl = (team: SofaScoreTeam) => {
    if (usingMockData) {
      return `/placeholder.svg?height=24&width=24`
    }

    // For real SofaScore data, construct the logo URL
    return `https://api.sofascore.app/api/v1/team/${team.id}/image`
  }

  // Handle refresh button click
  const handleRefresh = () => {
    const now = new Date()
    if (nextRefreshTime && now < nextRefreshTime) {
      // If we need to wait, just show an error
      const timeToWait = formatTimeRemaining(nextRefreshTime.getTime() - now.getTime())
      setError(`Please wait ${timeToWait} before refreshing`)
      return
    }

    fetchLiveMatches()
  }

  return (
    <div className="h-full bg-gray-900 overflow-y-auto rounded-lg shadow-lg">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white font-bold text-lg flex items-center">
          Live Matches
          {usingMockData && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Demo</span>}
        </h2>
        <div className="flex items-center gap-2">
          {nextRefreshTime && (
            <div className="text-xs text-gray-300 flex items-center mr-2">
              <Clock size={12} className="mr-1" />
              {timeRemaining}
            </div>
          )}
          <button
            onClick={handleRefresh}
            className={`text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 p-1.5 rounded-full transition-all ${
              isRefreshing ? "opacity-50" : ""
            }`}
            disabled={isRefreshing || (nextRefreshTime && new Date() < nextRefreshTime)}
            aria-label="Refresh matches"
            title={
              nextRefreshTime && new Date() < nextRefreshTime ? `Wait ${timeRemaining} to refresh` : "Refresh matches"
            }
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {usingMockData && (
        <div className="px-4 py-2 bg-blue-900/50 text-blue-100 text-xs flex items-center justify-between">
          <div className="flex items-center">
            <Info size={12} className="mr-1 flex-shrink-0" />
            <span>Using demo data</span>
          </div>
          {nextRefreshTime && <div className="text-xs">Next update: {timeRemaining}</div>}
        </div>
      )}

      <div className="p-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse flex flex-col items-center">
              <RefreshCw size={24} className="text-gray-400 animate-spin mb-2" />
              <p className="text-gray-400">Loading matches...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg">
            <AlertCircle size={24} className="text-amber-400 mb-2" />
            <p className="text-amber-400 text-center">{error}</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg">
            <Info size={24} className="text-gray-400 mb-2" />
            <p className="text-gray-400 text-center">No live matches found</p>
          </div>
        ) : (
          matches.slice(0, 5).map((match) => (
            <div
              key={match.id}
              className={`bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 hover:from-gray-700 hover:to-gray-600 transition-all cursor-pointer shadow-md transform hover:scale-[1.02] ${
                selectedMatchId === match.id ? "ring-2 ring-blue-500 scale-[1.02]" : ""
              }`}
              onClick={() => handleMatchSelect(match)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-300 font-medium bg-gray-700/50 px-2 py-0.5 rounded-full">
                  {match.tournament.uniqueTournament.name}
                </span>
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                  LIVE
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                    <Image
                      src={getTeamLogoUrl(match.homeTeam) || "/placeholder.svg"}
                      alt={match.homeTeam.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm text-white font-medium truncate">{match.homeTeam.name}</span>
                </div>

                <div className="mx-2 px-3 py-1 bg-gray-800/80 rounded-lg">
                  <div className="text-lg font-bold text-white">
                    {match.homeScore.current}-{match.awayScore.current}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-1 justify-end">
                  <span className="text-sm text-white font-medium truncate">{match.awayTeam.name}</span>
                  <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                    <Image
                      src={getTeamLogoUrl(match.awayTeam) || "/placeholder.svg"}
                      alt={match.awayTeam.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-300 font-medium bg-gray-800/50 px-2 py-0.5 rounded-full">
                  {formatMatchStatus(match.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
