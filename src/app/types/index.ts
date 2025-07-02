export interface ResourceStatus {
  status: string;
  error?: string;
  data?: Resource;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  duration: number;
  url: string;
  logo: string;
  transcript: Sentence[];
}

export interface Sentence {
  en: string;
  zh?: string;
  startTime: number;
  endTime: number;
}