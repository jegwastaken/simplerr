import { Request, Response, NextFunction } from 'express';
export interface ErrObj {
    readonly status: number;
    readonly name: string;
    readonly code: string;
    readonly message: string;
}
export declare const errObjs: {
    [property: string]: ErrObj;
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
