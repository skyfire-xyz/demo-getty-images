"use client"

import { useCallback, useEffect, useState } from "react"
import { useChat } from "ai/react"
import { Layers, MessageCircle } from "lucide-react"

import { useGettyImages } from "@/lib/getty-images/context"
import { clearResponses } from "@/lib/skyfire-sdk/context/action"
import { useSkyfireAPIKey } from "@/lib/skyfire-sdk/context/context"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Button } from "@/components/ui/button"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

import AIChatUI from "./components/ai-chat/ai-chat-ui"
import ImagesSearchWithPagination from "./components/getty-image-search-with-pagination"
import { PurchaseHistory } from "./components/purchase-history"
import { AnimatedAspectRatioImageGallery } from "./components/random-image-grid"
import { SearchInfo } from "./components/search-info"
import { TwoPanelLayout } from "./components/two-panel-layout"
import TwoPanelLayoutMobile from "./components/two-panel-mobile"

export default function IndexPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true) // Drawer open state
  const {
    clearSearchAndPurchaseHistory,
    searchImages,
    searchTerm,
    setSearchTerm,
    fetchPurchaseHistory,
  } = useGettyImages()
  const [showHistory, setShowHistory] = useState(false)
  const { localAPIKey } = useSkyfireAPIKey()

  const isMobile = useIsMobile(768) // Consider mobile for screens smaller than 1024px

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    setShowHistory(false)
    try {
      await searchImages(term, 1, 30) // Assuming 30 items per page
    } catch (error) {
      console.error("Error performing search:", error)
    }
  }

  const handleHistory = async () => {
    setShowHistory(true)
    setSearchTerm("")
    try {
      await fetchPurchaseHistory()
    } catch (error) {
      console.error("Error performing search:", error)
    }
  }

  const handleAIResponse = (content: string) => {
    console.log(content, "content")

    const searchRegex =
      /I'll search for images of (.*?)\. Here's what I found:/i
    const historyRegex =
      /I'll show your purchase history\. Here's what I found:/i

    const searchMatch = content.match(searchRegex)
    const historyMatch = content.match(historyRegex)

    if (searchMatch) {
      const searchQuery = searchMatch[1].trim()
      handleSearch(searchQuery)
    } else if (historyMatch) {
      handleHistory()
    }
  }

  //           You are an AI assistant that can help with image searches and show purchase history.
  // When you need to search for images, use the following format in your response:
  // "I'll search for images of [description]. Here's what I found:"
  // Replace [description] with what you're searching for. For example:
  // "I'll search for images of a sunset over the mountains. Here's what I found:"
  // When the user asks to see their purchase history, use the following format:
  // "I'll show your purchase history. Here's what I found:"
  // Please note that you cannot display images or purchase history directly here, but they will be shown in another panel, so you don't need to worry about that.
  // After providing the image search or purchase history statement, insert a few empty lines without using HTML br tag before summarizing the results or providing additional information.
  // IMPORTANT: When responding to queries about purchase history or images, only use the information provided by these specific prompts. Do not make up or invent any information about purchase history or image search results. If you don't have the necessary information to respond, simply use the appropriate prompt without adding any extra details.
  // For all other queries unrelated to purchase history or image searches, you may respond normally based on your general knowledge and capabilities.

  const aiChatProps = useChat({
    initialMessages: [
      {
        id: "instruction",
        role: "system",
        content: `
You are an AI assistant that can help with image searches and show purchase history. Always respond to the user's request with a text message first before using any tools.

When you need to search for images:
1. First, respond to the user acknowledging their request and informing them that you'll search for images.
2. Then, execute the "search_image" tool.

When the user asks to see their purchase history:
1. First, respond to the user confirming that you'll retrieve their purchase history.
2. Then, execute the "show_history" tool.

When the user asks your opinion on a specific image or images: (e.g. your favorite image/picture, best picutre for specific use case etc.)
1. First, respond to the user acknowledging their request and answering their question with details.
2. Then, execute the "show_images" tool with imageIDs as the parameter. Image ID can be found in the JSON object that's been sent before asking the quetsion.

Remember, in all cases, always provide a text response to the user before executing any tool. This ensures clear communication and sets expectations for the user about what actions you're taking.
`,
      },
    ],
    headers: {
      "skyfire-api-key": localAPIKey || "",
    },
    onToolCall: (tool) => {
      switch (tool.toolCall.toolName) {
        case "search_images":
          handleSearch(tool.toolCall.args.query)
        case "show_history":
          handleHistory()
        case "show_images":
          console.log(tool)
          break
      }
      console.log(tool, "tool")
    },
    onFinish: (res) => {
      handleAIResponse(res.content)
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "An error occurred during the chat.")
    },
  })

  useEffect(() => {
    if (!localAPIKey) {
      aiChatProps.setMessages([
        ...aiChatProps.messages.filter((msg) => msg.id === "instruction"),
      ])
      clearSearchAndPurchaseHistory()
      clearResponses()
    }
  }, [localAPIKey])

  const leftPanel = (
    <AIChatUI aiChatProps={aiChatProps} errorMessage={errorMessage} />
  )

  const rightPanel = (
    <>
      {!searchTerm && !showHistory && (
        <div className="flex h-full items-center overflow-hidden">
          <AnimatedAspectRatioImageGallery />
        </div>
      )}
      {searchTerm && (
        <div className="h-full pt-24">
          <SearchInfo />
          <ImagesSearchWithPagination key={searchTerm} />
        </div>
      )}
      {showHistory && (
        <div className="h-full">
          <PurchaseHistory />
        </div>
      )}
    </>
  )

  if (!localAPIKey) return null

  if (isMobile) {
    return (
      <>
        <TwoPanelLayoutMobile
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          leftPanel={leftPanel}
          rightPanel={
            <>
              {!searchTerm && !showHistory && (
                <div className="flex h-full items-center overflow-hidden">
                  <AnimatedAspectRatioImageGallery />
                </div>
              )}
              {searchTerm && (
                <div className="h-full">
                  <ImagesSearchWithPagination key={searchTerm} />
                </div>
              )}
              {showHistory && (
                <div className="h-full">
                  <PurchaseHistory />
                </div>
              )}
            </>
          }
          header={
            <DrawerHeader>
              {searchTerm && <SearchInfo />}
              {!showHistory && !searchTerm && (
                <DrawerTitle>gettyimages x Skyfire</DrawerTitle>
              )}
              {showHistory && <DrawerTitle>Purchase History</DrawerTitle>}
            </DrawerHeader>
          }
        />
        {!isOpen && (searchTerm || showHistory) && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 left-4 z-50 rounded-full"
            onClick={() => setIsOpen(true)}
          >
            <Layers className="h-4 w-4" />
          </Button>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TwoPanelLayout
        leftPanel={leftPanel}
        rightPanel={
          <>
            {!searchTerm && !showHistory && (
              <div className="flex h-full items-center overflow-hidden">
                <AnimatedAspectRatioImageGallery />
              </div>
            )}
            {searchTerm && (
              <div className="h-full pt-24">
                <SearchInfo />
                <ImagesSearchWithPagination key={searchTerm} />
              </div>
            )}
            {showHistory && (
              <div className="h-full">
                <PurchaseHistory />
              </div>
            )}
          </>
        }
      />
    </div>
  )
}
