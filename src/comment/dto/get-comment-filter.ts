import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCommentFilterDto {
  @ApiProperty({
    example: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
    description: 'Article ID used to filter comments',
  })
  @IsNotEmpty()
  @IsUUID('4')
  articleId: string;

  constructor(partial: Partial<GetCommentFilterDto>) {
    Object.assign(this, partial);
  }
}
