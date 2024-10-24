import React from "react"
import { z } from "zod"

import { BaseTool } from "@/lib/skyfire-sdk/ai-agent/tools/basetool.class"

import { Component } from "./component"

interface PurchaseImagesConfig {
  SKYFIRE_ENDPOINT_URL: string
  apiKey: string
}

export class PurchaseImagesTool extends BaseTool {
  public static readonly toolName = "purchase_images"
  public static readonly instruction = `
When the user asks you to purchase image or images:
1. First, respond to the user acknowledging their request and informing them that you'll initiate the purchase for those images. If the user didn't specify the sizes of the image, show the list of the available sizes for the user to choose. (also pricing of those images)
2. If the user specifies the size of the image, respond to the user acknowledging their request and inform them that you'll initiate the purchase for those images and sizes.
3. Then, execute the "purchase_images" tool with imageIDs as the parameter. Image ID can be found in the JSON object that's been sent before asking the question.
Make sure to purchase only the images that you and the user have just discussed in this most recent conversation. Do not purchase images from previous conversations or unrelated discussions. Specifically, if a command like "buy them all" is given, ensure it refers to images discussed in this latest interaction only.
5. If you are purchasing more than 5 images, you need to confirm with the user before proceeding with the purchase.
6. Make sure to confirm the sizes, if not specified by the user.
7. Before executing the purchase, briefly summarize the images being purchased to ensure they match the recent discussion.
  `

  public override createTool() {
    const { SKYFIRE_ENDPOINT_URL, apiKey } = this.config as PurchaseImagesConfig
    return this.createBaseTool(
      "Purchase Images",
      z.object({
        images: z.array(
          z.object({
            imageID: z.string(),
            size: z.string(),
          })
        ),
      }),
      async ({ images }) => {
        if (!SKYFIRE_ENDPOINT_URL || !apiKey) {
          throw new Error(
            "PurchaseImagesTool not initialized. Call initialize() first."
          )
        }

        const downloadPromises = images.map(
          async (image: { imageID: string; size: string }) => {
            try {
              const response = await fetch(
                `${SKYFIRE_ENDPOINT_URL}/v1/receivers/getty-images/images/download`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "skyfire-api-key": apiKey,
                  },
                  body: JSON.stringify({
                    id: image.imageID,
                    size: image.size,
                    tosConfirmation: true,
                  }),
                }
              )

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }

              const data = await response.json()
              return {
                id: image.imageID,
                partialData: {
                  uri: data.uri,
                  preview: data.display_sizes.find(
                    (size: { name: string }) => size.name === "thumb"
                  ).uri,
                  title: data.title,
                },
                success: true,
              }
            } catch (error) {
              console.error(`Error downloading image ${image.imageID}:`, error)
              return {
                id: image.imageID,
                success: false,
              }
            }
          }
        )

        const results = await Promise.all(downloadPromises)

        return {
          role: "function",
          name: "purchase_images",
          content: JSON.stringify(results),
        }
      }
    )
  }

  public static override ClientComponent: React.FC<{
    data: {
      role: string
      name: string
      content: string
    }
  }> = ({ data }) => {
    return <Component data={data} />
  }
}
