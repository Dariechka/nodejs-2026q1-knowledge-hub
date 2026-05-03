import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiValidationService {
  private logger = new Logger(AiValidationService.name);
  public validateOutputData<T>(
    aiResponseSchema: ClassConstructor<T>,
    rawData: any,
    fallback: T,
  ) {
    const instance = plainToInstance(aiResponseSchema, rawData, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    const errors = validateSync(instance as object);

    if (errors.length > 0) {
      this.logger.log(
        `AI Validation failed for ${aiResponseSchema.name}:`,
        JSON.stringify(errors),
      );
      return fallback;
    }

    return instance;
  }
}
