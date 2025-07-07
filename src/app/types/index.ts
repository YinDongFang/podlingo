export interface ResourceStatus {
  status: string;
  error?: string;
  data?: Resource;
  loaded?: number;
  total?: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  logo: string;
  transcript: Sentence[];
}

export interface Sentence {
  en: string;
  zh: string;
  keyword: {
    word: string;
    explanation: string;
    en: string;
    zh: string;
  }[];
  startTime: number;
  endTime: number;
}
