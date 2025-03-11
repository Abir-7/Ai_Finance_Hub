import app from "./app";
import { appConfig } from "./app/config";

app.listen(appConfig.server.port, () => {
  console.log(`Example app listening on port ${appConfig.server.port}`);
});
