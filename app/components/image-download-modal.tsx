"use client"

import { useState } from "react"
import { Download, Info } from "lucide-react"
import { toast } from "react-toastify"

import { useGettyImages } from "@/lib/getty-images/context"
import { calculateEstimatedPrice } from "@/lib/getty-images/util"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImageDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedImage: any // Replace with your actual image type
}

export function ImageDetailsModal({
  isOpen,
  onClose,
  selectedImage,
}: ImageDetailsModalProps) {
  const { downloadImage, addDownloadedItem } = useGettyImages()
  const [selectedSize, setSelectedSize] = useState("")
  const [downloadLoading, setDownloadLoading] = useState(false)

  const handleDownload = async () => {
    if (!selectedSize) {
      toast.error("Please select a size to download.")
      return
    }

    setDownloadLoading(true)
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
        onClose()
      } else {
        throw new Error("Failed to get download URL")
      }
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Failed to download the image. Please try again.")
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{selectedImage?.title}</DialogTitle>
          <DialogDescription>{selectedImage?.caption}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6 py-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={selectedImage?.display_sizes[0].uri}
                alt={selectedImage?.title}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Image Details</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Collection:</strong>{" "}
                    {selectedImage?.collection_name}
                  </li>
                  <li>
                    <strong>Asset Family:</strong> {selectedImage?.asset_family}
                  </li>
                  <li>
                    <strong>License Model:</strong>{" "}
                    {selectedImage?.license_model}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Sizes</h3>
                <RadioGroup
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                >
                  {selectedImage?.download_sizes.map(
                    (size: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between space-x-2 mb-2"
                      >
                        <div className="flex items-center">
                          <RadioGroupItem
                            value={size.name}
                            id={`size-${index}`}
                          />
                          <Label htmlFor={`size-${index}`} className="ml-2">
                            {size.name} ({size.width}x{size.height})
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {(size.bytes / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                          <Badge variant="outline">
                            ${Number(size.amount / 1000000).toFixed(3)}
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
                </RadioGroup>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-between p-6 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloadLoading || !selectedSize}
          >
            {downloadLoading ? "Downloading..." : "Purchase & Download"}
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
