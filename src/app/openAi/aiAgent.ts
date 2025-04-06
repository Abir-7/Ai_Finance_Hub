/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { appConfig } from "../config";
import { ExpenseService } from "../modules/finance/expense/expense.service";
import { UserExpensePlanService } from "../modules/users/userExpensePlan/userExpensePlan.service";
import { IncomeService } from "./../modules/finance/income/income.service";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: appConfig.openAi.key,
});

// Define financial tools
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
      description: "Get expense limit in defferent categories of a user",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
];

export async function processQuery(userQuery: string) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "user", content: userQuery },
  ];

  let finalResponse = "";
  let requiresProcessing = true;

  while (requiresProcessing) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    messages.push(message);

    if (message.tool_calls && message.tool_calls.length > 0) {
      // Process all tool calls dynamically
      const toolResponses = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          try {
            let result;
            switch (functionName) {
              case "getAllIncome":
                result = await IncomeService.getIncomeDataByDate(
                  functionArgs.userId
                );
                break;
              case "getAllExpense":
                result = await ExpenseService.getExpenseDataByDate(
                  functionArgs.userId
                );
                break;
              case "getAllIncomeOfPresentMonth":
                result = await IncomeService.getCurrentMonthIncome(
                  functionArgs.userId
                );
                break;
              case "getAllExpenseOfPresentMonth":
                result = await ExpenseService.getCurrentMonthExpense(
                  functionArgs.userId
                );
                break;
              case "getMonthlyUserExpenseLimitData":
                result = await UserExpensePlanService.getUserExpenseLimit(
                  functionArgs.userId
                );
                break;
              default:
                throw new Error(`Financial function ${functionName} not found`);
            }

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

      messages.push(...toolResponses);
    } else {
      finalResponse = message.content || "";
      requiresProcessing = false;
    }
  }

  return finalResponse;
}
