"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.errObjs = {
    badRequest: {
        status: 400,
        name: 'BadRequest',
        code: 'bad_request',
        message: 'Bad Request',
    },
    unauthorized: {
        status: 401,
        name: 'Unauthorized',
        code: 'unauthorized',
        message: 'Unauthorized',
    },
    forbidden: {
        status: 403,
        name: 'Forbidden',
        code: 'forbidden',
        message: 'Forbidden',
    },
    notFound: {
        status: 404,
        name: 'NotFound',
        code: 'not_found',
        message: 'Not Found',
    },
    methodNotAllowed: {
        status: 405,
        name: 'MethodNotAllowed',
        code: 'method_not_allowed',
        message: 'Method Not Allowed',
    },
    conflict: {
        status: 409,
        name: 'Conflict',
        code: 'conflict',
        message: 'Conflict',
    },
    internalServer: {
        status: 500,
        name: 'InternalServerError',
        code: 'internal_server_error',
        message: 'Internal Server Error',
    },
    notImplemented: {
        status: 501,
        name: 'NotImplemented',
        code: 'not_implemented',
        message: 'Not Implemented',
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
    const newErr = JSON.parse(JSON.stringify(err));
    for (const key in tweaks) {
        if (newErr.name === key) {
            newErr.status = tweaks[key].status;
            newErr.name = tweaks[key].name;
            newErr.code = tweaks[key].code;
            newErr.message = tweaks[key].message;
        }
    }
    const errorStatus = newErr.status || defaultError.status;
    return res.status(errorStatus).json({
        status: errorStatus,
        name: newErr.name,
        code: newErr.code || 'unknown_error',
        message: newErr.message || defaultError.message,
        errors: newErr.errors,
        pure: process.env.NODE_ENV === 'development' ? err : undefined,
        stack: process.env.NODE_ENV === 'development' ? newErr.stack : undefined,
    });
}
exports.handler = handler;
function joinErrors({ status, name, code, message, errors }) {
    let errCode = defaultError.code;
    let errMessage = defaultError.message;
    let statusMatched = false;
    for (let key in exports.errObjs) {
        let errObj = exports.errObjs[key];
        if (errObj.status === status) {
            errCode = errObj.code;
            errMessage = errObj.message;
            statusMatched = true;
            break;
        }
    }
    if (!statusMatched)
        status = defaultError.status;
    return {
        status,
        name,
        code: code || errCode,
        message: message || errMessage,
        errors,
    };
}
exports.joinErrors = joinErrors;
function invalidRequest({ message, errors }) {
    return joinErrors({
        status: exports.errObjs.badRequest.status,
        name: 'InvalidRequest',
        code: 'invalid_request',
        message: message || 'Invalid Request',
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
const validationErrsFormatter = ({ msg, param, value, }) => {
    return {
        param,
        value,
        details: msg,
    };
};
function getValidationErrs(req) {
    const validationErrors = express_validator_1.validationResult(req).formatWith(validationErrsFormatter);
    if (!validationErrors.isEmpty()) {
        return invalidRequest({
            message: 'Validation Failed',
            errors: validationErrors.array(),
        });
    }
    else {
        return false;
    }
}
exports.getValidationErrs = getValidationErrs;
