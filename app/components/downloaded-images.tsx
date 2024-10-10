"use client"

import { useState } from "react"
import { Download, Trash2 } from "lucide-react"

import { useGettyImages } from "@/lib/getty-images/context"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function DownloadedImagesList() {
  const { downloadedItems, downloadImage, removeDownloadedItem } =
    useGettyImages()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (item: any) => {
    setDownloadingId(item.downloadResult.id)
    try {
      const response = await fetch(item.downloadResult.uri)
      if (!response.ok) {
        throw new Error("Download link expired")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${item.searchResult.title}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast({
        title: "Download Successful",
        description: "The image has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download Failed",
        description:
          "The download link has expired. Please try re-purchasing the image.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRemove = (id: string) => {
    removeDownloadedItem(id)
    toast({
      title: "Image Removed",
      description: "The image has been removed from your local history.",
    })
  }

  if (downloadedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Purchased Images</h2>
        <p className="text-gray-500">No images have been purchased yet.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Purchased Images</h2>
      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {downloadedItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg truncate">
                  {item.searchResult.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <img
                  src={item.searchResult.display_sizes[0].uri}
                  alt={item.searchResult.title}
                  className="w-full h-48 object-cover mb-4 rounded-md"
                />
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>ID:</strong> {item.downloadResult.id}
                  </p>
                  <p>
                    <strong>Artist:</strong> {item.downloadResult.artist}
                  </p>
                  <p>
                    <strong>Collection:</strong>{" "}
                    {item.downloadResult.collection_name}
                  </p>
                  <p>
                    <strong>License Model:</strong>{" "}
                    {item.downloadResult.license_model}
                  </p>
                  <p>
                    <strong>Size:</strong> {item.downloadResult.width}x
                    {item.downloadResult.height}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.downloadResult.id}
                  >
                    {downloadingId === item.downloadResult.id ? (
                      <Download className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.downloadResult.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove from local history</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
