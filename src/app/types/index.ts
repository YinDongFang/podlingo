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
  audioUrl: string;
  logoUrl: string;
  translatedTranscript: Sentence[];
}

export interface Sentence {
  text: string;
  translatedText?: string;
  startTime: number;
  endTime: number;
}