import { NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

import {
  createTools,
  toolsInstruction,
} from "@/lib/getty-images/ai-agent/tools"
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
    // Create tools
    const tools = createTools(SKYFIRE_ENDPOINT_URL, apiKey)

    const result = await streamText({
      model: skyfireWithOpenAI("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that can help with image searches and show purchase history`,
        },
        { role: "system", content: toolsInstruction }, // Instructions fortools
        {
          role: "system",
          content: `Always respond to the user's request with a text message first before using any tools.
Remember, in all cases, always provide a text response to the user before executing any tool. This ensures clear communication and sets expectations for the user about what actions you're taking.
Also when you display price of the image, you must divide the amount that you get from the JSON data by 1,000,000 and display it as dollars. For example, if the amount is 1000, you should display it as $0.001.`,
        },
        ...messages,
      ],
      tools,
    })

    console.log(toolsInstruction, "toolsInstruction")

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
