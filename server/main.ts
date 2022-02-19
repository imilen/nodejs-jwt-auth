import http from "http";
import https from "https";
import config from "config";

import { log } from "./utils";
import { mongoConnect } from "./db/mongo";
// import extractFromKS from "./certificate/https/generateKeys";
import { app } from "./app";

// extract configuration options
const port = config.get<number>("port");
const mongo = config.get<{ uri: string; options: object }>("mongo");

// http server
const httpServer = http.createServer(app);
httpServer.listen(port);
httpServer.on("listening", () => log.info(`server:listening ${port} 🔓`));
httpServer.on("error", (error: any) =>
  log.error(`server:error: ${error.message}`)
);

// const httpsKeys = extractFromKS();
// const httpsServer = https.createServer(
//   {
//     cert: httpsKeys.cert,
//     key: httpsKeys.key,
//   },
//   app
// );
// httpsServer.listen(443);
// httpsServer.on("listening", () => log.info(`server:listening: 443 🔐`));
// httpsServer.on("error", (error: any) =>
//   log.error(`server:error: ${error.message}`)
// );

// database
mongoConnect(mongo.uri, mongo.options);
