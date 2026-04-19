import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This article is very helpful!',
    description: 'Comment content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
    description: 'ID of the article this comment belongs to',
  })
  @IsNotEmpty()
  @IsUUID('4')
  articleId: string;

  @ApiPropertyOptional({
    example: 'b3bb189e-8bf9-3888-9912-ace4e6543003',
    description: 'ID of the author (optional)',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  authorId: string | null;
}
