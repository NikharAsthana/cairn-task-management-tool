import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// createParamDecorator lets us define our own @Something() decorator.
// ExecutionContext is Nest's wrapper around the current request —
// switchToHttp().getRequest() pulls the raw Express Request back out of it,
// the same object every guard and controller has been touching all along.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: { userId: string } }>();
    return request.user.userId;
  },
);
