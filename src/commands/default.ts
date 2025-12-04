import { askAI } from "../ai";

const SYSTEM_INSTRUCTION = `You are a senior full-stack AI coding assistant.
Respond clearly and only with useful code or explanation.`;

export const defaultCommand = async (query: string) => {
  return askAI(query, {
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};
