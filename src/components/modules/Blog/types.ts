export interface BlogPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  status: "draft" | "scheduled" | "published" | "archived";
  views: number;
  commentCount: number;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  createdAt: string;
  readingTime: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  color: string;
}

export interface BlogComment {
  id: string;
  authorName: string;
  postId: string;
  postTitle: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  parentId: string | null;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface PostForm {
  title: string;
  categoryId: string;
  authorId: string;
  content: string;
  status: BlogPost["status"];
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
}
