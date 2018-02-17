var e = exports.e = {
    badRequest: {
        status: 400,
        code: 'bad_request',
        message: 'Bad Request'
    },
    unauthorized: {
        status: 401,
        code: 'unauthorized',
        message: 'Unauthorized'
    },
    forbidden: {
        status: 403,
        code: 'forbidden',
        message: 'Forbidden'
    },
    notFound: {
        status: 404,
        code: 'not_found',
        message: 'Not Found'
    },
    methodNotAllowed: {
        status: 405,
        code: 'method_not_allowed',
        message: 'Method Not Allowed'
    },
    conflict: {
        status: 409,
        code: 'conflict',
        message: 'Conflict'
    },
    internalServer: {
        status: 500,
        code: 'internal_server_error',
        message: 'Internal Server Error'
    },
    notImplemented: {
        status: 501,
        code: 'not_implemented',
        message: 'Not Implemented'
    }
};

var tweaks = exports.tweaks = {
    CastError: e.badRequest,
    AuthenticationError: e.unauthorized,
    MongoError: e.internalServer
};

var defaultError = e.internalServer;

exports.handler = function(err, req, res, next) {
    var realErr = JSON.parse(JSON.stringify(err));

    Object.keys(tweaks).map(function(key) {
        var tweak = tweaks[key];

        if(err.name === key) {
            err.status = tweak.status;
            err.code = tweak.code;
            err.message = tweak.message;
        }
    });

    res.status(errorStatus).json({
        status: err.status || defaultError.status,
        code: err.code || 'unknown_error',
        message: err.message || defaultError.message,
        errors: err.errors,
        stack: process.env.NODE_ENV === 'development' ? realErr : {}
    });
};

exports.returnErrs = function(status, code, message, errors) {
    var errMsg = defaultError.message;
    var errCode = defaultError.code;
    var statusMatched = false;

    for(var props in e) {
        if(e[props].status === status) {
            errCode = e[props].code;
            errMsg = e[props].message;
            statusMatched = true;

            break;
        }
    }

    if(!statusMatched) status = defaultError.status;

    var output = {
        status: status,
        code: code || errCode,
        message: message || errMsg
    };

    if(errors) output.errors = errors;

    return output;
};

exports.formatErrs = function(errs) {
    var obj = {};

    errs.forEach(function(err) {
        obj[err.param] = {
            message: err.msg,
            value: err.value || ''
        };
    });

    return obj;
};