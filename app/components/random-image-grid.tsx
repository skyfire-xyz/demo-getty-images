"use client"

import { useEffect } from "react"

import { useGettyImages } from "@/lib/getty-images/context"
import { getHighestResolutionImage } from "@/lib/getty-images/util"
import { useSkyfireAPIClient } from "@/lib/skyfire-sdk/context/context"
import { Skeleton } from "@/components/ui/skeleton"

export function RandomImageGrid() {
  const { backgroundImages, loading, fetchBackgroundImages } = useGettyImages()
  const client = useSkyfireAPIClient()

  useEffect(() => {
    fetchBackgroundImages(1, 1)
  }, [client])

  const gridContent = loading
    ? [...Array(12)].map((_, index) => (
        <Skeleton key={index} className="h-full w-full" />
      ))
    : backgroundImages.slice(0, 16).map((image) => (
        <div key={image.id} className="relative overflow-hidden rounded-2xl">
          <img
            src={getHighestResolutionImage(image.display_sizes)}
            alt={image.title}
            className="object-cover w-full h-full"
          />
        </div>
      ))

  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 h-[700px]">
        {gridContent}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
    </div>
  )
}
