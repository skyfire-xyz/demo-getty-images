import { loadApiKey, withoutTrailingSlash } from "@ai-sdk/provider-utils"

import { SKYFIRE_ENDPOINT_URL } from "@/lib/skyfire-sdk/env"

import { OpenAIChatLanguageModel } from "./openai-chat-language-model"
import { OpenAIChatModelId, OpenAIChatSettings } from "./openai-chat-settings"
import { OpenAICompletionLanguageModel } from "./openai-completion-language-model"
import {
  OpenAICompletionModelId,
  OpenAICompletionSettings,
} from "./openai-completion-settings"
import { OpenAIProviderSettings } from "./openai-provider"

/**
@deprecated Use `createOpenAI` instead.
 */
export class OpenAI {
  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
The default prefix is `https://api.openai.com/v1`.
   */
  readonly baseURL: string

  /**
API key that is being send using the `Authorization` header.
It defaults to the `OPENAI_API_KEY` environment variable.
 */
  readonly apiKey?: string

  /**
OpenAI Organization.
   */
  readonly organization?: string

  /**
OpenAI project.
   */
  readonly project?: string

  /**
Custom headers to include in the requests.
   */
  readonly headers?: Record<string, string>

  /**
   * Creates a new OpenAI provider instance.
   */
  constructor(options: OpenAIProviderSettings = {}) {
    ;(this.baseURL = `${SKYFIRE_ENDPOINT_URL}/proxy/openai/v1/chat/completions`),
      (this.apiKey = options.apiKey)
    this.organization = options.organization
    this.project = options.project
    this.headers = options.headers
  }

  private get baseConfig() {
    return {
      organization: this.organization,
      baseURL: this.baseURL,
      headers: () => ({
        "skyfire-api-key": this.apiKey,
        // Authorization: `Bearer ${loadApiKey({
        //   apiKey: this.apiKey,
        //   environmentVariableName: 'OPENAI_API_KEY',
        //   description: 'OpenAI',
        // })}`,
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project,
        ...this.headers,
      }),
    }
  }

  chat(modelId: OpenAIChatModelId, settings: OpenAIChatSettings = {}) {
    return new OpenAIChatLanguageModel(modelId, settings, {
      provider: "openai.chat",
      ...this.baseConfig,
      compatibility: "strict",
      url: ({ path }) => `${this.baseURL}${path}`,
    })
  }

  completion(
    modelId: OpenAICompletionModelId,
    settings: OpenAICompletionSettings = {}
  ) {
    return new OpenAICompletionLanguageModel(modelId, settings, {
      provider: "openai.completion",
      ...this.baseConfig,
      compatibility: "strict",
      url: ({ path }) => `${this.baseURL}${path}`,
    })
  }
}
