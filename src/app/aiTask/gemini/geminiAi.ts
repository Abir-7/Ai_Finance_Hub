// utils/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { appConfig } from "../../config";

export const genAI = new GoogleGenerativeAI(
  appConfig.aiKey.geminiAi.key as string
);
