/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ExpenseService } from "../../modules/finance/expense/expense.service";

import { UserExpensePlanService } from "../../modules/users/userExpensePlan/userExpensePlan.service";
import { IncomeService } from "../../modules/finance/income/income.service";
import OpenAI from "openai";
import { openai } from "./openAi";
import { categories } from "../../modules/finance/expense/expense.interface";

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
        "Get expense limit in defferent categories of a user. if value 0  thats mean user not set data. advice to add these data.",
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
            description: `Expense data to save.pick category from this: ${categories}. method: card or cash`,
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

export async function processQuery(userQuery: string, url: string) {
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: userQuery },
  ];

  if (url) {
    content.push({ type: "image_url", image_url: { url } });
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
  You are a financial assistant.
  
  **Your behavior:**
  
  1. Only call tools (like saveExpenseData) if the user clearly requests it.
     - Use intent keywords like: "save", "analyze", "explain", "review", or similar.
     - Example valid prompts:
       - "Please save this expense image"
       - "Explain the attached bill"
     - Invalid prompts:
       - "Check this out"
       - Vague or unclear instructions
  
  2. If the user does not clearly request saving or analyzing the image, do **not** call any tool. Just describe what’s seen if relevant.
  
  3. If the topic is not finance-related, respond with:
     > "I'm here to help with finance-related topics. Feel free to ask me about budgeting, expenses, income, or savings!"
  
  4. Never return raw image URLs.
      `,
    },
    { role: "user", content },
  ];

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
      messages.push(message, ...toolResponses);
    } else {
      finalResponse = message.content || "";
      break;
    }
  }

  return finalResponse;
}
