import { NextRequest, NextResponse } from "next/server"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatRequest {
  message: string
  history: Message[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      )
    }

    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're asking. Here's my perspective on that topic.",
      "Great question! Based on what you've shared, I think...",
      "I'd be happy to help you with that. Let me provide some insights.",
      "That's a thoughtful inquiry. Here's what I can tell you about that.",
      "I see what you're getting at. Let me break this down for you.",
      "Excellent point! Here's how I would approach that situation.",
      "I appreciate you asking about that. Here's my analysis.",
      "That's definitely worth exploring. Let me share some thoughts.",
      "Good question! I think the key considerations here are..."
    ]

    let response = responses[Math.floor(Math.random() * responses.length)]
    
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      response = "Hello! I'm your AI assistant. How can I help you today?"
    } else if (message.toLowerCase().includes("help")) {
      response = "I'm here to help! You can ask me questions about various topics, and I'll do my best to provide useful information and assistance."
    } else if (message.toLowerCase().includes("thank")) {
      response = "You're very welcome! I'm glad I could help. Is there anything else you'd like to know?"
    } else if (message.toLowerCase().includes("bye") || message.toLowerCase().includes("goodbye")) {
      response = "Goodbye! Feel free to come back anytime if you have more questions. Have a great day!"
    }

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
