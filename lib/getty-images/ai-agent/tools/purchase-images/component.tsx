"use client"

import React from "react"
import Image from "next/image"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const Component: React.FC<{
  data: {
    role: string
    name: string
    content: string
  }
}> = ({ data }) => {
  const parsedContent = JSON.parse(data.content)

  return (
    <>
      {parsedContent.map((image: any) => (
        <div key={image.id} className="mb-6 p-4 bg-muted rounded-lg">
          <Badge variant="default" className="mb-4">
            {image.success ? "Successfully Purchased" : "Purchase Failed"}
          </Badge>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {image.success && (
                <Image
                  src={image.partialData.preview}
                  alt={image.partialData.title}
                  width={100}
                  height={100}
                  className="rounded-md"
                />
              )}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-2">
                {image.success ? image.partialData.title : "Image"}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                ID: {image.id}
              </p>
              {image.success ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(image.partialData.uri, "_blank")
                  }}
                >
                  Download Image
                </Button>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>Purchase Failed</AlertTitle>
                  <AlertDescription>
                    There was an error purchasing this image. Please try again
                    later.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
