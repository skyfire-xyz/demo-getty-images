"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { useGettyImages } from "@/lib/getty-images/context"
import { getHighestResolutionImage } from "@/lib/getty-images/util"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import ImageDetailsModal from "./image-download-modal"

export const ITEMS_PER_PAGE = 30
const IMAGE_HEIGHT = 250 // Fixed height for all images

export default function ImagesSearchWithPagination() {
  const { searchLoading, error, searchImages, searchResults, searchTerm } =
    useGettyImages()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm, 1)
    }
  }, [searchTerm])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const handleSearch = async (term: string, page: number) => {
    try {
      const results = await searchImages(term, page, ITEMS_PER_PAGE)
      if (results) {
        setTotalResults(results.result_count)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error("Error performing search:", error)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalResults / ITEMS_PER_PAGE)) {
      handleSearch(searchTerm, newPage)
    }
  }

  const openImageDetails = (image: any) => {
    setSelectedImage(image)
  }

  const closeImageDetails = () => {
    setSelectedImage(null)
  }

  const calculateRowLayout = (images: any[]) => {
    let currentRowWidth = 0
    let currentRow: any[] = []
    const rows: any[][] = []

    images.forEach((image, index) => {
      const aspectRatio =
        image.max_dimensions.height / image.max_dimensions.width
      const imageWidth = IMAGE_HEIGHT / aspectRatio

      if (
        currentRowWidth + imageWidth > containerWidth &&
        currentRow.length > 0
      ) {
        rows.push(currentRow)
        currentRow = [image]
        currentRowWidth = imageWidth
      } else {
        currentRow.push(image)
        currentRowWidth += imageWidth
      }

      if (index === images.length - 1 && currentRow.length > 0) {
        rows.push(currentRow)
      }
    })

    return rows
  }

  const rows = calculateRowLayout(searchResults)

  return (
    <div className="container" ref={containerRef}>
      {rows.map((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1
        const rowWidth = row.reduce((sum, image) => {
          const aspectRatio =
            image.max_dimensions.height / image.max_dimensions.width
          return sum + IMAGE_HEIGHT / aspectRatio
        }, 0)
        const scaleFactor = isLastRow ? 1 : containerWidth / rowWidth

        return (
          <div key={rowIndex} className="flex mb-4">
            {row.map((image) => {
              const aspectRatio =
                image.max_dimensions.height / image.max_dimensions.width
              const imageWidth = (IMAGE_HEIGHT / aspectRatio) * scaleFactor

              return (
                <div className="overflow-hidden relative group mx-2 last:mr-0">
                  <Card
                    key={image.id}
                    style={{
                      height: `${IMAGE_HEIGHT}px`,
                      width: `${imageWidth}px`,
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={getHighestResolutionImage(image.display_sizes) || ""}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      fill={true}
                    />
                    <CardContent className="p-4 absolute inset-0 bg-black bg-opacity-70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between overflow-y-auto">
                      <div>
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
                        onClick={() => openImageDetails(image)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )
      })}

      {totalResults > 0 && (
        <div className="flex justify-center items-center space-x-2 mb-8">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || searchLoading}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {Math.ceil(totalResults / ITEMS_PER_PAGE)}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(totalResults / ITEMS_PER_PAGE) ||
              searchLoading
            }
          >
            Next
          </Button>
        </div>
      )}

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
