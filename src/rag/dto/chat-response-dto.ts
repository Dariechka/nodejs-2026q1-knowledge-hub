import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

interface RagChatResponse {
  answer: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    relevantChunk: string;
  }>;
  conversationId: string;
}

export class RagChatSourceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4')
  articleId: string;

  @ApiProperty({ example: 'Setup Guide' })
  articleTitle: string;

  @ApiProperty({
    example: 'The primary way to configure the environment is...',
    description: 'The specific snippet of text used by the AI',
  })
  relevantChunk: string;
}

export class RagChatResponseDto implements RagChatResponse {
  @ApiProperty({
    description: 'The AI-generated answer',
    example: 'You can configure your environment by...',
  })
  answer: string;

  @ApiProperty({
    type: [RagChatSourceDto],
    description: 'The articles and chunks used to generate the answer',
  })
  sources: RagChatSourceDto[];

  @ApiProperty({
    description: 'Identifier for the current chat session',
    example: 'chat-uuid-123',
  })
  conversationId: string;
}
