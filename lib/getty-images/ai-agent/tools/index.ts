import {
  ComposeEmailTool,
  SendEmailTool,
} from "@/lib/skyfire-sdk/ai-agent/tools"

import { PurchaseImagesTool } from "./purchase-images/purchase-images"
import { SearchImagesTool } from "./search-images/search-images"
import { ShowHistoryTool } from "./show-history/show-history"
import { ShowImagesTool } from "./show-images/show-images"

export const createTools = (SKYFIRE_ENDPOINT_URL: string, apiKey: string) => {
  const toolInstances = {
    search_images: new SearchImagesTool(),
    show_history: new ShowHistoryTool(),
    show_images: new ShowImagesTool(),
    purchase_images: new PurchaseImagesTool({ SKYFIRE_ENDPOINT_URL, apiKey }),
    compose_email: new ComposeEmailTool(),
    send_email: new SendEmailTool({ SKYFIRE_ENDPOINT_URL, apiKey }),
  }

  return Object.fromEntries(
    Object.entries(toolInstances).map(([name, instance]) => [
      name,
      instance.createTool(),
    ])
  )
}

export const tools = {
  SearchImagesTool,
  ShowHistoryTool,
  ShowImagesTool,
  PurchaseImagesTool,
  ComposeEmailTool,
  SendEmailTool,
}

export type ToolName = keyof typeof tools

export const toolsInstruction = Object.values(tools)
  .map((Tool) => Tool.instruction)
  .join("\n\n")

export {
  SearchImagesTool,
  ShowHistoryTool,
  ComposeEmailTool,
  ShowImagesTool,
  PurchaseImagesTool,
  SendEmailTool,
}
