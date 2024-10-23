"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { useGettyImages } from "@/lib/getty-images/context"
import { getHighestResolutionImage } from "@/lib/getty-images/util"
import { useSkyfireAPIClient } from "@/lib/skyfire-sdk/context/context"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Card, CardContent } from "@/components/ui/card"

export function AnimatedAspectRatioImageGallery() {
  const client = useSkyfireAPIClient()
  const { backgroundImages, loading, fetchBackgroundImages } = useGettyImages()
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile(768)

  const ITEMS_PER_ROW = 8
  const ROW_HEIGHT = isMobile ? 150 : 250
  const NUM_ROWS = isMobile ? 3 : 4

  useEffect(() => {
    fetchBackgroundImages(1, ITEMS_PER_ROW * NUM_ROWS)
  }, [client])

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

  const calculateRowLayout = (images: any[]) => {
    const rows: any[][] = []
    for (let i = 0; i < NUM_ROWS; i++) {
      rows.push(images.slice(i * ITEMS_PER_ROW, (i + 1) * ITEMS_PER_ROW))
    }
    return rows
  }

  const rows = calculateRowLayout(backgroundImages)

  return (
    <div
      className="container mx-auto px-4 py-8 overflow-hidden relative"
      ref={containerRef}
    >
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {/* {[...Array(9)].map((_, index) => (
            <Skeleton key={index} className="h-[250px] w-full" />
          ))} */}
        </div>
      ) : (
        <>
          {rows.map((row, rowIndex) => {
            const direction = rowIndex % 2 === 0 ? 1 : -1
            const speed = 20 + rowIndex * 5 // Varying speeds

            return (
              <div
                key={rowIndex}
                className="flex mb-4 relative"
                style={{
                  height: `${ROW_HEIGHT}px`,
                  width: `${containerWidth * 2}px`,
                  animation: `slide${
                    direction > 0 ? "Right" : "Left"
                  } ${speed}s linear infinite`,
                }}
              >
                {[...row, ...row].map((image, imageIndex) => {
                  const aspectRatio =
                    image.max_dimensions.height / image.max_dimensions.width
                  const imageWidth = ROW_HEIGHT / aspectRatio

                  return (
                    <Card
                      key={`${image.id}-${imageIndex}`}
                      className="overflow-hidden relative group mx-1 last:mr-0 flex-shrink-0"
                      style={{
                        height: `${ROW_HEIGHT}px`,
                        width: `${imageWidth}px`,
                      }}
                    >
                      <Image
                        src={
                          getHighestResolutionImage(image.display_sizes) || ""
                        }
                        alt={image.title}
                        className="w-full h-full object-cover transition-all duration-300 filter brightness-50 group-hover:filter-none"
                        loading="lazy"
                        fill={true}
                      />
                      <CardContent className="p-4 absolute inset-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                        <h2 className="text-sm font-semibold line-clamp-2">
                          {image.title}
                        </h2>
                        <p className="text-xs mt-1 line-clamp-3">
                          {image.caption}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          })}
        </>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-left px-8 py-8 rounded-lg max-w-xl">
          <h1
            className={`${
              isMobile ? "text-6xl" : "text-8xl"
            } font-bold leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400`}
          >
            <span>Discover</span>
            <br />
            <span>Unrivaled</span>
            <br />
            <span>Imagery</span>
          </h1>
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        @keyframes slideLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .group:hover img {
          filter: brightness(100%);
        }
      `}</style>
    </div>
  )
}
