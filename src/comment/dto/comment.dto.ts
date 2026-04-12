import { Transform } from 'class-transformer';

export class CommentDto {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;

  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  constructor(partial: Partial<CommentDto>) {
    Object.assign(this, partial);
  }
}
