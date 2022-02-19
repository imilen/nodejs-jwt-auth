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

class RedisClient {
  private static instance: RedisClient;
  public redisClient?: Redis.Redis;

  private constructor() {
    try {
      this.configRegis();
    } catch (error) {
      log.error(error);
    }
  }

  public static getInstance() {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }

    return RedisClient.instance;
  }

  private async configRegis() {
    if (!this.redisClient) {
      this.redisClient = new Redis(redisOptions.port, redisOptions.host, {
        password: redisOptions.pass,
        db: redisOptions.db,
      });
      this.redisClient.Promise = global.Promise;
      this.redisClient.on(`message`, (channel, message) => {
        log.info(`redis:message`, channel, message);
      });
      this.redisClient.on(`subscribe`, (channel, message) => {
        log.info(`redis:subscribe`, channel, message);
      });
      this.redisClient.on(`unsubscribe`, (channel, message) => {
        log.info(`redis:unsubscribe`, channel, message);
      });
      this.redisClient.on(`error`, (error) => {
        log.error("redis:error " + JSON.stringify(error));
      });
      this.redisClient.on(`ready`, () => {
        log.info(`redis:ready`);
      });
      this.redisClient.on(`connect`, async () => {
        log.info(`redis:connect ⚡`);
        await this.redisClient?.flushall();
      });
      this.redisClient.on(`reconnecting`, () => {
        log.warn(`redis:reconnecting`);
      });
      this.redisClient.on(`end`, () => {
        log.warn(`redis:end`);
      });
    }
  }
}

export const { redisClient } = RedisClient.getInstance();
