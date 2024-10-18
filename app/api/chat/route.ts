import { title } from "process"
import { NextResponse } from "next/server"
import { streamText, tool } from "ai"
import { z } from "zod"

import { SKYFIRE_ENDPOINT_URL } from "@/lib/skyfire-sdk/env"

import { createSkyfireOpenAI } from "./skyfire-openai-provider"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const apiKey = req.headers.get("skyfire-api-key")

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 401 })
  }

  if (!SKYFIRE_ENDPOINT_URL) {
    return NextResponse.json(
      { error: "Missing Skyfire Endpoint URL" },
      { status: 500 }
    )
  }

  const skyfireWithOpenAI = createSkyfireOpenAI({
    apiKey: apiKey,
  })

  try {
    const result = await streamText({
      model: skyfireWithOpenAI("gpt-4o"),
      messages: messages,
      tools: {
        search_images: tool({
          description: "Search for images",
          parameters: z.object({ query: z.string() }),
        }),
        show_history: tool({
          description: "Show purchase history",
          parameters: z.object({}),
        }),
        show_images: tool({
          description: "Talk about images",
          parameters: z.object({
            imageIDs: z.array(z.string()),
          }),
        }),
        purchase_images: tool({
          description: "Purchase Images",
          parameters: z.object({
            images: z.array(
              z.object({
                imageID: z.string(),
                size: z.string(),
              })
            ),
          }),
          execute: async ({ images }) => {
            const downloadPromises = images.map(async (image) => {
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
                console.error(
                  `Error downloading image ${image.imageID}:`,
                  error
                )
                return {
                  id: image.imageID,
                  success: false,
                }
              }
            })

            const results = await Promise.all(downloadPromises)

            return {
              role: "function",
              name: "purchase_images",
              content: JSON.stringify(results),
            }
          },
        }),
      },
    })

    // Return the streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "An error occurred during the request" },
      { status: 500 }
    )
  }
}
