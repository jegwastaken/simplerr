import { validationResult } from "express-validator/check";
import { Request, Response, NextFunction } from "express";

export interface ErrObj {
    readonly status: number;
    readonly code: string;
    readonly message: string;
}

export const errObjs = {
    badRequest: <ErrObj>{
        status: 400,
        code: "bad_request",
        message: "Bad Request",
    },
    unauthorized: <ErrObj>{
        status: 401,
        code: "unauthorized",
        message: "Unauthorized",
    },
    forbidden: <ErrObj>{
        status: 403,
        code: "forbidden",
        message: "Forbidden",
    },
    notFound: <ErrObj>{
        status: 404,
        code: "not_found",
        message: "Not Found",
    },
    methodNotAllowed: <ErrObj>{
        status: 405,
        code: "method_not_allowed",
        message: "Method Not Allowed",
    },
    conflict: <ErrObj>{
        status: 409,
        code: "conflict",
        message: "Conflict",
    },
    internalServer: <ErrObj>{
        status: 500,
        code: "internal_server_error",
        message: "Internal Server Error",
    },
    notImplemented: <ErrObj>{
        status: 501,
        code: "not_implemented",
        message: "Not Implemented",
    },
};

const tweaks: any = {
    CastError: errObjs.badRequest,
    AuthenticationError: errObjs.unauthorized,
    MongoError: errObjs.internalServer,
};

const defaultError = errObjs.internalServer;

// Remove the next param to watch the whole thing go KABOOM!
export function handler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const realErr = JSON.parse(JSON.stringify(err));

    for (const key in tweaks) {
        if (err.name === key) {
            err.status = tweaks[key].status;
            err.code = tweaks[key].code;
            err.message = tweaks[key].message;
        }
    }

    const errorStatus: number = err.status || defaultError.status;

    return res.status(errorStatus).json({
        status: errorStatus,
        code: err.code || "unknown_error",
        message: err.message || defaultError.message,
        errors: err.errors,
        pureErr: process.env.NODE_ENV === "development" ? realErr : undefined,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
}

export function joinErrors({ status, code, message, errors }: any) {
    let errMsg = defaultError.message;
    let errCode = defaultError.code;
    let statusMatched = false;

    for (let key in errObjs) {
        let errObj: ErrObj = (<any>errObjs)[key];

        if (errObj.status === status) {
            errCode = errObj.code;
            errMsg = errObj.message;
            statusMatched = true;

            break;
        }
    }

    if (!statusMatched) status = defaultError.status;

    return {
        status,
        code: code || errCode,
        message: message || errMsg,
        errors,
    };
}

export function invalidRequest({ message, errors }: any) {
    return joinErrors({
        status: errObjs.badRequest.status,
        code: "invalid_request",
        message: message || "Invalid Request",
        errors: errors,
    });
}

export function formatValidationErrs(errs: any) {
    for (let i = 0; i < errs.length; i++) {
        errs[i] = {
            param: errs[i].param,
            value: errs[i].value,
            details: errs[i].msg,
        };
    }

    return errs;
}

const validationErrsFormatter = ({
    location,
    msg,
    param,
    value,
    nestedErrors,
}: any) => {
    return {
        param,
        value,
        details: msg,
        nested: nestedErrors,
    };
};

export function getValidationErrs(req: Request) {
    const validationErrors = validationResult(req).formatWith(
        validationErrsFormatter
    );

    if (!validationErrors.isEmpty()) {
        return invalidRequest({
            message: "Validation Failed",
            errors: validationErrors.array(),
        });
    } else {
        return false;
    }
}
