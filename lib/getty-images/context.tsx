"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

import {
  useSkyfireAPIClient,
  useSkyfireTOSAgreement,
} from "../skyfire-sdk/context/context"
import {
  ImageDownloadResult,
  ImageSearchResponse,
  ImageSearchResult,
  PurchaseHistoryItem,
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
  purchaseHistory: PurchaseHistoryItem[]
  searchTerm: string
  totalImages: number
  currentPage: number
  totalPages: number
  setSearchTerm: (term: string) => void
  searchImages: (
    phrase: string,
    page: number,
    pageSize: number
  ) => Promise<ImageSearchResponse | null>
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
  fetchPurchaseHistory: () => Promise<void>
  clearSearchAndPurchaseHistory: () => void
}

const GettyImagesContext = createContext<GettyImagesContextType | undefined>(
  undefined
)

const GETTY_IMAGES_DESTINATION_ADDRESS =
  "0xbb20BafE0ddf663ad08DA6DB5d3bBeF7a28944AA"

export const GettyImagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const client = useSkyfireAPIClient()
  const tosConfirmation = useSkyfireTOSAgreement()
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([])
  const [backgroundImages, setBackgroundImages] = useState<ImageSearchResult[]>(
    []
  )
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([])
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>(
    []
  )
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalImages, setTotalImages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

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
  ): Promise<ImageSearchResponse | null> => {
    if (!client) throw new Error("API client not available")

    if (searchLoading) return Promise.resolve(null)

    setSearchLoading(true)
    setError(null)
    try {
      const response = await client.get<ImageSearchResponse>(
        `v1/receivers/getty-images/search/images/creative?phrase=${phrase}&page=${page}&page_size=${pageSize}`,
        {
          metadataForAgent: {
            title: `Getty Images Search: ${phrase}`,
            useWithChat: true,
            correspondingPageURLs: ["/"],
            customPrompts: [
              "Can you describe the images?",
              "What are the most common themes in these images?",
            ],
            replaceExisting: true,
          },
        }
      )
      setSearchResults(response.data.images)
      setTotalImages(response.data.result_count)
      setCurrentPage(page)
      setTotalPages(Math.ceil(response.data.result_count / pageSize))
      setSearchLoading(false)
      setSearchTerm(phrase)
      return response.data
    } catch (err) {
      setError("Failed to fetch images")
      setSearchLoading(false)
      throw err
    }
  }

  const fetchBackgroundImages = async (page: number, pageSize: number) => {
    if (!client) return
    setLoading(true)
    setError(null)
    try {
      const randomTerms = ["nature", "human", "space", "love", "baby"]
      const randomTerm =
        randomTerms[Math.floor(Math.random() * randomTerms.length)]
      const response = await client.get<ImageSearchResponse>(
        `v1/receivers/getty-images/search/images/creative?phrase=${randomTerm}&page=${page}&page_size=${pageSize}`
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
      const response = await client.post<ImageDownloadResult>(
        "v1/receivers/getty-images/images/download",
        {
          id,
          height: `${height}`,
          size,
          tosConfirmation: tosConfirmation.tosAgreed,
          userEmail: "koji@skyfire.xyz",
        },
        {
          metadataForAgent: {
            title: `Getty Image Download: ${id}`,
            useWithChat: true,
            correspondingPageURLs: ["/"],
            customPrompts: [],
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
    localStorage.setItem(
      "downloadedItems",
      JSON.stringify(
        downloadedItems.filter((item) => item.downloadResult.id !== id)
      )
    )
  }

  const fetchPurchaseHistory = async () => {
    if (!client || historyLoading) return
    setHistoryLoading(true)
    setError(null)
    try {
      const response = await client.get<PurchaseHistoryItem[]>(
        `/v1/events?eventNames=Claim&trackIds=${GETTY_IMAGES_DESTINATION_ADDRESS}`,
        {
          metadataForAgent: {
            title: "Getty Images Purchase History",
            useWithChat: true,
            correspondingPageURLs: ["/"],
            customPrompts: [],
          },
        }
      )
      setPurchaseHistory(response.data)
      setHistoryLoading(false)
    } catch (err) {
      setError("Failed to fetch purchase history")
      setHistoryLoading(false)
    }
  }

  const clearSearchAndPurchaseHistory = () => {
    setSearchResults([])
    setBackgroundImages([])
    setPurchaseHistory([])
    setSearchTerm("")
    setTotalImages(0)
    setCurrentPage(1)
    setTotalPages(0)
    setError(null)
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
        purchaseHistory,
        searchTerm,
        totalImages,
        currentPage,
        totalPages,
        setSearchTerm,
        searchImages,
        fetchBackgroundImages,
        downloadImage,
        addDownloadedItem,
        markDownloadAsExpired,
        updateDownloadedItem,
        removeDownloadedItem,
        fetchPurchaseHistory,
        clearSearchAndPurchaseHistory,
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
