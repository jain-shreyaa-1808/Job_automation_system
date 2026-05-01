import multer from "multer";
export declare const resumeUpload: multer.Multer;
export declare const parseResume: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
/** GET /resume/profile — return the persisted resume profile for current user */
export declare const getResumeProfile: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
/** PUT /resume/profile — update the resume by re-uploading (replaces old one) */
export declare const updateResume: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
export declare const generateResume: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
export declare const downloadResumeTex: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
export declare const sampleResumeOutput: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
