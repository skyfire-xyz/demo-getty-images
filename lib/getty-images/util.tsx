import { toast } from "react-toastify"

import { useGettyImages } from "./context"
import { DisplaySize } from "./type"

export function getHighestResolutionImage(display_sizes: DisplaySize[]) {
  const priorityOrder = ["comp", "comp_webp", "preview", "thumb"]

  for (const priority of priorityOrder) {
    const matchingSize = display_sizes.find((size) => size.name === priority)
    if (matchingSize) {
      return matchingSize.uri
    }
  }
  return display_sizes.length > 0 ? display_sizes[0].uri : null
}

export const calculateEstimatedPrice = (
  width: number,
  height: number
): number => {
  const pixelCount = width * height
  const basePrice = pixelCount / 10000000
  return basePrice
}

interface DownloadImageParams {
  selectedImage: any
  selectedSize: string
  downloadImage: (id: string, height: number, size: string) => Promise<any>
}

export const downloadImageFile = async ({
  selectedImage,
  selectedSize,
  downloadImage,
}: DownloadImageParams): Promise<void> => {
  if (!selectedSize) {
    toast.error("Please select a size to download.")
    return
  }

  try {
    const selectedSizeObj = selectedImage.download_sizes.find(
      (size: any) => size.name === selectedSize
    )
    if (!selectedSizeObj) {
      throw new Error("Selected size not found")
    }

    const result = await downloadImage(
      selectedImage.id,
      selectedSizeObj.height,
      selectedSize
    )
    if (result && result.uri) {
      const response = await fetch(result.uri)
      if (!response.ok) {
        throw new Error("Download failed")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${selectedImage.title}_${selectedSize}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`The image has been downloaded successfully.`)
    } else {
      throw new Error("Failed to get download URL")
    }
  } catch (error) {
    console.error("Download failed:", error)
    toast.error("Failed to download the image. Please try again.")
    throw error
  }
}
