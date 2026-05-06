export interface Article {
  id: string;
  title: string;
  categoryId: string;
  author: string;
  status: "published" | "draft" | "review" | "archived";
  views: number;
  rating: number;
  content: string;
  tags: string[];
  relatedArticleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  description: string;
}

export interface Review {
  id: string;
  articleId: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

export interface SearchQuery {
  query: string;
  count: number;
  hasResults: boolean;
}

export interface KbSettings {
  name: string;
  description: string;
  allowPublicAccess: boolean;
  allowRatings: boolean;
  allowComments: boolean;
  requireApproval: boolean;
  defaultCategory: string;
  articleTemplate: string;
}

export interface ArticleForm {
  title: string;
  categoryId: string;
  author: string;
  status: "published" | "draft" | "review" | "archived";
  content: string;
  tags: string;
  relatedArticleIds: string[];
}

export interface CategoryForm {
  name: string;
  parentId: string;
  icon: string;
  description: string;
}
