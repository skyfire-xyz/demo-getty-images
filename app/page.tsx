"use client"

import { useState } from "react"
import { useChat } from "ai/react"

import { useGettyImages } from "@/lib/getty-images/context"
import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context"

import AIChatUI from "./components/ai-chat/ai-chat-ui"
import ImagesSearchWithPagination from "./components/getty-image-search-with-pagination"
import { SearchInfo } from "./components/search-info"
import { TwoPanelLayout } from "./components/two-panel-layout"

export default function IndexPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { searchImages, searchTerm, setSearchTerm } = useGettyImages()
  const { localAPIKey } = useSkyfireAPIKey()

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    try {
      await searchImages(term, 1, 30) // Assuming 30 items per page
    } catch (error) {
      console.error("Error performing search:", error)
    }
  }

  const handleAIResponse = (content: string) => {
    const searchRegex =
      /I'll search for images of (.*?)\. Here's what I found:/i
    const match = content.match(searchRegex)
    if (match) {
      const searchQuery = match[1].trim()
      handleSearch(searchQuery)
    }
  }

  const aiChatProps = useChat({
    initialMessages: [
      {
        id: "instruction",
        role: "system",
        content: `
          You are CustomGPT, an AI assistant that can help with image searches. When you need to search for images, use the following format in your response:
          "I'll search for images of [description]. Here's what I found:"
          Replace [description] with what you're searching for. For example:
          "I'll search for images of a sunset over the mountains. Here's what I found"
          Please note that you cannot display images directly here but they will be shown in another panel, so you don't need to worry about that.
          After providing the image search statement, insert a few empty lines without using HTML br tag before summarizing the search results.
        `,
      },
    ],
    headers: {
      "skyfire-api-key": localAPIKey || "",
    },
    onFinish: (res) => {
      handleAIResponse(res.content)
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "An error occurred during the chat.")
    },
  })

  const leftPanel = (
    <AIChatUI aiChatProps={aiChatProps} errorMessage={errorMessage} />
  )

  const rightPanel = (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <SearchInfo />
        <ImagesSearchWithPagination key={searchTerm} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <TwoPanelLayout leftPanel={leftPanel} rightPanel={rightPanel} />
    </div>
  )
}
