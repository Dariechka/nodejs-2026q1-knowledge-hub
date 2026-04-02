import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetCommentFilterDto {
  @IsNotEmpty()
  @IsUUID('4')
  articleId?: string;
}
