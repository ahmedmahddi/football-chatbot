import ChatInterface from "@/components/chat-interface"
import LiveMatches from "@/components/live-matches"
import NewsSection from "@/components/news-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Chatbot Interface (Left 3/4 on desktop) */}
        <div className="md:col-span-3 h-[calc(100vh-3rem)] order-2 md:order-1">
          <ChatInterface />
        </div>

        {/* Sidebar (Right 1/4 on desktop) */}
        <div className="md:col-span-1 flex flex-col gap-4 order-1 md:order-2 h-[calc(100vh-3rem)]">
          {/* Live Matches Section (Top half of sidebar) */}
          <div className="h-1/2">
            <LiveMatches />
          </div>

          {/* News Section (Bottom half of sidebar) */}
          <div className="h-1/2">
            <NewsSection />
          </div>
        </div>
      </div>
    </main>
  )
}
