"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, X } from "lucide-react";
import { DefaultChatTransport } from "ai";

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3000/api/chat/fanlink-landing-vercel-app--1754330289750",
    }),
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const isLoading = status === "streaming" || status === "submitted";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMessageContent = (message: any) => {
    if (message.parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return message.parts.map((part: any, index: number) => {
        if (part.type === "text") {
          return <span key={index}>{part.text}</span>;
        }
        return null;
      });
    }
    return message.content || "";
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent
  className="h-[100vh] !w-full !sm:w-96 ml-auto flex flex-col !border-0"

  data-vaul-drawer-direction="right"
>
  <DrawerHeader className="flex flex-row items-center justify-between p-4 border-b border-white/10">
    <DrawerTitle className="text-lg font-semibold">
      AI Chat Assistant
    </DrawerTitle>
    <DrawerClose className="text-primary hover:text-gray-700">
      <X className="h-5 w-5" />
    </DrawerClose>
  </DrawerHeader>

  {/* Mensajes scrollables */}
 <div className="flex-1 overflow-y-auto space-y-4 p-4">
  {messages.length === 0 ? (
    <div className="text-center text-muted-foreground py-8">
      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Start a conversation with the AI assistant!</p>
    </div>
  ) : (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="text-sm">{renderMessageContent(message)}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}

      {/* 👇 Agrega este bloque */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg px-4 py-2 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">AI is typing...</p>
          </div>
        </div>
      )}
    </>
  )}

  {/* Scroll anchor */}
  <div ref={bottomRef} />
</div>



  {/* Input */}
  <form
    onSubmit={(e) => {
      e.preventDefault();
      sendMessage({ text: input });
      setInput("");
    }}
    className="flex space-x-2 p-4 border-t border-white/10"
  >
    <Input
      value={input}
      onChange={(e) => setInput(e.currentTarget.value)}
      placeholder="Type your message..."
      disabled={isLoading}
      className="flex-1"
    />
    <Button
      type="submit"
      disabled={!input.trim() || isLoading}
      size="icon"
      className="bg-primary"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  </form>
</DrawerContent>

    </Drawer>
  );
}
