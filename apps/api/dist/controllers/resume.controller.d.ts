import multer from "multer";
export declare const resumeUpload: multer.Multer;
export declare const parseResume: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
export declare const generateResume: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
export declare const sampleResumeOutput: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => void;
