import React from "react"

import { SiteHeader } from "@/components/site-header"

interface TwoPanelLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
}

export function TwoPanelLayout({ leftPanel, rightPanel }: TwoPanelLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 border-r border-gray-200 overflow-y-auto">
        <SiteHeader />
        <div className="mt-4">{leftPanel}</div>
      </div>
      <div className="w-2/3 p-4 overflow-y-auto">{rightPanel}</div>
    </div>
  )
}
