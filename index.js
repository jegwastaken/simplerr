const e = exports.e = {
    badRequest: {
        status: 400,
        code: 'bad_request',
        message: 'Bad Request',
    },
    unauthorized: {
        status: 401,
        code: 'unauthorized',
        message: 'Unauthorized',
    },
    forbidden: {
        status: 403,
        code: 'forbidden',
        message: 'Forbidden',
    },
    notFound: {
        status: 404,
        code: 'not_found',
        message: 'Not Found',
    },
    methodNotAllowed: {
        status: 405,
        code: 'method_not_allowed',
        message: 'Method Not Allowed',
    },
    conflict: {
        status: 409,
        code: 'conflict',
        message: 'Conflict',
    },
    internalServer: {
        status: 500,
        code: 'internal_server_error',
        message: 'Internal Server Error',
    },
    notImplemented: {
        status: 501,
        code: 'not_implemented',
        message: 'Not Implemented',
    },
}

const tweaks = exports.tweaks = {
    CastError: e.badRequest,
    AuthenticationError: e.unauthorized,
    MongoError: e.internalServer,
};

const defaultError = e.internalServer;

exports.handler = (err, req, res, next) => {
    const realErr = JSON.parse(JSON.stringify(err));

    Object.keys(tweaks).map((key) => {
        let tweak = tweaks[key];

        if(err.name === key) {
            err.status = tweak.status;
            err.code = tweak.code;
            err.message = tweak.message;
        }
    });

    const errorStatus = err.status || defaultError.status;
    const errorCode = err.code || 'unknown_error';
    const errorMessage = err.message || defaultError.message;
    const errorList = err.errors;

    res.status(errorStatus).json({
        status: errorStatus,
        code: errorCode,
        message: errorMessage,
        errors: errorList,
        stack: (process.env.NODE_ENV === 'development') ? realErr : {},
    });
};

exports.returnErrs = (status, code, message, errors) => {
    let errMsg = defaultError.message;
    let errCode = defaultError.code;
    let statusMatched = false;

    for(const props in e) {
        if(e[props].status === status) {
            errCode = e[props].code;
            errMsg = e[props].message;
            statusMatched = true;

            break;
        }
    }

    if(!statusMatched) status = defaultError.status;

    const output = {
        status: status,
        code: code || errCode,
        message: message || errMsg,
    };

    if(errors) output.errors = errors;

    return output;
};

exports.formatErrs = errs => {
    const obj = {};

    errs.forEach((err) => {
        obj[err.param] = {
            message: err.msg,
            value: err.value || ''
        };
    });

    return obj;
};