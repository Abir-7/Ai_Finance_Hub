/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { appConfig } from "../config";

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: appConfig.openAi.key,
});
