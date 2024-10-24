import React from "react"
import { z } from "zod"

import { BaseTool } from "@/lib/skyfire-sdk/ai-agent/tools/basetool.class"

import { Component } from "./component"

export class ShowImagesTool extends BaseTool {
  public static override readonly toolName = "show_images"
  public static override readonly instruction = `
Every time when you talk about images base on the searching results: (e.g. your favorite image/picture, best picutre for specific use case, pick an random image, any situation that you are talking about the images from search results etc.)
1. First, respond to the user acknowledging their request and answering their question with details.
2. Then, execute the "show_images" tool with imageIDs as the parameter. Image ID can be found in the JSON object that's been sent before asking the quetsion.

Every time when user talk about images base on the purchase history: (e.g. what's my recent purchase etc.)
1. First, respond to the user acknowledging their request and answering their question with details.
2. Then, execute the "show_images" tool with imageIDs as the parameter. Image ID can be found in the JSON object that's been sent before asking the quetsion.

Make sure to show images using "show_images" tool if your respond contains any image information.
Make sure NOT to display any images in markdown response. You should execute "show_images" tools with image IDs.
  `

  public override createTool() {
    return this.createBaseTool(
      "Talk about images",
      z.object({
        imageIDs: z.array(z.string()),
      }),
      async ({ imageIDs }) => {
        // In a real implementation, you would fetch image data based on the IDs
        console.log(`Showing images with IDs: ${imageIDs.join(", ")}`)
        return { success: true, imageIDs }
      }
    )
  }

  public static override ClientComponent: React.FC<{ imageIDs: string[] }> = ({
    imageIDs,
  }) => {
    return <Component imageIDs={imageIDs} />
  }
}
