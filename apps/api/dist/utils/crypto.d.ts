export type EncryptedSecret = {
    encryptedValue: string;
    iv: string;
    tag: string;
};
export declare function encryptSecret(value: string): EncryptedSecret;
export declare function decryptSecret(payload: EncryptedSecret): string;
