import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MessageType } from '@prisma/client';

class ChatMessageDto {
  @ApiProperty({ example: 'msg_789654' })
  @IsString()
  id: string;

  @ApiProperty({ enum: MessageType, example: MessageType.question })
  @IsEnum(MessageType)
  messageType: MessageType;

  @ApiProperty({ example: 'How do I update my billing info?' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 1715291200000,
    description: 'Unix timestamp in milliseconds',
  })
  @IsNumber()
  createdAt: number;
}

export class RagChatHistoryResponseDto {
  @ApiProperty({ example: 'conv_123456' })
  @IsString()
  conversationId: string;

  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
