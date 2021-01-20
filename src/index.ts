import {
  validationResult,
  ValidationError,
  ErrorFormatter,
} from "express-validator";

import { Request, Response, NextFunction } from "express";

export type ErrObj = {
  readonly status: number;
  readonly name: string;
  readonly code: string;
  readonly message: string;
};

export type ErrObjs = { [property: string]: ErrObj };

export const errObjs = {
  badRequest: {
    status: 400,
    name: "BadRequest",
    code: "bad_request",
    message: "Bad Request",
  },
  unauthorized: {
    status: 401,
    name: "Unauthorized",
    code: "unauthorized",
    message: "Unauthorized",
  },
  forbidden: {
    status: 403,
    name: "Forbidden",
    code: "forbidden",
    message: "Forbidden",
  },
  notFound: {
    status: 404,
    name: "NotFound",
    code: "not_found",
    message: "Not Found",
  },
  methodNotAllowed: {
    status: 405,
    name: "MethodNotAllowed",
    code: "method_not_allowed",
    message: "Method Not Allowed",
  },
  conflict: {
    status: 409,
    name: "Conflict",
    code: "conflict",
    message: "Conflict",
  },
  /**
   * Deprecated. Use `internalServerError` instead.
   *
   */
  internalServer: {
    status: 500,
    name: "InternalServerError",
    code: "internal_server_error",
    message: "Internal Server Error",
  },
  internalServerError: {
    status: 500,
    name: "InternalServerError",
    code: "internal_server_error",
    message: "Internal Server Error",
  },
  notImplemented: {
    status: 501,
    name: "NotImplemented",
    code: "not_implemented",
    message: "Not Implemented",
  },
};

const tweaks: ErrObjs = {
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
  const newErr = JSON.parse(JSON.stringify(err));

  for (const key in tweaks) {
    if (newErr.name === key) {
      newErr.status = tweaks[key].status;
      newErr.name = tweaks[key].name;
      newErr.code = tweaks[key].code;
      newErr.message = tweaks[key].message;
    }
  }

  const errorStatus: number = newErr.status || defaultError.status;

  return res.status(errorStatus).json({
    status: errorStatus,
    name: newErr.name,
    code: newErr.code || "unknown_error",
    message: newErr.message || defaultError.message,
    errors: newErr.errors,
    pure: process.env.NODE_ENV === "development" ? err : undefined,
    stack: process.env.NODE_ENV === "development" ? newErr.stack : undefined,
  });
}

export function joinErrors({ status, name, code, message, errors }: any) {
  let errCode = defaultError.code;
  let errMessage = defaultError.message;
  let statusMatched = false;

  for (let key in errObjs) {
    let errObj: ErrObj = (errObjs as ErrObjs)[key];

    if (errObj.status === status) {
      errCode = errObj.code;
      errMessage = errObj.message;
      statusMatched = true;

      break;
    }
  }

  if (!statusMatched) status = defaultError.status;

  return {
    status,
    name,
    code: code || errCode,
    message: message || errMessage,
    errors,
  };
}

export function invalidRequest({ message, errors }: any) {
  return joinErrors({
    status: errObjs.badRequest.status,
    name: "InvalidRequest",
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
      message: errs[i].msg,
    };
  }

  return errs;
}

const validationErrsFormatter: ErrorFormatter = ({
  msg,
  param,
  value,
}: ValidationError) => {
  return {
    param,
    value,
    message: msg,
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
