export interface IManga {
  id: string;
  title: string;
  description?: string;
  originalLanguage?: string;
  status?: string;
  year?: number;
  tags?: string[];
  coverFileName?: string; 
}

export interface IChapter {
  id: string;
  volume: string;
  chapter: string;
  title: string;
  translatedLanguage: string;
  publishAt: string;
  pages?: string[];
}

export interface ISearchParams {
  title?: string;
  limit?: number;
  hasAvailableChapters?: boolean;
  offset?: number;
}