import { GoogleGenAI } from "@google/genai";

// Initialize the client strictly with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTutorResponse = async (
  question: string,
  history: { role: string; content: string }[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct a context-aware prompt
    const systemInstruction = `You are Professor Hologram, a world-class expert in optics, wave physics, and holography. 
    Your goal is to explain concepts like interference, diffraction, wavefronts, the Gabor limit, and off-axis separation to students.
    Keep explanations clear, concise, and engaging. Use analogies.
    If the user asks about "Inline" or "Gabor" holography, mention the twin-image problem.
    If they ask about "Off-axis" or "Leith-Upatnieks", explain how the carrier frequency separates the orders.
    Do not use LaTeX formatting heavily, use plain text or simple unicode characters for math where possible.`;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage({ message: question });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I'm having trouble connecting to the optical network. Please check your API key or try again later.");
  }
};