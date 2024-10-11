// Types
export interface ImageSize {
  bytes: number
  height: number
  media_type: string
  name: string
  width: number
  dpi: number
  amount: number
}

export interface DisplaySize {
  is_watermarked: boolean
  name: "comp" | "preview" | "thumb" | "comp_webp"
  uri: string
}

export interface MaxDimensions {
  height: number
  width: number
}

export interface ImageSearchResult {
  id: string
  asset_family: string
  caption: string
  collection_code: string
  collection_id: number
  collection_name: string
  display_sizes: DisplaySize[]
  download_sizes: ImageSize[]
  license_model: string
  max_dimensions: MaxDimensions
  title: string
}

export interface ImageSearchResponse {
  images: ImageSearchResult[]
}

export interface ImageDownloadResult {
  id: string
  artist: string
  asset_family: string
  caption: string
  collection_code: string
  collection_id: number
  collection_name: string
  download_sizes: ImageSize[]
  license_model: string
  max_dimensions: MaxDimensions
  title: string
  uri: string
}

export interface PurchaseHistoryItem {
  id: string
  name: string
  attributes: {
    claim: {
      id: string
      nonce: string
      value: string
      status: string
      network: string
      currency: string
      createdAt: string
      signature: string
      updatedAt: string
      referenceId: string
      sourceAddress: string
      contractAddress: string
      destinationAddress: string
    }
    gettyImage: {
      id: string
      uri: string
      title: string
      artist: string
      caption: string
      userEmail: string
      asset_family: string
      collection_id: number
      display_sizes: Array<{
        uri: string
        name: string
        is_watermarked: boolean
        width?: number
        height?: number
      }>
      license_model: string
      download_sizes: Array<{
        dpi: number
        name: string
        bytes: number
        width: number
        amount: number
        height: number
        media_type: string
      }>
      max_dimensions: {
        width: number
        height: number
      }
      collection_code: string
      collection_name: string
      tosConfirmation: boolean
    }
  }
  userUuid: string
  trackId: string
  trackIdType: string
  createdDate: string
}
