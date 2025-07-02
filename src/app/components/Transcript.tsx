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

const TranscriptSentence = forwardRef<
  HTMLDivElement,
  { sentence: Sentence; isCurrent: boolean }
>((props, ref) => {
  const { sentence, isCurrent } = props;
  const [height, setHeight] = useState(0);

  const elementRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    setHeight(element.clientHeight);
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ height: height ? (isCurrent ? height * 1.5 : height) : "auto" }}
      className={classnames(
        "relative transition-all duration-300 w-[50%] mx-auto",
        isCurrent ? "opacity-100" : "opacity-40"
      )}
    >
      <div
        className={classnames(
          "flex flex-col justify-center gap-y-1 transition-all duration-300",
          isCurrent && "absolute inset-0 scale-150"
        )}
      >
        <p>{sentence.en}</p>
        <p>{sentence.zh}</p>
      </div>
    </div>
  );
});

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
        className="overflow-hidden space-y-5 text-center text-white text-sm"
      >
        {sentences.map((sentence, index) => {
          const isCurrent = index === currentSentenceIndex;

          return (
            <TranscriptSentence
              key={index}
              ref={isCurrent ? currentSentenceRef : null}
              sentence={sentence}
              isCurrent={isCurrent}
            />
          );
        })}
      </div>
    </div>
  );
}
