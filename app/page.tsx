import DownloadedImagesList from "./components/downloaded-images"
import GettyImagesSearch from "./components/getty-image-search"
import { RandomImageGrid } from "./components/random-image-grid"
import ImageSearchResults from "./components/search-result"

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <RandomImageGrid />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <GettyImagesSearch />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <ImageSearchResults />
        <DownloadedImagesList />
      </div>
    </div>
  )
}
