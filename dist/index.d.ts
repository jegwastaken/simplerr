import { Request, Response, NextFunction } from "express";
declare type ErrObj = {
    [propName: string]: {
        status: number;
        code: string;
        message: string;
    };
};
export declare const errObj: ErrObj;
export declare function handler(err: any, req: Request, res: Response, next: NextFunction): import("express-serve-static-core").Response;
export declare function joinErrors({ status, code, message, errors }: any): {
    status: any;
    code: any;
    message: any;
    errors: any;
};
export declare function invalidRequest({ message, errors }: any): {
    status: any;
    code: any;
    message: any;
    errors: any;
};
export declare function formatValidationErrs(errs: any): any;
export declare function getValidationErrs(req: Request): false | {
    status: any;
    code: any;
    message: any;
    errors: any;
};
export {};
