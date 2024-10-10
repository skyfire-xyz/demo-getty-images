import "@/styles/globals.css"
import { Metadata } from "next"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { GettyImagesProvider } from "@/lib/getty-images/context"
import SkyfireWidget from "@/lib/skyfire-sdk/components/skyfire-widget"
import { SkyfireProvider } from "@/lib/skyfire-sdk/context/context"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SkyfireProvider>
              <GettyImagesProvider>
                <div className="relative flex min-h-screen flex-col">
                  <SkyfireWidget
                    tos={{
                      name: "Terms of Service",
                      link: "https://www.gettyimages.ca/company/terms",
                    }}
                  />
                  <div className="flex-1">{children}</div>
                </div>
                <TailwindIndicator />
              </GettyImagesProvider>
            </SkyfireProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
