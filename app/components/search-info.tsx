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
    <div className="container mx-auto mb-4">
      <Card>
        <CardContent className="p-4 flex items-end">
          <div>
            <p className="text-sm mb-2">
              Showing results for:{" "}
              <h2 className="inline font-bold text-2xl">{searchTerm}</h2>
            </p>
            {/* {searchResults.length > 0 && (
              <p className="text-sm mb-4">
                Displaying items {startItem.toLocaleString()} -{" "}
                {endItem.toLocaleString()} of {totalImages.toLocaleString()}{" "}
                total results
              </p>
            )} */}
            <div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || searchLoading}
                    size="sm"
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
  )
}
