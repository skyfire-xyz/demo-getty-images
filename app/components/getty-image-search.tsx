"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { useGettyImages } from "@/lib/getty-images/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function GettyImagesSearch() {
  const { searchLoading, error, searchImages, searchTerm, setSearchTerm } =
    useGettyImages()
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearchTerm.trim()) {
      setSearchTerm(localSearchTerm)
      try {
        await searchImages(localSearchTerm, 1, 30) // Assuming 30 items per page
      } catch (err) {
        console.error("Error performing search:", err)
      }
    }
  }

  return (
    <div className="container mx-auto px-4">
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <Input
          type="text"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          placeholder="Enter search term..."
          className="flex-grow text-black bg-white"
        />
        <Button type="submit" disabled={searchLoading}>
          {searchLoading ? "Searching..." : "Search"}
          <Search className="ml-2 h-4 w-4" />
        </Button>
      </form>

      {error && (
        <div className="text-red-500 mb-4" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
