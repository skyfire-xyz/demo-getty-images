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
