import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "../.env") });

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askAI = async (
  prompt: string,
  modelParameters: Partial<GenerateContentParameters>
) => {
  try {
    const { model = "gemini-2.5-flash", ...rest } = modelParameters;

    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      ...rest,
    });

    return response.text ?? "";
  } catch (error) {
    throw error;
  }
};
