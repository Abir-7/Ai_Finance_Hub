/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ALLOWED_EXPENSE_CATEGORIES } from "./aiDbWriteAgent";
import { openai } from "./openAi";

const system = `
You are a financial assistant that extracts expense information from natural language.

Your only job is to return a **valid JSON object** that matches this structure:
{
  amount: Number,
  category: One of: ${ALLOWED_EXPENSE_CATEGORIES.join(", ")},
  method: One of: "cash" or "card"(default:"cash"),
  note: String (optional),
  description: {
    info: String,
    images: String[] (can be empty [])
  }
}

⚠️ Output must be JSON only — no markdown, explanation, or extra text.
⚠️ Never include income. Only process expense data.
⚠️ If description.images are not provided, return an empty array [].
⚠️ Always return a complete JSON even if some fields are inferred.
⚠️ user and tId are not needed in this response. Those will be added later in the backend.
⚠️ If the input is vague or incomplete, respond with:
{ "error": "Not enough information to generate expense data." }

Example:
Input: "I spent 30 euros on fuel using card. Filled the tank."
Output:
{
  "amount": 30,
  "category": "transportation",
  "method": "card",
  "note": "Filled the tank",
  "description": {
    "info": "Fuel purchase",
    "images": []
  }
}
`;

export async function getExpenseJsonFromPrompt(promptText: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: system, // The above content
      },
      {
        role: "user",
        content: promptText,
      },
    ],
    temperature: 0.3,
  });

  const output = response.choices[0].message?.content;
  try {
    return JSON.parse(output || "{}");
  } catch {
    return { error: "Invalid JSON returned from model." };
  }
}
