/* eslint-disable @typescript-eslint/no-explicit-any */

// --- Your imported services here ---
import { ExpenseService } from "../../modules/finance/expense/expense.service";
import { UserExpensePlanService } from "../../modules/users/userExpensePlan/userExpensePlan.service";
import { IncomeService } from "../../modules/finance/income/income.service";
import { categories } from "../../modules/finance/expense/expense.interface";
import OpenAI from "openai";
import { openai } from "./openAi";

// Tools definition as per your original code
const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getAllIncome",
      description: "Get all income records for a user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAllExpense",
      description: "Get all expense records for a user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAllExpenseOfPresentMonth",
      description: "Get all expense records of present month for a user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAllIncomeOfPresentMonth",
      description: "Get all income records of present month for a user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getMonthlyUserExpenseLimitData",
      description:
        "Get expense limit in different categories of a user. If value 0, user has not set data. Advise to add these data.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "saveExpenseData",
      description: "Save new expense data for a user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          expenseData: {
            type: "object",
            description: `Expense data to save. Pick category from this: ${categories}. method: card or cash`,
            properties: {
              amount: { type: "number" },
              category: { type: "string" },
              method: { type: "string" },
              note: { type: "string" },
              description: {
                type: "object",
                properties: {
                  info: { type: "string" },
                  images: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["info"],
              },
            },
            required: ["amount", "category", "method", "description"],
          },
        },
        required: ["userId", "expenseData"],
      },
    },
  },
];

// In-memory sessions store: sessionId => messages[]
const sessions: Record<
  string,
  OpenAI.Chat.Completions.ChatCompletionMessageParam[]
> = {};

// Map tool functions to your services
const functionMap = {
  getAllIncome: (args: any) => IncomeService.getIncomeDataByDate(args.userId),
  getAllExpense: (args: any) =>
    ExpenseService.getExpenseDataByDate(args.userId),
  getAllIncomeOfPresentMonth: (args: any) =>
    IncomeService.getCurrentMonthIncome(args.userId),
  getAllExpenseOfPresentMonth: (args: any) =>
    ExpenseService.getCurrentMonthExpense(args.userId),
  getMonthlyUserExpenseLimitData: (args: any) =>
    UserExpensePlanService.getUserExpenseLimit(args.userId),
  saveExpenseData: (args: any) =>
    ExpenseService.addExpense([], args.expenseData, args.userId),
};

// Helper to extract text from content part array or string
function extractTextFromContent(
  content: string | OpenAI.Chat.Completions.ChatCompletionContentPart[]
): string {
  if (typeof content === "string") return content;
  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");
}

// Main processQuery function with session memory
export async function processQuery(
  sessionId: string,
  userQuery: string,
  url: string
): Promise<string> {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: userQuery },
  ];
  if (url) {
    content.push({ type: "image_url", image_url: { url } });
  }

  // Append user message to session
  sessions[sessionId].push({
    role: "user",
    content,
  });

  const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam =
    {
      role: "system",
      content: `
You are a financial assistant.

**Your behavior:**

1. Only call tools if the user clearly requests it.
2. If the topic is not finance-related, respond politely.
3. Never return raw image URLs.
    `,
    };

  // Prepare messages with system prompt + session conversation
  // const messages = [systemMessage, ...sessions[sessionId]];
  const MAX_HISTORY = 5;
  const recentMessages = sessions[sessionId].slice(-MAX_HISTORY);
  const messages = [systemMessage, ...recentMessages];
  // Quick local check for "what was my 1st question"
  if (userQuery.toLowerCase().includes("what was my 1st question")) {
    const firstUserMsg = sessions[sessionId].find((m) => m.role === "user");
    if (firstUserMsg) {
      return `Your first question was: "${extractTextFromContent(
        firstUserMsg.content
      )}"`;
    } else {
      return "I don't have any record of your first question yet.";
    }
  }

  let finalResponse = "";
  const maxLoops = 4;

  for (let i = 0; i < maxLoops; i++) {
    const response = await openai.chat.completions.create({
      tools,
      model: "gpt-4o-mini",
      messages,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    if (message.tool_calls?.length) {
      const toolResponses = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const { name, arguments: argsRaw } = toolCall.function;
          const args = JSON.parse(argsRaw);

          try {
            const handler = functionMap[name as keyof typeof functionMap];
            if (!handler) throw new Error(`Unknown tool: ${name}`);
            const result = await handler(args);

            return {
              role: "tool" as const,
              content: JSON.stringify(result),
              tool_call_id: toolCall.id,
            };
          } catch (error) {
            return {
              role: "tool" as const,
              content: JSON.stringify({ error: (error as Error).message }),
              tool_call_id: toolCall.id,
            };
          }
        })
      );

      // Append assistant message and tool results to session
      sessions[sessionId].push(message, ...toolResponses);

      // Append to messages array to keep updated for next iteration
      messages.push(message, ...toolResponses);
    } else {
      finalResponse = message.content || "";
      sessions[sessionId].push(message);
      break;
    }
  }
  return finalResponse;
}
