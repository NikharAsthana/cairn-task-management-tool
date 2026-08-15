import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

// @Catch() with no argument means "catch literally everything" — any
// thrown value, not just HttpExceptions. Without an argument, Nest routes
// every unhandled exception in the whole app through this one class.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // A private logger scoped to this filter's name — shows up in server
  // logs as "[AllExceptionsFilter]", making it easy to grep for.
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // HttpStatus.INTERNAL_SERVER_ERROR is a numeric enum member, which
  // typescript-eslint tracks as a distinct type from plain `number` even
  // though the underlying value is just 500. Declaring it here with an
  // explicit `: number` annotation genuinely widens its tracked type —
  // unlike an inline `as number` cast, which the linter considers a
  // no-op since a numeric enum member is already structurally a number.
  // This is what lets the >= comparison below satisfy both
  // no-unsafe-enum-comparison and no-unnecessary-type-assertion at once.
  private static readonly INTERNAL_SERVER_ERROR_THRESHOLD: number =
    HttpStatus.INTERNAL_SERVER_ERROR;

  catch(exception: unknown, host: ArgumentsHost): void {
    // ArgumentsHost is a generic wrapper Nest uses so the same filter
    // could theoretically work across HTTP, WebSockets, or microservices.
    // switchToHttp() narrows it down to the HTTP-specific request/response
    // objects we actually want here.
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolveStatusAndMessage(exception);

    // Log every 500-level error server-side with its real stack trace —
    // we still want to see the truth in our own logs, we just don't want
    // to SEND that truth to the client.
    if (status >= AllExceptionsFilter.INTERNAL_SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveStatusAndMessage(exception: unknown): {
    status: number;
    message: string | string[];
  } {
    // Case 1: something we (or ValidationPipe, or NotFoundException, etc.)
    // deliberately threw as an HttpException already knows its own
    // correct status and message — just reuse it as-is.
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ??
            exception.message);
      return { status: exception.getStatus(), message };
    }

    // Case 2: a known Prisma error — the P2002 code specifically means
    // "unique constraint violation." Map it to 409 Conflict, which is the
    // correct HTTP status for "this request is valid, but conflicts with
    // existing data" — very different in meaning from a 400 (malformed
    // request) or a 500 (our fault, not the client's).
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'A record with this value already exists',
      };
    }

    // Case 3: genuinely unknown — a real bug, an unexpected error type.
    // Deliberately vague to the client on purpose: we don't want to leak
    // internal details (stack traces, library names, file paths) to
    // whoever's calling the API. The real detail went to the server log
    // above, which is the only place it should be visible.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
