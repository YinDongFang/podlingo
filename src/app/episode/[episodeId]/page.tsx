"use client";

import { useState, useEffect } from "react";
import { useResourceStatus, useResource } from "@/app/hooks";
import AudioPlayer from "@/app/components/AudioPlayer";
import ErrorState from "@/app/components/ErrorState";
import LoadingState from "@/app/components/LoadingState";
import Transcript from "@/app/components/Transcript";

interface PageProps {
  params: Promise<{ episodeId: string }>;
}

export default function EpisodePage({ params }: PageProps) {
  const [episodeId, setEpisodeId] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);

  // 获取episodeId
  useEffect(() => {
    params.then(({ episodeId }) => setEpisodeId(episodeId));
  }, [params]);

  const {
    isFetching,
    error: statusError,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useResourceStatus(episodeId);
  const {
    resource,
    error: resourceError,
    isLoading: resourceLoading,
  } = useResource(episodeId);

  // 如果episodeId还未设置，显示加载状态
  if (!episodeId) {
    return null;
  }

  // 如果状态检查出错
  if (statusError) {
    return <ErrorState error={statusError} onRetry={refetchStatus} />;
  }

  // 如果资源状态检查中或资源正在获取中
  if (statusLoading || isFetching) {
    return <LoadingState />;
  }

  // 如果资源不存在或获取失败
  if (resourceError || !resource) {
    return (
      <ErrorState
        error={resourceError || "资源不存在"}
        onRetry={refetchStatus}
      />
    );
  }

  // 如果资源数据加载中
  if (resourceLoading) {
    return <LoadingState />;
  }

  // 如果资源数据获取失败
  if (resourceError || !resource) {
    return (
      <ErrorState
        error={resourceError || "无法加载资源数据"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSentenceClick = (time: number) => {
    setCurrentTime(time);
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
          audioUrl={resource.url}
          onTimeUpdate={handleTimeUpdate}
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
