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
  id?: number
  name?: string
  slug?: string
  uniqueTournament?: {
    id?: number
    name?: string
    slug?: string
    category?: {
      id?: number
      name?: string
      slug?: string
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
      setTimeRemaining(formatTimeRemaining(diff))
    }, 1000)

    return () => clearInterval(interval)
  }, [nextRefreshTime])

  // Check stored refresh time
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

  // Fetch live matches
  const fetchSofaScoreLiveMatches = async () => {
    const now = new Date()
    if (nextRefreshTime && now < nextRefreshTime) {
      const timeToWait = nextRefreshTime.getTime() - now.getTime()
      setError(`Please wait ${formatTimeRemaining(timeToWait)} before refreshing`)
      return
    }

    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch("/api/sofascore?endpoint=live-matches")
      if (!response.ok) throw new Error(`SofaScore API responded with status: ${response.status}`)

      const data = await response.json()
      setUsingMockData(!!data.usingMockData)

      if (data.events && Array.isArray(data.events)) {
        const validMatches = data.events.filter(
          (match: any) => match.homeTeam && match.awayTeam && match.homeScore && match.awayScore && match.status,
        )
        setMatches(validMatches)
        if (validMatches.length === 0) setError("No live matches currently in progress")
      } else {
        throw new Error("No live matches found or unexpected format")
      }

      const refreshTime = new Date()
      refreshTime.setMinutes(refreshTime.getMinutes() + 10)
      setNextRefreshTime(refreshTime)
      setTimeRemaining(formatTimeRemaining(10 * 60 * 1000))
      localStorage.setItem("nextSofaScoreRefreshTime", refreshTime.toISOString())
    } catch (error) {
      console.error("Error fetching matches from SofaScore:", error)
      setError("Failed to load matches")

      try {
        const mockResponse = await fetch("/api/sofascore?endpoint=live-matches&useMock=true")
        const mockData = await mockResponse.json()
        if (mockData.events && Array.isArray(mockData.events)) {
          setMatches(mockData.events)
          setError("Using demo data (API error)")
          setUsingMockData(true)
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

  const fetchLiveMatches = async () => {
    await fetchSofaScoreLiveMatches()
  }

  useEffect(() => {
    fetchLiveMatches()
  }, [])

  const handleMatchSelect = (match: SofaScoreMatch) => {
    setSelectedMatchId(match.id)
    const matchInfo = {
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: `${match.homeScore.current}-${match.awayScore.current}`,
      time: match.status.description,
      tournament: match.tournament?.uniqueTournament?.name ?? match.tournament?.name ?? "Unknown Tournament",
      status: match.status.type,
    }
    localStorage.setItem("selectedMatch", JSON.stringify(matchInfo))
    window.dispatchEvent(new CustomEvent("matchSelected", { detail: matchInfo }))
  }

  const formatMatchStatus = (status: SofaScoreStatus) => {
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

  const getTeamLogoUrl = (team: SofaScoreTeam) => {
    if (usingMockData) return `/placeholder.svg?height=24&width=24`
    return `https://api.sofascore.app/api/v1/team/${team.id}/image`
  }

  const handleRefresh = () => {
    const now = new Date()
    if (nextRefreshTime && now < nextRefreshTime) {
      const timeToWait = nextRefreshTime.getTime() - now.getTime()
      setError(`Please wait ${formatTimeRemaining(timeToWait)} before refreshing`)
      return
    }
    fetchLiveMatches()
  }

  return (
    <div className="h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white font-semibold text-xl flex items-center gap-2">
          Live Matches
          {usingMockData && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Demo Mode</span>}
        </h2>
        <div className="flex items-center gap-3">
          {nextRefreshTime && (
            <div className="text-sm text-gray-200 bg-gray-700/50 px-2 py-1 rounded-full flex items-center gap-1">
              <Clock size={14} />
              <span>{timeRemaining}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white transition-colors duration-200 ${isRefreshing || (nextRefreshTime && new Date() < nextRefreshTime) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isRefreshing || (nextRefreshTime && new Date() < nextRefreshTime)}
            aria-label="Refresh matches"
            title={
              nextRefreshTime && new Date() < nextRefreshTime
                ? `Wait ${timeRemaining} to refresh`
                : "Refresh matches"
            }
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Mock Data Banner */}
      {usingMockData && (
        <div className="px-4 py-2 bg-blue-600/20 text-blue-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Info size={14} />
            <span>Showing demo data due to API limits</span>
          </div>
          {nextRefreshTime && (
            <span className="text-xs bg-blue-700/50 px-2 py-1 rounded-full">Next: {timeRemaining}</span>
          )}
        </div>
      )}

      {/* Match List */}
      <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <RefreshCw size={28} className="animate-spin mb-2" />
            <p className="text-sm font-medium">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 rounded-lg p-6">
            <AlertCircle size={28} className="text-amber-400 mb-2" />
            <p className="text-amber-400 text-sm font-medium text-center">{error}</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 rounded-lg p-6">
            <Info size={28} className="text-gray-400 mb-2" />
            <p className="text-gray-400 text-sm font-medium text-center">No live matches available</p>
          </div>
        ) : (
          matches.slice(0, 10).map((match) => (
            <div
              key={match.id}
              className={`bg-gray-800 rounded-lg p-3 shadow-md hover:bg-gray-700/80 transition-all duration-200 cursor-pointer ${selectedMatchId === match.id ? "ring-2 ring-blue-500" : ""
                }`}
              onClick={() => handleMatchSelect(match)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-full">
                  {match.tournament?.uniqueTournament?.name ?? match.tournament?.name ?? "Unknown Tournament"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${match.status.code === 7 ? "bg-red-500 text-white" : "bg-red-500 text-white animate-pulse"
                    }`}
                >
                  {formatMatchStatus(match.status)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-600 rounded-full overflow-hidden">
                    <Image
                      src={getTeamLogoUrl(match.homeTeam) || "/placeholder.svg"}
                      alt={match.homeTeam.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm text-white font-medium truncate">
                    {match.homeTeam.shortName ?? match.homeTeam.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-white">
                  {match.homeScore.current}-{match.awayScore.current}
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-white font-medium truncate text-right">
                    {match.awayTeam.shortName ?? match.awayTeam.name}
                  </span>
                  <div className="w-6 h-6 bg-gray-600 rounded-full overflow-hidden">
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}