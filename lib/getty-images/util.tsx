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
