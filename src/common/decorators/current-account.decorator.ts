import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCurrentAccount = (context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user; // Trả về thông tin người dùng từ request
};

export const CurrentAccount = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getCurrentAccount(context),
);
