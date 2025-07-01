'use client';

import { useRef, useEffect } from 'react';
import { Sentence } from '../types';
import { formatTime } from '../utils/helpers';

interface TranscriptProps {
  sentences: Sentence[];
  currentTime: number;
  onSentenceClick: (time: number) => void;
}

export default function Transcript({ sentences, currentTime, onSentenceClick }: TranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSentenceRef = useRef<HTMLDivElement>(null);

  // 找到当前播放的句子
  const currentSentenceIndex = sentences.findIndex(
    sentence => currentTime >= sentence.startTime && currentTime <= sentence.endTime
  );

  // 自动滚动到当前句子
  useEffect(() => {
    if (currentSentenceRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentSentenceRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const elementRect = currentElement.getBoundingClientRect();
      
      const isVisible = 
        elementRect.top >= containerRect.top &&
        elementRect.bottom <= containerRect.bottom;
      
      if (!isVisible) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentSentenceIndex]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">字幕</h2>
      <div 
        ref={containerRef}
        className="max-h-96 overflow-y-auto space-y-3"
      >
        {sentences.map((sentence, index) => {
          const isCurrent = index === currentSentenceIndex;
          const isPast = currentTime > sentence.endTime;
          
          return (
            <div
              key={index}
              ref={isCurrent ? currentSentenceRef : null}
              onClick={() => onSentenceClick(sentence.startTime)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isCurrent 
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : isPast 
                    ? 'bg-gray-50' 
                    : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500 font-mono">
                  {formatTime(sentence.startTime)} - {formatTime(sentence.endTime)}
                </span>
                {isCurrent && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className={`text-sm leading-relaxed ${
                  isCurrent ? 'text-gray-900 font-medium' : 'text-gray-700'
                }`}>
                  {sentence.text}
                </p>
                {sentence.translatedText && (
                  <p className={`text-sm leading-relaxed ${
                    isCurrent ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {sentence.translatedText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 