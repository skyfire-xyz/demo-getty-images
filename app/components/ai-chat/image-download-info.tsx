import React from "react"
import Image from "next/image"

import { downloadFile } from "@/lib/getty-images/util"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ImageDownloadInfo {
  id: string
  partialData: {
    uri: string
    preview: string
    title: string
  }
  success: boolean
}

interface ImageDownloadInfoProps {
  data: {
    role: string
    name: string
    content: string
  }
}

export default function ImageDownloadInfo({ data }: ImageDownloadInfoProps) {
  const parsedContent: ImageDownloadInfo[] = JSON.parse(data.content)

  return (
    <>
      {parsedContent.map((image) => (
        <div key={image.id} className="mb-6 p-4 bg-muted rounded-lg">
          <Badge variant="default" className="mb-4">
            Successfully Purchased
          </Badge>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Image
                src={image.partialData.preview}
                alt={image.partialData.title}
                width={100}
                height={100}
                className="rounded-md"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text font-semibold mb-2">
                {image.partialData.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                ID: {image.id}
              </p>
              {image.success && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadFile(image.partialData.uri, image.partialData.title)
                  }}
                  rel="noopener noreferrer"
                >
                  Download Image
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
