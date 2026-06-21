import { BadRequestException } from '@nestjs/common';

export class BusinessRuleException extends BadRequestException {
  constructor(
    public readonly ruleCode: string,
    message: string,
  ) {
    super({ ruleCode, message });
  }
}
