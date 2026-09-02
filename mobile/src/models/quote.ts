export interface Quote {
  id: number;
  body: string;
  author: string;
  tags: string[];
}

export interface Favorite extends Quote {
  savedAt: string;
}
