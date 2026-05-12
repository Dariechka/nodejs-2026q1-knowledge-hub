import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

interface RagChatRequest {
  question: string;
  conversationId?: string;
}

export class RagChatRequestDto implements RagChatRequest {
  @ApiProperty({
    description:
      'The user question to be answered using the Knowledge Hub context',
    example: 'Give me an example of organic synthesis and its conditions.',
  })
  @IsString()
  @IsNotEmpty({ message: 'question is required and cannot be empty' })
  question: string;

  @ApiPropertyOptional({
    description: 'An optional ID to track the conversation thread',
    example: 'a8b9c0d1-e2f3-4g5h-6i7j-8k9l0m1n2o3p',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
