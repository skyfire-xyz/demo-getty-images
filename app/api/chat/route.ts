import { rootCertificates } from "tls"
import { NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"

import { SKYFIRE_ENDPOINT_URL } from "@/lib/skyfire-sdk/env"

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

  // Use OpenAI Provider, but replace the base URL with the Skyfire endpoint
  const skyfireWithOpenAI = createOpenAI({
    baseURL: `${SKYFIRE_ENDPOINT_URL}/proxy/openai/v1`,
    headers: {
      "skyfire-api-key": apiKey,
    },
  })

  try {
    const instruction = {
      role: "system",
      content: `
        Tool 1: When user talked about images, you can use the tool "show_images" and provide imageURLs.
      `,
    }
    const result = await streamText({
      model: skyfireWithOpenAI("gpt-4o"),
      messages: [instruction, ...messages],
      tools: {
        show_images: tool({
          description: "Talk about images",
          parameters: z.object({
            imageURLs: z.array(z.string()),
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
