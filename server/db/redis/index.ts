import Redis from "ioredis";
import config from "config";

import { log } from "../../utils";

export type redisOptionsType = {
  host: string;
  port: number;
  pass: string;
  db: number;
};
const redisOptions = config.get<redisOptionsType>("redis");

export const redisClient: Redis.Redis = new Redis(
  redisOptions.port,
  redisOptions.host,
  { password: redisOptions.pass, db: redisOptions.db }
);

redisClient.Promise = global.Promise;

redisClient.on(`message`, (channel, message) => {
  log.info(`redis:message`, channel, message);
});
redisClient.on(`subscribe`, (channel, message) => {
  log.info(`redis:subscribe`, channel, message);
});
redisClient.on(`unsubscribe`, (channel, message) => {
  log.info(`redis:unsubscribe`, channel, message);
});
redisClient.on(`error`, (error) => {
  log.error("redis:error " + JSON.stringify(error));
});
redisClient.on(`ready`, () => {
  log.info(`redis:ready`);
});
redisClient.on(`connect`, async () => {
  log.info(`redis:connect ⚡`);
  await redisClient.flushall();
});
redisClient.on(`reconnecting`, () => {
  log.warn(`redis:reconnecting`);
});
redisClient.on(`end`, () => {
  log.warn(`redis:end`);
});
