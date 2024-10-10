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
