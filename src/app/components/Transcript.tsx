"use client";

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  forwardRef,
  RefObject,
} from "react";
import { Sentence } from "../types";
import classnames from "classnames";

interface TranscriptProps {
  sentences: Sentence[];
  currentTime: number;
  className?: string;
}

export default function Transcript(props: TranscriptProps) {
  const { sentences, currentTime, className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSentenceRef = useRef<HTMLDivElement>(null);

  // 找到当前播放的句子
  const currentSentenceIndex = sentences.findIndex(
    (sentence) =>
      currentTime >= sentence.startTime && currentTime <= sentence.endTime
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
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentSentenceIndex]);

  return (
    <div
      className={classnames("px-32", className)}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 5%, white 20%, white 80%, transparent 95%)",
      }}
    >
      <div
        ref={containerRef}
        className="space-y-5 text-center text-white w-[80%] mx-auto"
      >
        {sentences.map((sentence, index) => {
          const isCurrent = index === currentSentenceIndex;

          return (
            <div
              ref={isCurrent ? currentSentenceRef : undefined}
              className={classnames(
                "relative transition-all duration-300",
                isCurrent ? "opacity-100 scale-120" : "opacity-40 scale-100"
              )}
            >
              <div className="flex flex-col justify-center gap-y-1 transition-all duration-300">
                <p>{sentence.en}</p>
                <p>{sentence.zh}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
