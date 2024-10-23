import { useGettyImages } from "@/lib/getty-images/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { ITEMS_PER_PAGE } from "./getty-image-search-with-pagination"

export function SearchInfo() {
  const {
    searchTerm,
    searchResults,
    currentPage,
    totalPages,
    totalImages,
    searchImages,
    searchLoading,
  } = useGettyImages()

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchImages(searchTerm, newPage, ITEMS_PER_PAGE)
    }
  }

  if (!searchTerm) return null

  return (
    <div className="md:fixed top-4 left-8 right-4 z-10 bg-background/80 backdrop-blur-sm shadow-md">
      <div className="md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="md:fixed right-0 md:w-2/3 z-10 bg-background/80 backdrop-blur-sm shadow-md pr-4">
          <CardContent className="p-4 w-full">
            <div className="w-full flex justify-between items-center">
              <p className="text-sm mb-2">
                Showing results for:{" "}
                <h2 className="inline font-bold text-2xl">{searchTerm}</h2>
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm invisible md:block">
                  {totalImages > 0 &&
                    `${totalImages.toLocaleString()} total results`}
                </p>
                {totalPages > 1 && (
                  <div className="ml-4 flex justify-center items-center space-x-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || searchLoading}
                      size="sm"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage.toLocaleString()} of{" "}
                      {totalPages.toLocaleString()}
                    </span>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || searchLoading}
                      size="sm"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
