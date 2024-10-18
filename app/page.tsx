"use client"

import { useCallback, useEffect, useState } from "react"
import { useChat } from "ai/react"
import { Layers, MessageCircle } from "lucide-react"

import { useGettyImages } from "@/lib/getty-images/context"
import { gettyImagesInstruction } from "@/lib/getty-images/instruction"
import { downloadImageFile } from "@/lib/getty-images/util"
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
    downloadImage,
    findImageById,
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

  const handleDownload = async (
    imageName: string,
    imageId: string,
    size: string
  ) => {
    try {
      const selectedImage = findImageById(imageId)
      await downloadImageFile({
        selectedImage,
        selectedSize: size,
        downloadImage,
      })
      console.log(
        `Successfully initiated download for ${imageName} (ID: ${imageId}) in ${size} resolution`
      )
    } catch (error) {
      console.error("Error initiating download:", error)
    }
  }

  const aiChatProps = useChat({
    initialMessages: [
      {
        id: "instruction",
        role: "system",
        content: gettyImagesInstruction,
      },
    ],
    headers: {
      "skyfire-api-key": localAPIKey || "",
    },
    onToolCall: (tool) => {
      switch (tool.toolCall.toolName) {
        case "search_images":
          const { query } = tool.toolCall.args as { query: string }
          handleSearch(query)
          break
        case "show_history":
          handleHistory()
          break
        case "show_images":
          // possibly show loading indicator
          break
        case "purchase_images":
          // possibly show loading indicator
          break
      }
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
