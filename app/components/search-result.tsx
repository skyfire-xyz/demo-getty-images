"use client"

import { useState } from "react"
import Image from "next/image"

import { useGettyImages } from "@/lib/getty-images/context"
import { getHighestResolutionImage } from "@/lib/getty-images/util"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { ImageDetailsModal } from "./image-download-modal"

export default function ImageSearchResults() {
  const { searchResults } = useGettyImages()
  const [selectedImage, setSelectedImage] = useState<any | null>(null)

  const openImageDetails = (image: any) => {
    setSelectedImage(image)
  }

  const closeImageDetails = () => {
    setSelectedImage(null)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {searchResults.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <CardContent className="p-0">
            <Image
              src={getHighestResolutionImage(image.display_sizes) || ""}
              alt={image.title}
              className="w-full h-48 object-cover"
              fill={true}
            />
            <div className="p-4">
              <h2 className="text-sm font-semibold line-clamp-1">
                {image.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {image.caption}
              </p>
              <Button
                className="mt-2"
                variant="outline"
                size="sm"
                onClick={() => openImageDetails(image)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {selectedImage && (
        <ImageDetailsModal
          isOpen={!!selectedImage}
          onClose={closeImageDetails}
          selectedImage={selectedImage}
        />
      )}
    </div>
  )
}
