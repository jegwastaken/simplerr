import { Request, Response, NextFunction } from "express";
export declare type ErrObj = {
    readonly status: number;
    readonly name: string;
    readonly code: string;
    readonly message: string;
};
export declare type ErrObjs = {
    [property: string]: ErrObj;
};
export declare const errObjs: {
    badRequest: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    unauthorized: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    forbidden: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    notFound: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    methodNotAllowed: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    conflict: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    /**
     * Deprecated. Use `internalServerError` instead.
     *
     */
    internalServer: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    internalServerError: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
    notImplemented: {
        status: number;
        name: string;
        code: string;
        message: string;
    };
};
export declare function handler(err: any, req: Request, res: Response, next: NextFunction): Response<any>;
export declare function joinErrors({ status, name, code, message, errors }: any): {
    status: any;
    name: any;
    code: any;
    message: any;
    errors: any;
};
export declare function invalidRequest({ message, errors }: any): {
    status: any;
    name: any;
    code: any;
    message: any;
    errors: any;
};
export declare function formatValidationErrs(errs: any): any;
export declare function getValidationErrs(req: Request): false | {
    status: any;
    name: any;
    code: any;
    message: any;
    errors: any;
};
