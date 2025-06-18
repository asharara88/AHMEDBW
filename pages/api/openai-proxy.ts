// pages/api/openai-proxy.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const messages = req.body.messages;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    });
    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenAI Proxy Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch from OpenAI" });
  }
}

