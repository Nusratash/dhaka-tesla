import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Pulls the authenticated user (attached by JwtStrategy.validate) off the
// request, so controllers can do `@CurrentUser() user: AuthUser` instead of
// reaching into `req.user` by hand everywhere.
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
