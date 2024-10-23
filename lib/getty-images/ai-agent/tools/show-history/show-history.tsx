import { z } from "zod"

import { BaseTool } from "@/lib/skyfire-sdk/ai-agent/tools/basetool.class"

export class ShowHistoryTool extends BaseTool {
  public static override readonly toolName = "show_history"
  public static override readonly instruction = `
    When the user asks to see their purchase history:
    1. First, respond to the user confirming that you'll retrieve their purchase history.
    2. Then, execute the "show_history" tool.
  `

  public override createTool() {
    return this.createBaseTool(
      "Show purchase history",
      z.object({}),
      async () => {
        // In a real implementation, you would fetch the user's purchase history
        console.log("Fetching purchase history")
        return {
          success: true,
          history: [
            { id: "img1", name: "Sunset", date: "2023-05-01" },
            { id: "img2", name: "Mountain", date: "2023-05-15" },
          ],
        }
      }
    )
  }

  public static override ClientComponent: React.FC<{
    history: Array<{ id: string; name: string; date: string }>
  }> = ({ history }) => {
    return null
  }
}
