export type JwtPayload = {
    sub: string;
    email: string;
};
export declare function signAccessToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
