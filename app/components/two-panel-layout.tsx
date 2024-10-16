import React, { useCallback, useEffect, useState } from "react"

import { SiteHeader } from "@/components/site-header"

interface TwoPanelLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
}

export function TwoPanelLayout({ leftPanel, rightPanel }: TwoPanelLayoutProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [leftWidth, setLeftWidth] = useState(33.33) // Initial width in percentage
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768) // Adjust this breakpoint as needed
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [checkMobile])

  const handleMouseDown = useCallback(() => {
    if (!isMobile) {
      setIsDragging(true)
    }
  }, [isMobile])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && !isMobile) {
        const newWidth = (e.clientX / window.innerWidth) * 100
        setLeftWidth(Math.max(20, Math.min(80, newWidth))) // Limit width between 20% and 80%
      }
    },
    [isDragging, isMobile]
  )

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <div className="h-1/2 overflow-y-auto border-b border-gray-200">
          <SiteHeader />
          <div className="p-4">{leftPanel}</div>
        </div>
        <div className="h-1/2 overflow-y-auto">
          <div className="p-4">{rightPanel}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <div
        className="p-4 border-r border-gray-600 overflow-y-auto"
        style={{ width: `${leftWidth}%` }}
      >
        <SiteHeader />
        <div className="mt-4">{leftPanel}</div>
      </div>
      <div
        className="w-1 bg-gray-00 cursor-col-resize hover:bg-gray-300 transition-colors"
        onMouseDown={handleMouseDown}
      />
      <div
        className="p-4 overflow-y-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  )
}
