"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

import { useSkyfireAPIClient } from "../skyfire-sdk/context/context"
import {
  ImageDownloadResult,
  ImageSearchResponse,
  ImageSearchResult,
} from "./type"

interface DownloadedItem {
  downloadResult: ImageDownloadResult
  searchResult: ImageSearchResult
  isExpired: boolean
}

interface GettyImagesContextType {
  searchResults: ImageSearchResult[]
  backgroundImages: ImageSearchResult[]
  loading: boolean
  searchLoading: boolean
  error: string | null
  downloadedItems: DownloadedItem[]
  searchImages: (
    phrase: string,
    page: number,
    pageSize: number
  ) => Promise<void>
  fetchBackgroundImages: (page: number, pageSize: number) => Promise<void>
  downloadImage: (
    id: string,
    height: number,
    size: string
  ) => Promise<ImageDownloadResult | null>
  addDownloadedItem: (item: DownloadedItem) => void
  markDownloadAsExpired: (id: string) => void
  updateDownloadedItem: (item: DownloadedItem) => void
  removeDownloadedItem: (id: string) => void
}

const GettyImagesContext = createContext<GettyImagesContextType | undefined>(
  undefined
)

export const GettyImagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = useSkyfireAPIClient()
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([])
  const [backgroundImages, setBackgroundImages] = useState<ImageSearchResult[]>(
    []
  )
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedItems = localStorage.getItem("downloadedItems")
    if (storedItems) {
      setDownloadedItems(JSON.parse(storedItems))
    }
  }, [])

  const searchImages = async (
    phrase: string,
    page: number,
    pageSize: number
  ) => {
    if (!client) return
    setSearchLoading(true)
    setError(null)
    try {
      const response = await client.get<ImageSearchResponse>(
        `v1/receivers/getty-images/search/images/creative?phrase=${phrase}&page=${page}&page_size=${pageSize}`,
        {
          metadataForAgent: {
            title: `Getty Images Search: ${phrase}`,
            useWithChat: true,
            correspondingPageURLs: ["/search"],
            customPrompts: [
              "Can you describe the images?",
              "What are the most common themes in these images?",
            ],
          },
        }
      )
      setSearchResults(response.data.images)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch images")
      setLoading(false)
    }
  }

  const fetchBackgroundImages = async (page: number, pageSize: number) => {
    if (!client) return
    setLoading(true)
    setError(null)
    try {
      const randomTerms = [
        "nature",
        "technology",
        "abstract",
        "business",
        "travel",
      ]
      const randomTerm =
        randomTerms[Math.floor(Math.random() * randomTerms.length)]
      const response = await client.get<ImageSearchResponse>(
        `v1/receivers/getty-images/search/images/creative?phrase=${randomTerm}&page=${page}&page_size=${pageSize}`,
        {
          metadataForAgent: {
            title: `Getty Images Background: ${randomTerm}`,
            useWithChat: true,
            correspondingPageURLs: ["/"],
            customPrompts: [
              "Can you describe the background images?",
              "What are the most common themes in these background images?",
            ],
          },
        }
      )
      setBackgroundImages(response.data.images)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch background images")
      setLoading(false)
    }
  }

  const downloadImage = async (
    id: string,
    height: number,
    size: string
  ): Promise<ImageDownloadResult | null> => {
    if (!client) return null
    setLoading(true)
    setError(null)
    try {
      const response = await client.get<ImageDownloadResult>(
        `v1/receivers/getty-images/images/download?id=${id}&height=${height}&size=${size}`,
        {
          metadataForAgent: {
            title: `Getty Image Download: ${id}`,
            useWithChat: true,
            correspondingPageURLs: ["/image/[id]"],
            customPrompts: [
              "Can you describe this image in detail?",
              "What are the key elements in this image?",
            ],
          },
        }
      )
      setLoading(false)
      return response.data
    } catch (err) {
      setError("Failed to download image")
      setLoading(false)
      return null
    }
  }

  const addDownloadedItem = (item: DownloadedItem) => {
    const updatedItems = [...downloadedItems, item]
    setDownloadedItems(updatedItems)
    localStorage.setItem("downloadedItems", JSON.stringify(updatedItems))
  }

  const updateDownloadedItem = (updatedItem: DownloadedItem) => {
    setDownloadedItems((prevItems) =>
      prevItems.map((item) =>
        item.downloadResult.id === updatedItem.downloadResult.id
          ? updatedItem
          : item
      )
    )
    // Update localStorage
    localStorage.setItem("downloadedItems", JSON.stringify(downloadedItems))
  }

  const markDownloadAsExpired = (id: string) => {
    const updatedItems = downloadedItems.map((item) =>
      item.downloadResult.id === id ? { ...item, isExpired: true } : item
    )
    setDownloadedItems(updatedItems)
    localStorage.setItem("downloadedItems", JSON.stringify(updatedItems))
  }

  const removeDownloadedItem = (id: string) => {
    setDownloadedItems((prevItems) =>
      prevItems.filter((item) => item.downloadResult.id !== id)
    )
    // Update localStorage
    localStorage.setItem(
      "downloadedItems",
      JSON.stringify(
        downloadedItems.filter((item) => item.downloadResult.id !== id)
      )
    )
  }

  return (
    <GettyImagesContext.Provider
      value={{
        searchResults,
        backgroundImages,
        loading,
        searchLoading,
        error,
        downloadedItems,
        searchImages,
        fetchBackgroundImages,
        downloadImage,
        addDownloadedItem,
        markDownloadAsExpired,
        updateDownloadedItem,
        removeDownloadedItem,
      }}
    >
      {children}
    </GettyImagesContext.Provider>
  )
}

export const useGettyImages = () => {
  const context = useContext(GettyImagesContext)
  if (context === undefined) {
    throw new Error("useGettyImages must be used within a GettyImagesProvider")
  }
  return context
}
