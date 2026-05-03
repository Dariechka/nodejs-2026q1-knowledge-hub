import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GeneratePromptDto {
  @ApiProperty({
    description: 'The input text or question for the AI to process',
    example: 'Summarize the impact of renewable energy in 2026.',
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  prompt: string;
}
