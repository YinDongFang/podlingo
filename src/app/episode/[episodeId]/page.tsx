"use client";

import { useState, useEffect } from "react";
import { useResource } from "@/app/hooks/useResource";
import AudioPlayer from "@/app/components/AudioPlayer";
import ErrorState from "@/app/components/ErrorState";
import LoadingState from "@/app/components/LoadingState";
import Transcript from "@/app/components/Transcript";

export default function Entry({ params }: any) {
  const [episodeId, setEpisodeId] = useState<string>("");

  useEffect(() => {
    params.then(({ episodeId }: any) => setEpisodeId(episodeId));
  }, [params]);

  if (!episodeId) return null;

  return <EpisodePage episodeId={episodeId} />;
}

function EpisodePage({ episodeId }: { episodeId: string }) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const { status, error, loading, refetch } = useResource(episodeId);

  // 如果状态检查出错
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // 如果资源状态检查中或资源正在获取中
  if (
    loading ||
    (status?.status !== "completed" && status?.status !== "failed")
  ) {
    return <LoadingState />;
  }

  const resource = status.data!;

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(Math.min(Math.max(time, 0), duration));
  };

  const handleToStart = () => {
    // 跳转到当前句子或上一句的开始时间
    const currentSentence = resource.transcript.find(
      (sentence) =>
        currentTime >= sentence.startTime && currentTime <= sentence.endTime
    );
    if (currentSentence) {
      setCurrentTime(currentSentence.startTime);
    }
  };

  const handleToEnd = () => {
    // 跳转到当前句子的结束时间
    const currentSentence = resource.transcript.find(
      (sentence) =>
        currentTime >= sentence.startTime && currentTime <= sentence.endTime
    );
    if (currentSentence) {
      setCurrentTime(currentSentence.endTime);
    }
  };

  const handlePrevious = () => {
    // 找到当前句子的索引
    const currentSentenceIndex = resource.transcript.findIndex(
      (sentence) =>
        currentTime >= sentence.startTime && currentTime <= sentence.endTime
    );
    if (currentSentenceIndex < 0) return;
    const targetSentenceIndex =
      currentSentenceIndex > 0 ? currentSentenceIndex - 1 : 0;
    // 如果找到当前句子且不是第一句，跳转到上一句的开始
    const previousSentence = resource.transcript[targetSentenceIndex];
    setCurrentTime(previousSentence.startTime);
  };

  const handleNext = () => {
    // 找到当前句子的索引
    const currentSentenceIndex = resource.transcript.findIndex(
      (sentence) =>
        currentTime >= sentence.startTime && currentTime <= sentence.endTime
    );
    if (currentSentenceIndex < 0) return;

    // 如果找到当前句子且不是最后一句，跳转到下一句的开始
    const nextSentenceIndex =
      currentSentenceIndex < resource.transcript.length - 1
        ? currentSentenceIndex + 1
        : resource.transcript.length - 1;
    const nextSentence = resource.transcript[nextSentenceIndex];
    setCurrentTime(nextSentence.startTime);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="bg-center bg-cover bg-no-repeat absolute inset-0 blur-3xl"
        style={{ backgroundImage: `url(${resource.logo})` }}
      />
      <div
        className="absolute inset-0"
        style={{ backdropFilter: "brightness(0.5)" }}
      >
        <AudioPlayer
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToStart={handleToStart}
          onToEnd={handleToEnd}
          onTimeUpdate={handleTimeUpdate}
          onDurationUpdate={setDuration}
          currentTime={currentTime}
          resource={resource}
        />

        <Transcript
          className="absolute inset-0"
          sentences={resource.transcript}
          currentTime={currentTime}
        />
      </div>
    </div>
  );
}
