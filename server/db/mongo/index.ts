import mongoose from "mongoose";
import bluebird from "bluebird";

import { log } from "../../utils";
import { User } from "./models";

mongoose.Promise = bluebird.Promise;
mongoose.set("debug", false);

export const mongoConnect = async (uri: string, options: object) => {
  try {
    await mongoose.connect(uri, { ...options });
    log.info("mongo:connect ⚡");

    const connection = mongoose.connection;

    await connection.dropDatabase();
    await dropModels([User]);
  } catch (error) {
    log.error("mongo:connect " + JSON.stringify(error));
  }
};

const dropModels = async (dbModels: mongoose.Model<any>[]): Promise<void> => {
  try {
    for (const model of dbModels) {
      const list = await model.db.db
        .listCollections({ name: model.name })
        .toArray();

      if (list.length !== 0) {
        await model.collection.drop();
      } else {
        log.warn(
          `mongo:drop models:collection ${model.collection.name.toUpperCase()} does not exist`
        );
      }
    }
  } catch (error: any) {
    log.error("mongo:drop models " + JSON.stringify(error));
  }
};
