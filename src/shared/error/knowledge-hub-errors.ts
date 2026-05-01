import { StatusCodes } from 'http-status-codes';

export class KnowledgeHubError extends Error {
  protected constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends KnowledgeHubError {
  constructor(message: string = 'Resource not found') {
    super(StatusCodes.NOT_FOUND, message);
  }
}

export class ValidationError extends KnowledgeHubError {
  constructor(message: string = 'Validation failed') {
    super(StatusCodes.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends KnowledgeHubError {
  constructor(message: string = 'Unauthorized access') {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends KnowledgeHubError {
  constructor(message: string = 'Access denied') {
    super(StatusCodes.FORBIDDEN, message);
  }
}

export class UnprocessableError extends KnowledgeHubError {
  constructor(message: string = 'One or more fields contain invalid values') {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message);
  }
}

export class TooManyRequestError extends KnowledgeHubError {
  constructor(message: string = 'AI service is currently overloaded.') {
    super(StatusCodes.TOO_MANY_REQUESTS, message);
  }
}

export class ServerUnavailableError extends KnowledgeHubError {
  constructor(
    message: string = 'The server was unable to complete your request. Please try again later',
  ) {
    super(StatusCodes.SERVICE_UNAVAILABLE, message);
  }
}
