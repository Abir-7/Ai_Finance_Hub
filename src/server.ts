/* eslint-disable no-console */

import server from "./app";
import { appConfig } from "./app/config";

import mongoose from "mongoose";

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(appConfig.database.dataBase_uri as string);
  console.log("MongoDb connected");
  server.listen(
    Number(appConfig.server.port),
    appConfig.server.ip as string,
    () => {
      console.log(
        `Example app listening on port ${appConfig.server.port} & ip:${
          appConfig.server.ip as string
        }`
      );
    }
  );
}
