"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const check_1 = require("express-validator/check");
exports.errObjs = {
    badRequest: {
        status: 400,
        code: "bad_request",
        message: "Bad Request",
    },
    unauthorized: {
        status: 401,
        code: "unauthorized",
        message: "Unauthorized",
    },
    forbidden: {
        status: 403,
        code: "forbidden",
        message: "Forbidden",
    },
    notFound: {
        status: 404,
        code: "not_found",
        message: "Not Found",
    },
    methodNotAllowed: {
        status: 405,
        code: "method_not_allowed",
        message: "Method Not Allowed",
    },
    conflict: {
        status: 409,
        code: "conflict",
        message: "Conflict",
    },
    internalServer: {
        status: 500,
        code: "internal_server_error",
        message: "Internal Server Error",
    },
    notImplemented: {
        status: 501,
        code: "not_implemented",
        message: "Not Implemented",
    },
};
const tweaks = {
    CastError: exports.errObjs.badRequest,
    AuthenticationError: exports.errObjs.unauthorized,
    MongoError: exports.errObjs.internalServer,
};
const defaultError = exports.errObjs.internalServer;
// Remove the next param to watch the whole thing go KABOOM!
function handler(err, req, res, next) {
    const realErr = JSON.parse(JSON.stringify(err));
    for (const key in tweaks) {
        if (err.name === key) {
            err.status = tweaks[key].status;
            err.code = tweaks[key].code;
            err.message = tweaks[key].message;
        }
    }
    const errorStatus = err.status || defaultError.status;
    return res.status(errorStatus).json({
        status: errorStatus,
        code: err.code || "unknown_error",
        message: err.message || defaultError.message,
        errors: err.errors,
        pureErr: process.env.NODE_ENV === "development" ? realErr : undefined,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
}
exports.handler = handler;
function joinErrors({ status, code, message, errors }) {
    let errMsg = defaultError.message;
    let errCode = defaultError.code;
    let statusMatched = false;
    for (let key in exports.errObjs) {
        let errObj = exports.errObjs[key];
        if (errObj.status === status) {
            errCode = errObj.code;
            errMsg = errObj.message;
            statusMatched = true;
            break;
        }
    }
    if (!statusMatched)
        status = defaultError.status;
    return {
        status,
        code: code || errCode,
        message: message || errMsg,
        errors,
    };
}
exports.joinErrors = joinErrors;
function invalidRequest({ message, errors }) {
    return joinErrors({
        status: exports.errObjs.badRequest.status,
        code: "invalid_request",
        message: message || "Invalid Request",
        errors: errors,
    });
}
exports.invalidRequest = invalidRequest;
function formatValidationErrs(errs) {
    for (let i = 0; i < errs.length; i++) {
        errs[i] = {
            param: errs[i].param,
            value: errs[i].value,
            details: errs[i].msg,
        };
    }
    return errs;
}
exports.formatValidationErrs = formatValidationErrs;
const validationErrsFormatter = ({ location, msg, param, value, nestedErrors, }) => {
    return {
        param,
        value,
        details: msg,
        nested: nestedErrors,
    };
};
function getValidationErrs(req) {
    const validationErrors = check_1.validationResult(req).formatWith(validationErrsFormatter);
    if (!validationErrors.isEmpty()) {
        return invalidRequest({
            message: "Validation Failed",
            errors: validationErrors.array(),
        });
    }
    else {
        return false;
    }
}
exports.getValidationErrs = getValidationErrs;
//# sourceMappingURL=index.js.map