"use client"

import { useState } from "react"

import DownloadedImagesList from "./components/downloaded-images"
import GettyImagesSearch from "./components/getty-image-search"
import ImagesSearchWithPagination from "./components/getty-image-search-with-pagination"
import { RandomImageGrid } from "./components/random-image-grid"
import { SearchInfo } from "./components/search-info"

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <RandomImageGrid />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <GettyImagesSearch onSearch={handleSearch} />
          </div>
        </div>
      </div>
      <div>
        <SearchInfo />
        <ImagesSearchWithPagination key={searchTerm} />
        <DownloadedImagesList />
      </div>
    </div>
  )
}
