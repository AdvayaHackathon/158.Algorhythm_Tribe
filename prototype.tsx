"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import Link from "next/link"
import ItineraryDisplay from "@/components/itinerary-display"

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [itinerary, setItinerary] = useState<any>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content:
          "Welcome to your Cultural Itinerary Planner! I'm your AI travel assistant for India. I can help you plan your trip, suggest attractions based on your interests, and answer questions about Indian culture and destinations. How can I assist you today?",
      },
    ],
    onFinish: (message) => {
      if (message.content.includes("ITINERARY_DATA:")) {
        try {
          const itineraryMatch = message.content.match(/ITINERARY_DATA:(.*?)END_ITINERARY_DATA/s)
          if (itineraryMatch && itineraryMatch[1]) {
            const parsedItinerary = JSON.parse(itineraryMatch[1].trim())
            setItinerary(parsedItinerary)
            setActiveTab("itinerary")
          }
        } catch (error) {
          console.error("Failed to parse itinerary data:", error)
        }
      }
    },
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-orange-800 mb-8 text-center">Your Cultural Itinerary Assistant</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
            <TabsTrigger value="itinerary" disabled={!itinerary}>
              Your Itinerary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl text-orange-800">Chat with your Cultural Travel Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[60vh] overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-white">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 space-y-2 ${
                          message.role === "user" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.content.includes("/images/") ? (
                          <img src={message.content} alt="Chat Image" className="rounded w-full h-40 object-cover" />
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 text-gray-800 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about destinations, cultural experiences, or request an itinerary..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Create a 2-day itinerary for Jaipur", "Best street food in Delhi?", "Cultural festivals in Kerala", "Hidden gems in Varanasi", "Family-friendly activities in Mumbai", "Spiritual experiences in Rishikesh"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => {
                        handleInputChange({ target: { value: suggestion } } as any)
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary">
            {itinerary && <ItineraryDisplay itinerary={itinerary} showImages={true} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
