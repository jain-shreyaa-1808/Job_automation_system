import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  return createHash("sha256").update(env.AES_SECRET).digest();
}

export type EncryptedSecret = {
  encryptedValue: string;
  iv: string;
  tag: string;
};

export function encryptSecret(value: string): EncryptedSecret {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedValue: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(payload: EncryptedSecret): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encryptedValue, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
