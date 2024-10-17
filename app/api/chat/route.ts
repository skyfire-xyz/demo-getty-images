import { NextResponse } from "next/server"
import { LanguageModelV1FunctionTool } from "@ai-sdk/provider"
import { convertToCoreMessages, streamText, tool } from "ai"

import { SKYFIRE_ENDPOINT_URL } from "@/lib/skyfire-sdk/env"

import { SkyfireProvider } from "./skyfire-provider"

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

  const skyfireProvider = new SkyfireProvider(
    "openai/chatgpt-4o-latest",
    apiKey
  )

  try {
    const result = await streamText({
      model: skyfireProvider,
      messages: convertToCoreMessages(messages),
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
