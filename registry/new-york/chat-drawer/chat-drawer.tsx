"use client";

import { useState } from "react";
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
      api: "http://localhost:3001/api/chat/dev-xynapse-ai-1753894361902",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const renderMessageContent = (message: any) => {
    if (message.parts) {
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
          className="fixed bottom-6 right-6 h-14 w-14 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="h-full w-96 ml-auto"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="flex flex-row items-center justify-between p-4 border-b border-white/10">
          <DrawerTitle className="text-lg font-semibold">
            AI Chat Assistant
          </DrawerTitle>
          <DrawerClose className="text-blue-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </DrawerClose>
        </DrawerHeader>
        <div className="-mx-6">
        <hr className="w-full border-blue-200 border rounded-full" />
        </div>
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the AI assistant!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{renderMessageContent(message)}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">AI is typing...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
           <div className="-mx-6">
        <hr className="w-full border-blue-200 border mb-4 rounded-full" />
        </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage({ text: input });
              setInput("");
            }}
            className="flex space-x-2"
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
              className="bg-blue-5qs00"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
         
        </div>
      </DrawerContent>
    </Drawer>
  );
}
