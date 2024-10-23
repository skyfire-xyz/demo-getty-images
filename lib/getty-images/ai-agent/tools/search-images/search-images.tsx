import { z } from "zod"

import { BaseTool } from "@/lib/skyfire-sdk/ai-agent/tools/basetool.class"

export class SearchImagesTool extends BaseTool {
  public static override readonly toolName = "search_images"
  public static override readonly instruction = `
    When you need to search for images:
    1. First, respond to the user acknowledging their request and informing them that you'll search for images.
    2. Then, execute the "search_images" tool.
  `

  public override createTool() {
    return this.createBaseTool(
      "Search for images",
      z.object({ query: z.string() }),
      async ({ query }) => {
        // In a real implementation, you would call an API to search for images
        console.log(`Searching for images with query: ${query}`)
        return {
          success: true,
          results: [`image1_${query}`, `image2_${query}`],
        }
      }
    )
  }
  public static override ClientComponent: React.FC<{ results: string[] }> = ({
    results,
  }) => {
    return null
  }
}
