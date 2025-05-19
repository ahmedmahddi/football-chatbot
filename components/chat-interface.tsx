"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ClubIcon as Football, Send, User, Bot, Clock } from "lucide-react"

// Define message type
type Message = {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

// Define match info type
type MatchInfo = {
  id: number
  homeTeam: string
  awayTeam: string
  score: string
  time: string
  tournament: string
  status?: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your football assistant. Ask me anything about football matches, stats, or news!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<MatchInfo | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  // Rate limiter removed
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Rate limiter functionality removed

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Listen for match selection events
  useEffect(() => {
    // Check if there's a selected match in localStorage
    const storedMatch = localStorage.getItem("selectedMatch")
    if (storedMatch) {
      try {
        setSelectedMatch(JSON.parse(storedMatch))
      } catch (e) {
        console.error("Error parsing stored match:", e)
      }
    }

    // Listen for match selection events
    const handleMatchSelected = (event: CustomEvent<MatchInfo>) => {
      setSelectedMatch(event.detail)

      // Add a message about the selected match
      const matchMessage: Message = {
        id: messages.length + 1,
        text: `You've selected the match: ${event.detail.homeTeam} vs ${event.detail.awayTeam}. Ask me anything about this match!`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, matchMessage])
    }

    // Add event listener
    window.addEventListener("matchSelected", handleMatchSelected as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("matchSelected", handleMatchSelected as EventListener)
    }
  }, [messages.length])

  // Function to fetch match details from SofaScore
  const fetchSofaScoreMatchDetails = async (matchId: number) => {
    try {
      console.log(`Fetching SofaScore match details for match ID ${matchId}...`)
      // Use the updated endpoint format that matches our API route
      const response = await fetch(`/api/sofascore?endpoint=match/${matchId}`)

      if (!response.ok) {
        throw new Error(`SofaScore API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("SofaScore match details:", data)

      // Check if we're using mock data
      setUsingMockData(!!data.usingMockData)

      return data
    } catch (error) {
      console.error("Error fetching SofaScore match details:", error)
      return null
    }
  }

  // Function to fetch match statistics from SofaScore
  const fetchSofaScoreMatchStatistics = async (matchId: number) => {
    try {
      console.log(`Fetching SofaScore match statistics for match ID ${matchId}...`)
      const response = await fetch(`/api/sofascore?endpoint=match-statistics/${matchId}`)

      if (!response.ok) {
        throw new Error(`SofaScore API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setUsingMockData(!!data.usingMockData)
      return data
    } catch (error) {
      console.error("Error fetching SofaScore match statistics:", error)
      return null
    }
  }

  // Function to fetch match lineups from SofaScore
  const fetchSofaScoreMatchLineups = async (matchId: number) => {
    try {
      console.log(`Fetching SofaScore match lineups for match ID ${matchId}...`)
      const response = await fetch(`/api/sofascore?endpoint=match-lineups/${matchId}`)

      if (!response.ok) {
        throw new Error(`SofaScore API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setUsingMockData(!!data.usingMockData)
      return data
    } catch (error) {
      console.error("Error fetching SofaScore match lineups:", error)
      return null
    }
  }

  // Function to fetch match events from SofaScore
  const fetchSofaScoreMatchEvents = async (matchId: number) => {
    try {
      console.log(`Fetching SofaScore match events for match ID ${matchId}...`)
      const response = await fetch(`/api/sofascore?endpoint=match-events/${matchId}`)

      if (!response.ok) {
        throw new Error(`SofaScore API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setUsingMockData(!!data.usingMockData)
      return data
    } catch (error) {
      console.error("Error fetching SofaScore match events:", error)
      return null
    }
  }

  // Function to generate a response about the selected match
  const generateMatchResponse = async (query: string, matchInfo: MatchInfo) => {
    console.log(`Generating response for query: "${query}" about match ID ${matchInfo.id}`)

    // Fetch match details from SofaScore
    let matchDetails = null
    let matchStatistics = null
    let matchLineups = null
    let matchEvents = null

    // Fetch data from SofaScore
    matchDetails = await fetchSofaScoreMatchDetails(matchInfo.id)

    // Only fetch additional data if needed based on the query
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("stats") || lowerQuery.includes("statistics")) {
      matchStatistics = await fetchSofaScoreMatchStatistics(matchInfo.id)
      console.log("Fetched match statistics:", matchStatistics)
    }
    if (lowerQuery.includes("lineup") || lowerQuery.includes("players")) {
      matchLineups = await fetchSofaScoreMatchLineups(matchInfo.id)
      console.log("Fetched match lineups:", matchLineups)
    }
    if (lowerQuery.includes("events") || lowerQuery.includes("goals") || lowerQuery.includes("cards")) {
      matchEvents = await fetchSofaScoreMatchEvents(matchInfo.id)
      console.log("Fetched match events:", matchEvents)
    }

    // Simple keyword-based response system
    if (lowerQuery.includes("score") || lowerQuery.includes("result")) {
      return `The current score is ${matchInfo.homeTeam} ${matchInfo.score} ${matchInfo.awayTeam} (${matchInfo.time}).`
    }

    if (lowerQuery.includes("time") || lowerQuery.includes("when") || lowerQuery.includes("how long")) {
      return `The match is currently at ${matchInfo.time}.`
    }

    if (lowerQuery.includes("tournament") || lowerQuery.includes("league") || lowerQuery.includes("competition")) {
      return `This match is part of the ${matchInfo.tournament}.`
    }

    if (lowerQuery.includes("team") || lowerQuery.includes("playing") || lowerQuery.includes("who")) {
      return `The match is between ${matchInfo.homeTeam} (home) and ${matchInfo.awayTeam} (away).`
    }

    if (lowerQuery.includes("lineup") || lowerQuery.includes("players")) {
      if (matchLineups) {
        try {
          // Format lineups from SofaScore data
          const homeLineup =
            matchLineups.home?.players
              ?.map((p: any) => `${p.player.name} (${p.player.position || "Unknown"})`)
              .join(", ") || "Not available"

          const awayLineup =
            matchLineups.away?.players
              ?.map((p: any) => `${p.player.name} (${p.player.position || "Unknown"})`)
              .join(", ") || "Not available"

          return `
Home team (${matchInfo.homeTeam}) lineup: ${homeLineup}

Away team (${matchInfo.awayTeam}) lineup: ${awayLineup}
          `
        } catch (error) {
          console.error("Error parsing lineups:", error)
        }
      }

      return `I'm sorry, detailed lineup information is not available for this match.`
    }

    if (lowerQuery.includes("stats") || lowerQuery.includes("statistics")) {
      if (matchStatistics) {
        try {
          // Format statistics from SofaScore data
          const stats = matchStatistics.statistics.periods.ALL

          if (stats) {
            return `Match Statistics for ${matchInfo.homeTeam} vs ${matchInfo.awayTeam}:Possession: ${stats.possession?.home || "?"}% - ${stats.possession?.away || "?"}%Shots: ${stats.totalShots?.home || "?"} - ${stats.totalShots?.away || "?"}Shots on target: ${stats.shotsOnTarget?.home || "?"} - ${stats.shotsOnTarget?.away || "?"}Corners: ${stats.corners?.home || "?"} - ${stats.corners?.away || "?"}Fouls: ${stats.fouls?.home || "?"} - ${stats.fouls?.away || "?"}Yellow cards: ${stats.yellowCards?.home || "?"} - ${stats.yellowCards?.away || "?"}Red cards: ${stats.redCards?.home || "?"} - ${stats.redCards?.away || "?"}`
          }
        } catch (error) {
          console.error("Error parsing statistics:", error)
        }
      }

      return `Detailed statistics are not available for this match yet.`
    }

    if (lowerQuery.includes("events") || lowerQuery.includes("goals") || lowerQuery.includes("cards")) {
      if (matchEvents) {
        try {
          // Format events from SofaScore data
          const events = matchEvents.incidents || []

          if (events.length > 0) {
            const formattedEvents = events
              .filter(
                (event: any) =>
                  event.incidentType === "goal" || event.incidentType === "card" || event.incidentType === "penalty",
              )
              .map((event: any) => {
                const team = event.isHome ? matchInfo.homeTeam : matchInfo.awayTeam
                const player = event.player?.name || "Unknown player"
                const minute = event.time || "?"

                if (event.incidentType === "goal") {
                  return `${minute}' - ⚽ Goal for ${team} by ${player}`
                } else if (event.incidentType === "card") {
                  const cardType = event.incidentClass === "yellow" ? "🟨" : "🟥"
                  return `${minute}' - ${cardType} ${event.incidentClass.toUpperCase()} card for ${player} (${team})`
                } else if (event.incidentType === "penalty") {
                  const result = event.incidentClass === "scored" ? "✅ scored" : "❌ missed"
                  return `${minute}' - Penalty ${result} by ${player} (${team})`
                }
                return null
              })
              .filter(Boolean)
              .join("\n")

            if (formattedEvents) {
              return `
Match Events for ${matchInfo.homeTeam} vs ${matchInfo.awayTeam}:

${formattedEvents}
              `
            }
          }
        } catch (error) {
          console.error("Error parsing events:", error)
        }
      }

      return `I'm sorry, detailed match events are not available for this match.`
    }

    if (lowerQuery.includes("status") || lowerQuery.includes("live")) {
      const status = matchInfo.status || "LIVE"
      let statusText = "live"

      switch (status) {
        case "SCHEDULED":
        case "TIMED":
          statusText = "scheduled to start soon"
          break
        case "IN_PLAY":
        case "LIVE":
          statusText = "currently live"
          break
        case "PAUSED":
        case "HALF_TIME":
          statusText = "at half-time"
          break
        case "FINISHED":
        case "FULL_TIME":
          statusText = "finished"
          break
        case "POSTPONED":
          statusText = "postponed"
          break
        case "CANCELLED":
          statusText = "cancelled"
          break
        case "SUSPENDED":
          statusText = "suspended"
          break
      }

      return `The match between ${matchInfo.homeTeam} and ${matchInfo.awayTeam} is ${statusText}.`
    }

    // Default response
    return `This is a ${matchInfo.tournament} match between ${matchInfo.homeTeam} and ${matchInfo.awayTeam}. The current score is ${matchInfo.score} and the match is at ${matchInfo.time}. Ask me about the score, time, teams, lineups, statistics, or match events!`
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Generate response
    let responseText = ""

    // If there's a selected match and the query seems related to it
    if (selectedMatch) {
      responseText = await generateMatchResponse(inputValue, selectedMatch)
    } else {
      // If no match is selected, provide a helpful response
      const lowerQuery = inputValue.toLowerCase()

      if (
        lowerQuery.includes("match") ||
        lowerQuery.includes("game") ||
        lowerQuery.includes("score") ||
        lowerQuery.includes("team") ||
        lowerQuery.includes("playing")
      ) {
        responseText =
          "To get information about a specific match, please select one from the live matches panel on the right. Then you can ask me about scores, lineups, statistics, and more!"
      } else if (lowerQuery.includes("help") || lowerQuery.includes("what can you do")) {
        responseText = `I can help you with information about football matches! Here's what you can do:
      
1. Select a live match from the panel on the right
2. Ask me about that match's score, time, teams, lineups, statistics, or events
3. Get general football information and news

Try selecting a match first to get the most out of our conversation!`
      } else {
        // Generic football responses if no match is selected and query isn't about matches
        const genericResponses = [
          "Manchester United is currently 5th in the Premier League table with 53 points.",
          "The Champions League final will be held at Wembley Stadium on June 1st, 2025.",
          "Lionel Messi has scored 807 goals in his professional career so far.",
          "The next World Cup will be hosted by the USA, Mexico, and Canada in 2026.",
          "Real Madrid has won the Champions League a record 14 times.",
          "To get specific match information, please select a match from the live matches panel.",
        ]
        responseText = genericResponses[Math.floor(Math.random() * genericResponses.length)]
      }
    }

    // Add bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)

      // Focus the input after sending
      inputRef.current?.focus()
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800 relative rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="p-4 bg-gradient-to-r from-green-900 to-gray-800 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Football className="mr-2" /> Football Chat Assistant
            {usingMockData && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Demo</span>}
          </h1>

          {/* Rate limiter indicator removed */}
        </div>

        {selectedMatch && (
          <div className="mt-3 text-sm text-green-100 bg-green-800/50 p-3 rounded-lg flex items-center">
            <Football className="mr-2 h-4 w-4" />
            <span>
              Selected match:{" "}
              <span className="font-semibold">
                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </span>{" "}
              ({selectedMatch.score})
            </span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-xl p-4 shadow-md ${message.sender === "user"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                : "bg-gradient-to-r from-gray-700 to-gray-800 text-white"
                }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === "user" ? (
                  <User size={14} className="mr-1 text-blue-300" />
                ) : (
                  <Bot size={14} className="mr-1 text-green-300" />
                )}
                <span className={`text-xs ${message.sender === "user" ? "text-blue-300" : "text-green-300"}`}>
                  {message.sender === "user" ? "You" : "Football Assistant"}
                </span>
              </div>
              <p className="whitespace-pre-line">{message.text}</p>
              <p className="text-xs opacity-70 mt-2 text-right">{formatTime(message.timestamp)}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-4 flex items-center shadow-md">
              <Football className="animate-spin mr-2" size={16} />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center bg-gray-700 rounded-xl overflow-hidden shadow-inner">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedMatch
                ? `Ask about the ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam} match...`
                : "Ask about football matches, stats, or news..."
            }
            className="flex-1 bg-transparent text-white p-4 focus:outline-none resize-none min-h-[50px] max-h-[120px]"
            rows={1}
            aria-label="Message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ""}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Rate limiter message removed */}
      </div>
    </div>
  )
}
