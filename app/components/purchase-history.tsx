"use client"

import { useEffect, useState } from "react"
import { Clock, Download, Image, Trash2 } from "lucide-react"
import { toast } from "react-toastify"

import { useGettyImages } from "@/lib/getty-images/context"
import { useSkyfireAPIClient } from "@/lib/skyfire-sdk/context/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PurchaseHistory() {
  const { purchaseHistory, fetchPurchaseHistory, loading, error } =
    useGettyImages()
  const client = useSkyfireAPIClient()
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [expiredLinks, setExpiredLinks] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadPurchaseHistory = async () => {
      setIsLoading(true)
      await fetchPurchaseHistory()
      setIsLoading(false)
    }

    loadPurchaseHistory()
  }, [client])

  const handleDownload = async (item: any) => {
    setDownloadingId(item.id)
    try {
      const response = await fetch(item.attributes.gettyImage.uri)
      if (!response.ok) {
        throw new Error("Download link expired")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${item.attributes.gettyImage.title}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("The image has been downloaded successfully.")
    } catch (error) {
      console.error("Download failed:", error)
      setExpiredLinks((prev) => new Set(prev).add(item.id))
      toast.error(() => (
        <>
          <b>Download Failed</b>
          <p>
            The download link has expired. Please try re-purchasing the image.
          </p>
        </>
      ))
    } finally {
      setDownloadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-[200px] w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-destructive/15">
        <CardContent className="pt-6">
          <p className="text-center text-destructive">
            Failed to load purchase history. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (purchaseHistory.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No purchase history found.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 mx-auto">
      {purchaseHistory.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              {item.attributes.gettyImage.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex items-start space-x-4">
              <div className="w-1/3">
                <img
                  src={
                    item.attributes.gettyImage.display_sizes.find(
                      (size) => size.name === "thumb"
                    )?.uri || "/placeholder.svg"
                  }
                  alt={item.attributes.gettyImage.title}
                  className="w-full h-auto rounded-md object-cover"
                />
              </div>
              <div className="w-2/3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {item.attributes.gettyImage.caption}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <Image className="h-4 w-4" />
                  <span>{item.attributes.gettyImage.artist}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(item.createdDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Download className="h-4 w-4" />
                  <span>
                    {item.attributes.gettyImage.download_sizes[0].name} -{" "}
                    {item.attributes.gettyImage.download_sizes[0].width}x
                    {item.attributes.gettyImage.download_sizes[0].height}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant={
                      expiredLinks.has(item.id) ? "destructive" : "outline"
                    }
                    size="sm"
                    onClick={() => handleDownload(item)}
                    disabled={
                      downloadingId === item.id || expiredLinks.has(item.id)
                    }
                  >
                    {downloadingId === item.id ? (
                      <Download className="mr-2 h-4 w-4 animate-spin" />
                    ) : expiredLinks.has(item.id) ? (
                      <Trash2 className="mr-2 h-4 w-4" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {expiredLinks.has(item.id)
                      ? "Download Link Expired"
                      : "Download"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
