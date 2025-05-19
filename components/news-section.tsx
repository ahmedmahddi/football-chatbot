"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, ExternalLink } from "lucide-react"

// Mock data for news
const initialNews = [
  {
    id: 1,
    title: "Messi scores hat-trick in 4-0 win",
    source: "BBC Sport",
    time: "2h ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 19, 2025",
  },
  {
    id: 2,
    title: "Premier League title race heats up with dramatic late winner",
    source: "Sky Sports",
    time: "5h ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 19, 2025",
  },
  {
    id: 3,
    title: "Ronaldo breaks another scoring record with stunning free kick",
    source: "ESPN",
    time: "8h ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 18, 2025",
  },
  {
    id: 4,
    title: "Liverpool sign promising young defender in €45m deal",
    source: "The Athletic",
    time: "12h ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 18, 2025",
  },
  {
    id: 5,
    title: "Champions League draw announced: Barcelona to face Bayern Munich",
    source: "UEFA",
    time: "1d ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 17, 2025",
  },
  {
    id: 6,
    title: "England manager announces squad for upcoming internationals",
    source: "BBC Sport",
    time: "1d ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 17, 2025",
  },
  {
    id: 7,
    title: "Manchester City complete signing of Brazilian wonderkid",
    source: "Sky Sports",
    time: "2d ago",
    thumbnail: "/placeholder.svg?height=80&width=80",
    date: "May 16, 2025",
  },
]

export default function NewsSection() {
  const [news] = useState(initialNews)
  const [visibleNews, setVisibleNews] = useState(3)

  const loadMore = () => {
    setVisibleNews((prev) => Math.min(prev + 2, news.length))
  }

  return (
    <div className="h-full bg-gray-900 overflow-y-auto rounded-lg shadow-lg">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">Latest News</h2>
      </div>

      <div className="p-3 space-y-3">
        {news.slice(0, visibleNews).map((item) => (
          <div
            key={item.id}
            className="flex items-start p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all cursor-pointer shadow-md transform hover:scale-[1.02]"
          >
            <div className="flex-shrink-0 mr-3 rounded-lg overflow-hidden">
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt=""
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-white font-medium leading-tight">{item.title}</h3>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <span className="font-medium text-blue-400">{item.source}</span>
                <span className="mx-1">•</span>
                <span className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {item.date}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400 flex items-center">
                <span>{item.time}</span>
                <ExternalLink size={12} className="ml-1 text-gray-500" />
              </div>
            </div>
          </div>
        ))}

        {visibleNews < news.length && (
          <button
            onClick={loadMore}
            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors font-medium"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  )
}
