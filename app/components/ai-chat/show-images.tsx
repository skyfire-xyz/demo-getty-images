import React, { useState } from "react"
import Image from "next/image"

import { useGettyImages } from "@/lib/getty-images/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import ImageDetailsModal from "../image-download-modal"

interface ChatImageDisplayProps {
  imageIDs: string[]
}

const IMAGE_HEIGHT = 200
const IMAGE_WIDTH = 300

export default function ChatImageDisplay({ imageIDs }: ChatImageDisplayProps) {
  const { findImageById } = useGettyImages()
  const [selectedImage, setSelectedImage] = useState<any | null>(null)

  return (
    <>
      <Card className="w-full my-4 border-none">
        <CardContent className="p-4">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex space-x-4 p-4 justify-center">
              {imageIDs.map((id) => {
                const image = findImageById(id)
                if (!image) return null

                const previewImage = image.display_sizes.find(
                  (size) => size.name === "preview"
                )
                if (!previewImage) return null

                return (
                  <div
                    key={id}
                    className="relative group"
                    style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
                  >
                    <Image
                      src={previewImage.uri}
                      alt={image.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 rounded-lg">
                      <div className="overflow-hidden">
                        <h2 className="text-sm font-semibold line-clamp-1">
                          {image.title}
                        </h2>
                        <p className="text-xs mt-1 line-clamp-3">
                          {image.caption}
                        </p>
                      </div>
                      <Button
                        className="mt-2 w-full"
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedImage(image)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
      {selectedImage && (
        <ImageDetailsModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          selectedImage={selectedImage}
        />
      )}
    </>
  )
}
