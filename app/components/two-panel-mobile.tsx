"use client"

import * as React from "react"
import { ChevronUp } from "lucide-react"

import { useGettyImages } from "@/lib/getty-images/context"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { SiteHeader } from "@/components/site-header"

interface TwoPanelLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  header: React.ReactNode
}

export default function TwoPanelLayout({
  leftPanel,
  rightPanel,
  header,
}: TwoPanelLayoutProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const { searchTerm, purchaseHistory, searchLoading } = useGettyImages()

  React.useEffect(() => {
    if (searchTerm) {
      setIsOpen(true)
    }
    if (purchaseHistory && purchaseHistory.length) {
      setIsOpen(true)
    }
  }, [searchTerm, purchaseHistory, searchLoading])

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow p-6 overflow-auto">{leftPanel}</main>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[95%] max-h-[95vh]">
          <div className="mx-auto w-full">
            {header && header}
            <div className="p-4 pb-0 overflow-y-auto max-h-[calc(95vh-10rem)]">
              {rightPanel}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
