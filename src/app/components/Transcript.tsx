"use client";

import { useRef, useEffect } from "react";
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

  // 自动滚动到当前句子，使其中线和容器中线对齐
  useEffect(() => {
    if (currentSentenceRef.current && containerRef.current) {
      const container = containerRef.current;
      const current = currentSentenceRef.current;
      // 当前句子中线相对容器顶部的距离
      const sentenceMiddle = current.offsetTop + current.offsetHeight / 2;
      // 让scrollTop调整到让当前句子中线和容器中线重合
      container.style.transform = `translateY(-${sentenceMiddle}px)`;
    }
  }, [currentSentenceIndex]);

  return (
    <div
      className={classnames("px-32 overflow-hidden", className)}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 5%, white 20%, white 80%, transparent 95%)",
      }}
    >
      <div
        ref={containerRef}
        className="space-y-5 text-center text-white w-[80%] mx-auto relative top-[50%] transition-all duration-300"
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
