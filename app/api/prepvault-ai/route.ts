import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = body.message

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      )
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are PrepVault AI, a helpful study assistant for engineering students.

Always format your responses using clean Markdown structure.

Use the following formatting rules:

- Use headings (##) for main sections
- Use bullet points or numbered lists
- Keep explanations concise and readable
- Highlight important concepts using **bold**
- Provide step-by-step learning paths
- When suggesting resources, present them as bullet lists
- Avoid writing large unstructured paragraphs
- Use code blocks when explaining code

Your job is to help engineering students by:
- creating structured study roadmaps
- helping them build study plans
- recommending learning resources
- explaining difficult concepts
- helping with coding doubts
- preparing them for interviews.`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      }
    )

    const data = await groqResponse.json()

    if (!groqResponse.ok) {
      console.error("Groq API error:", data)
      return NextResponse.json(
        { reply: "PrepVault AI is temporarily unavailable." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reply: data.choices[0].message.content
    })

  } catch (error) {
    console.error("Server error:", error)

    return NextResponse.json(
      { reply: "PrepVault AI is temporarily unavailable." },
      { status: 500 }
    )
  }
}