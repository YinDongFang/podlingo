"use client";

import { useRef, useState, useEffect } from "react";
import { Resource } from "../types";
import classnames from "classnames";
import { useMemoFn } from "../hooks/useMemoFn";

interface AudioPlayerProps {
  onPrevious: () => void;
  onNext: () => void;
  onToStart: () => void;
  onToEnd: () => void;
  onTimeUpdate: (currentTime: number) => void;
  onDurationUpdate: (duration: number) => void;
  currentTime: number;
  resource: Resource;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function AudioPlayer({
  onPrevious,
  onNext,
  onToStart,
  onToEnd,
  onTimeUpdate,
  onDurationUpdate,
  currentTime,
  resource,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      onDurationUpdate(audio.duration);
    };

    const handleTimeUpdate = () => {
      onTimeUpdate(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        onToStart();
      } else if (e.code === "ArrowRight") {
        onToEnd();
      } else if (e.code === "ArrowUp") {
        onPrevious();
      } else if (e.code === "ArrowDown") {
        onNext();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    document.addEventListener("keydown", callback);
    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [onPrevious, onNext, onToStart, onToEnd]);

  const togglePlay = useMemoFn(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  });

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    onTimeUpdate(newTime);
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw] h-[100px] rounded-full shadow-2xl bg-gradient-to-br gap-x-3 from-yellow-400/90 to-yellow-700/80 backdrop-blur-lg flex items-stretch p-3 pr-6"
      style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
    >
      <audio ref={audioRef} src={resource.url} preload="metadata" />
      <img
        src={resource.logo}
        alt="cover"
        className={classnames(
          "rounded-full shadow-md object-cover",
          isPlaying && "animate-spin-slow"
        )}
      />
      <div className="flex flex-col items-stretch flex-1 min-w-0">
        <div className="text-white font-semibold drop-shadow-sm overflow-ellipsis text-nowrap w-full overflow-hidden shrink-0">
          {resource.title}
        </div>
        {/* 进度条 */}
        <div className="flex items-center w-full">
          <span className="text-xs text-white/80 w-10 text-left">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 mx-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-yellow-400 outline-none"
              style={{ zIndex: 2, position: "relative", top: -3 }}
            />
            <div
              className="absolute top-1/2 left-0 h-1 bg-white/80 rounded-lg pointer-events-none"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            />
          </div>
          <span className="text-xs text-white/80 w-10 text-right">
            {formatTime(duration)}
          </span>
        </div>
        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-x-4">
          <button onClick={onPrevious} className="outline-none cursor-pointer" title="上一句 (↑)">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M19 20L9 12L19 4V20Z" />
              <path d="M5 19V5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
          <button onClick={onToStart} className="outline-none cursor-pointer" title="到句首 (←)">
            <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
              <path d="M19 20L9 12L19 4V20Z" />
            </svg>
          </button>
          <button
            onClick={togglePlay}
            className="bg-white text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center shadow-lg outline-none cursor-pointer"
            title="播放/暂停 (空格)"
          >
            {isPlaying ? (
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="4" width="4" height="16" rx="2" />
                <rect x="14" y="4" width="4" height="16" rx="2" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 3v18l15-9L5 3z" />
              </svg>
            )}
          </button>
          <button onClick={onToEnd} className="outline-none cursor-pointer" title="到句尾 (→)">
            <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
              <path d="M5 4L15 12L5 20V4Z" />
            </svg>
          </button>
          <button onClick={onNext} className="outline-none cursor-pointer" title="下一句 (↓)">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M5 4L15 12L5 20V4Z" />
              <path d="M19 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
