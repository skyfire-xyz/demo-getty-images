"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { UseChatHelpers } from "ai/react"
import { AxiosResponse } from "axios"
import { AlertCircle, ChevronDown, X } from "lucide-react"

import ChatBlob from "@/lib/skyfire-sdk/ai-agent/chat-blob"
import {
  ComposeEmailTool,
  SendEmailTool,
} from "@/lib/skyfire-sdk/ai-agent/tools"
import ChatErrorMessage from "@/lib/skyfire-sdk/components/chat-error-message"
import { useSkyfireResponses } from "@/lib/skyfire-sdk/context/context"
import { addDatasets } from "@/lib/skyfire-sdk/hooks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { PurchaseImagesTool, ShowImagesTool } from "../ai-agent/tools"

interface AIChatPanelProps {
  aiChatProps: UseChatHelpers
  errorMessage?: {
    message: string
    data: any
  } | null
}

export default function AIChatUI({
  aiChatProps,
  errorMessage,
}: AIChatPanelProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    setInput,
  } = aiChatProps
  const path = usePathname()
  const responses = useSkyfireResponses(path)
  const formRef = useRef<HTMLFormElement>(null)

  const quickPrompts = useMemo(() => {
    if (!responses || responses.length === 0) return new Set<string>()
    return new Set<string>(
      responses.reduce(
        (arr: string[], res: AxiosResponse) => {
          return [...arr, ...(res.config.metadataForAgent?.customPrompts || [])]
        },
        ["find me some cat images", "show me my purchase history"]
      )
    )
  }, [responses])

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const bottomThreshold = 100
      setShowScrollButton(
        scrollHeight - scrollTop - clientHeight > bottomThreshold
      )
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll)
      return () => chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleManualSubmit = (prompt: string) => {
    const event = {
      target: { value: prompt },
    } as React.ChangeEvent<HTMLInputElement>
    handleInputChange(event)
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit()
      }
    }, 0)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    addDatasets(responses, messages, setMessages)
    handleSubmit(e)
  }

  const filteredMessages = messages.filter((message) => {
    if (
      (message.role === "user" &&
        (message.content.startsWith("<Data>") ||
          message.content.startsWith("<Email>"))) ||
      message.id === "instruction"
    )
      return false
    return true
  })

  return (
    <Card
      className="w-full mx-auto flex flex-col h-[calc(100vh-116px)]"
      ref={cardRef}
    >
      <CardContent className="flex-grow overflow-hidden p-0 relative">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-scroll overflow-x-hidden p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div className="flex justify-start items-start mb-4">
            <div className="flex items-start">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
              </Avatar>
              <div className="mx-2 p-3 rounded-lg bg-muted max-w-[calc(100%-50px)]">
                <p className="mb-2">
                  Welcome to the Getty Images AI Agent. what can I do for you?
                </p>
              </div>
            </div>
          </div>
          {filteredMessages.map((message, index) => (
            <>
              <ChatBlob key={message.id} message={message} />
              {message.toolInvocations?.map((tool, toolIndex) => {
                if (tool.toolName === "purchase_images") {
                  if (tool.state === "result" && tool.result) {
                    return (
                      <PurchaseImagesTool.ClientComponent
                        key={toolIndex}
                        data={tool.result}
                      />
                    )
                  }
                } else if (tool.toolName === "show_images") {
                  return (
                    <ShowImagesTool.ClientComponent
                      key={toolIndex}
                      imageIDs={tool.args.imageIDs}
                    />
                  )
                } else if (tool.toolName === "compose_email") {
                  return (
                    <ComposeEmailTool.ClientComponent
                      key={toolIndex}
                      initialData={{
                        to: tool.args.to,
                        subject: tool.args.subject,
                        body: tool.args.body,
                      }}
                      disabled={index !== filteredMessages.length - 1}
                      onSubmit={async (args) => {
                        setMessages([
                          ...messages,
                          {
                            id: `send_email_${index}`,
                            role: "user",
                            content: `<Email>${JSON.stringify(args)}`,
                          },
                        ])
                        handleManualSubmit(`Email to ${args.to}`)
                      }}
                      onCancel={() => {
                        console.log("cancel")
                      }}
                    />
                  )
                } else if (tool.toolName === "send_email") {
                  if (tool.state === "result" && tool.result) {
                    return (
                      <SendEmailTool.ClientComponent
                        result={JSON.parse(tool.result.content)}
                      />
                    )
                  }
                }
                return null
              })}
            </>
          ))}
          {isLoading && (
            <div className="flex justify-start items-start mb-4">
              <div className="flex items-start">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage
                    src="/ai-avatar.png"
                    alt="AI Avatar"
                    className="animate-pulse"
                  />
                </Avatar>
                <div className="mx-2 p-3 rounded-lg bg-muted max-w-[calc(100%-50px)]">
                  <span className="inline-block animate-pulse">
                    Thinking<span className="dots">...</span>
                  </span>
                </div>
              </div>
            </div>
          )}
          {errorMessage && <ChatErrorMessage errorMessage={errorMessage} />}
        </div>
        {showScrollButton && (
          <Button
            className="absolute bottom-4 right-4 rounded-full p-2"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
      <CardFooter className="p-4 flex-shrink-0">
        <div className="w-full space-y-4">
          <div className="flex flex-wrap gap-2">
            {[...quickPrompts].map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowQuickPrompts(false)
                  handleManualSubmit(prompt)
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="flex gap-2 w-full items-center"
          >
            <input
              className="flex-grow p-4 border rounded-lg bg-white text-black"
              value={input}
              placeholder="Ask something"
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-lg h-full p-4"
            >
              Send
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  )
}
