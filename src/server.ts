/* eslint-disable no-console */
import app from "./app";
import { appConfig } from "./app/config";

app.listen(Number(appConfig.server.port), appConfig.server.ip as string, () => {
  console.log(`Example app listening on port ${appConfig.server.port}`);
});
