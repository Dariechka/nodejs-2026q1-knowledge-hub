import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUUID('4')
  articleId: string;

  @IsOptional()
  @IsUUID('4')
  authorId: string | null;
}
