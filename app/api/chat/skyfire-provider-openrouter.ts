import {
  AISDKError,
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1FinishReason,
  LanguageModelV1FunctionToolCall,
  LanguageModelV1StreamPart,
} from "@ai-sdk/provider"

import { SKYFIRE_ENDPOINT_URL } from "@/lib/skyfire-sdk/env"

export class SkyfireProvider implements LanguageModelV1 {
  readonly specificationVersion = "v1" as const
  readonly provider = "skyfire"
  readonly modelId: string
  readonly defaultObjectGenerationMode = "json" as const
  readonly supportsImageUrls = false
  readonly supportsStructuredOutputs = true
  private apiKey: string

  constructor(modelId: string, apiKey: string) {
    this.modelId = modelId
    this.apiKey = apiKey
  }

  async doGenerate(options: LanguageModelV1CallOptions) {
    const response = await this.fetchFromSkyfire(options, false)
    const result = await response.json()

    return {
      text: result.choices[0].message.content,
      finishReason: result.choices[0]
        .finish_reason as LanguageModelV1FinishReason,
      usage: {
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
      },
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: options,
      },
    }
  }

  async doStream(options: LanguageModelV1CallOptions) {
    const response = await this.fetchFromSkyfire(options, true)

    if (!response.body) {
      throw new AISDKError({ name: "StreamError", message: "No response body" })
    }

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        if (!response.body) return
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let finishReason: LanguageModelV1FinishReason | undefined
        let usage:
          | { promptTokens: number; completionTokens: number }
          | undefined
        let currentFunctionCall:
          | Partial<LanguageModelV1FunctionToolCall>
          | undefined

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.trim() === "") continue
              if (line.trim() === "data: [DONE]") {
                if (finishReason && usage) {
                  controller.enqueue({
                    type: "finish",
                    finishReason,
                    usage,
                  })
                }
                return
              }

              let data
              try {
                const jsonStart = line.indexOf("{")
                if (jsonStart !== -1) {
                  const jsonString = line.slice(jsonStart)
                  data = JSON.parse(jsonString)
                } else {
                  console.warn("No JSON object found in line:", line)
                  continue
                }
              } catch (error) {
                console.error("Error parsing JSON:", error, "Line:", line)
                continue
              }

              if (data.choices && data.choices[0]) {
                const choice = data.choices[0]

                if (choice.finish_reason) {
                  finishReason =
                    choice.finish_reason as LanguageModelV1FinishReason
                }

                if (data.usage) {
                  usage = {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                  }
                }

                if (choice.delta && choice.delta.content) {
                  controller.enqueue({
                    type: "text-delta",
                    textDelta: choice.delta.content,
                  })
                }

                if (choice.delta && choice.delta.function_call) {
                  if (!currentFunctionCall) {
                    currentFunctionCall = {
                      toolCallType: "function",
                      toolCallId: choice.delta.function_call.name || "",
                      toolName: choice.delta.function_call.name || "",
                      args: "",
                    }
                  }
                  if (choice.delta.function_call.arguments) {
                    currentFunctionCall.args +=
                      choice.delta.function_call.arguments
                  }
                  if (choice.index === choice.delta.function_call.index) {
                    controller.enqueue({
                      type: "tool-call",
                      ...currentFunctionCall,
                    } as LanguageModelV1StreamPart)
                    currentFunctionCall = undefined
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream reading error:", error)
          controller.error(error)
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return {
      stream,
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: options,
      },
    }
  }

  private async fetchFromSkyfire(
    options: LanguageModelV1CallOptions,
    stream: boolean
  ) {
    let functions
    let functionCall

    if (options.mode.type === "regular") {
      functions = options.mode.tools?.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      }))
      functionCall = options.mode.toolChoice
    } else if (options.mode.type === "object-tool") {
      functions = [
        {
          name: options.mode.tool.name,
          description: options.mode.tool.description,
          parameters: options.mode.tool.parameters,
        },
      ]
      functionCall = { name: options.mode.tool.name }
    }

    // const systemMessage = {
    //   role: "system",
    //   content: this.useJsonResponseFormat
    //     ? "Always respond with a JSON object that includes 'action' and 'content' fields. The 'action' field should describe the type of response, and the 'content' field should contain the actual response text. Your response must be valid JSON."
    //     : "Respond in a clear and concise manner.",
    // }

    // const messages = [systemMessage, ...options.prompt]

    // // Ensure 'json' is mentioned in the messages when using JSON response format
    // if (
    //   this.useJsonResponseFormat &&
    //   !messages.some((msg) => msg.content.toLowerCase().includes("json"))
    // ) {
    //   messages.push({
    //     role: "system",
    //     content: "Remember to format your response as a JSON object.",
    //   })
    // }

    const response = await fetch(
      `${SKYFIRE_ENDPOINT_URL}/proxy/openai/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "skyfire-api-key": this.apiKey,
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: options.prompt,
          // stream: stream,
        }),
      }
    )

    if (!response.ok) {
      console.log(response, "resp;onse")
      if (response.status === 402) {
        throw new AISDKError({
          name: "InsufficientFundsError",
          message:
            "Your account balance is too low for this transaction. Please top-up your account to proceed.",
        })
      }
      throw new AISDKError({
        name: "APIError",
        message: `API request failed with status ${response.status}`,
      })
    }

    return response
  }
}
