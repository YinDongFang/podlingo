"use client";

import { useRef, useState, useEffect } from "react";
import { formatTime } from "../utils/helpers";

interface AudioPlayerProps {
  onTimeUpdate: (currentTime: number) => void;
  currentTime: number;
  resource: {
    logo: string;
    title: string;
    artist: string;
    url: string;
  };
}

export default function AudioPlayer({
  onTimeUpdate,
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

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    onTimeUpdate(newTime);
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[370px] h-[120px] rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-400/90 to-yellow-700/80 backdrop-blur-lg flex flex-col justify-between p-4"
      style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
    >
      <audio ref={audioRef} src={resource.url} preload="metadata" />
      <div className="flex items-center justify-between w-full">
        {/* 封面和信息 */}
        <div className="flex items-center">
          <img
            src={resource.logo}
            alt="cover"
            className="w-14 h-14 rounded-lg shadow-md object-cover mr-3 border border-white/40"
          />
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg leading-tight drop-shadow-sm">
              {resource.title}
            </span>
            <span className="text-white/80 text-sm drop-shadow-sm">
              {resource.artist}
            </span>
          </div>
        </div>
        {/* 投屏图标 */}
        <div className="text-white/80 cursor-pointer">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <path d="M17 2v2" />
            <path d="M7 2v2" />
            <path d="M2 12h20" />
          </svg>
        </div>
      </div>
      {/* 控制按钮 */}
      <div className="flex items-center justify-center mt-2 mb-1 space-x-8">
        <button className="focus:outline-none" aria-label="上一首">
          <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
            <path d="M6 17V7M18 17L10.5 12L18 7V17Z" />
          </svg>
        </button>
        <button
          onClick={togglePlay}
          className="bg-white/90 hover:bg-white text-yellow-700 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none"
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? (
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="2" />
              <rect x="14" y="4" width="4" height="16" rx="2" />
            </svg>
          ) : (
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3v18l15-9L5 3z" />
            </svg>
          )}
        </button>
        <button className="focus:outline-none" aria-label="下一首">
          <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
            <path d="M18 7V17M6 7L13.5 12L6 17V7Z" />
          </svg>
        </button>
      </div>
      {/* 进度条 */}
      <div className="flex items-center w-full mt-1">
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
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            style={{ zIndex: 2, position: "relative" }}
          />
          <div
            className="absolute top-1/2 left-0 h-1 bg-white/80 rounded-lg pointer-events-none"
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              transform: "translateY(-50%)",
              zIndex: 1,
            }}
          ></div>
        </div>
        <span className="text-xs text-white/80 w-10 text-right">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
