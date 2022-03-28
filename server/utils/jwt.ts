import jwt from "jsonwebtoken";
import config from "config";
import _ from "lodash";
import path from "path";
import fs from "fs";
import pify from "pify";
import forge from "node-forge";

const a = pify(fs).read;

import { UserDocument } from "../db/mongo/models";
import { log } from "../utils";
import { jwtOptionsType } from "../../config/common";

// extract configuration options
const {
  accessTokenTtl,
  refreshTokenTtl,
  accessTokenFlag,
  refreshTokenFlag,
  algorithms,
} = config.get<jwtOptionsType>("jwt");

const jwtKeysPath = path.join(__dirname, "..", "certificate", "jwt");

export async function generateJwtToken(
  user: UserDocument,
  expiresIn: any,
  tokenFlag: string
): Promise<string> {
  const typeToken =
    tokenFlag === accessTokenFlag ? "access token" : "refresh token";

  try {
    const { email, role } = _.pick(user, ["email", "role"]);

    const privateKeyFilePath = path.join(
      jwtKeysPath,
      `rsa_private.${tokenFlag}.pem`
    );
    const privateKey = await pify(fs.readFile)(privateKeyFilePath, {
      encoding: "utf8",
    });

    const jwtToken = jwt.sign({ email, role }, privateKey, {
      expiresIn,
      issuer: "localhost",
      audience: "localhost",
      subject: email,
      algorithm: algorithms[0],
    });

    if (!jwtToken) {
      throw new Error(`Have a problem with ${typeToken}!`);
    }

    return jwtToken;
  } catch (error: any) {
    log.error(`${generateJwtToken.name}:${typeToken}: ${error.message}`);
    return error;
  }
}

export function generateJwtKeys() {
  try {
    [accessTokenFlag, refreshTokenFlag].forEach(async (tokenFlag) => {
      const keyPair = forge.pki.rsa.generateKeyPair(2 * 1024);

      const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);

      const publicKeyFilePath = path.join(
        jwtKeysPath,
        `rsa_public.${tokenFlag}.pem`
      );
      await pify(fs.writeFile)(publicKeyFilePath, publicKey, {
        encoding: "utf8",
      });

      const privateKeyFilePath = path.join(
        jwtKeysPath,
        `rsa_private.${tokenFlag}.pem`
      );
      await pify(fs.writeFile)(privateKeyFilePath, privateKey, {
        encoding: "utf8",
      });
    });
  } catch (error: any) {
    log.error(`${generateJwtKeys.name}: ${error.message}`);
  }
}
