import React from "react"
import Image from "next/image"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface ChatImageDisplayProps {
  imageURLs: string[]
}

const IMAGE_HEIGHT = 200
const IMAGE_WIDTH = 300

export default function ChatImageDisplay({ imageURLs }: ChatImageDisplayProps) {
  return (
    <>
      <Card className="w-full my-4 border-none">
        <CardContent className="p-4">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex space-x-4 p-4 justify-center">
              {imageURLs.map((url) => {
                return (
                  <div
                    key={url}
                    className="relative group"
                    style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
                  >
                    <Image
                      src={url}
                      alt={url}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}
