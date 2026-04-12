import { Transform } from 'class-transformer';

export class ArticleDto {
  id: string;
  title: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
  authorId: string | null;
  categoryId: string | null;
  tags?: string[];

  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  @Transform(({ value }) => value.getTime())
  updatedAt: Date;

  constructor(partial: Partial<ArticleDto>) {
    Object.assign(this, partial);
  }
}
