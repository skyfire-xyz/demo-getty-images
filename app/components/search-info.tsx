import { useGettyImages } from "@/lib/getty-images/context"
import { Card, CardContent } from "@/components/ui/card"

export function SearchInfo() {
  const { searchTerm, searchResults, currentPage, itemsPerPage } =
    useGettyImages()

  const totalResults =
    searchResults.length > 0 ? searchResults[0].result_count : 0
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalResults)

  return (
    <div className="container mx-auto mb-4">
      <Card className="">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          {searchTerm && (
            <p className="text-sm text-gray-600">
              Showing results for:{" "}
              <span className="font-medium">{searchTerm}</span>
            </p>
          )}
          {totalResults > 0 && (
            <p className="text-sm text-gray-600">
              Displaying items {startItem} - {endItem} of {totalResults} total
              results
            </p>
          )}
          {totalResults === 0 && searchTerm && (
            <p className="text-sm text-gray-600">
              No results found for your search.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
