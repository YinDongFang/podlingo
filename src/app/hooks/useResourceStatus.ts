"use client";

import { useState, useEffect } from "react";
import { ResourceStatus } from "../types";

export function useResourceStatus(episodeId: string) {
  const [resourceStatus, setResourceStatus] = useState<ResourceStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkResourceStatus = async () => {
    try {
      const response = await fetch(`/api/resource-status/${episodeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResourceStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "检查资源状态时发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkResourceStatus();

    // 如果资源正在获取中，设置轮询
    if (resourceStatus?.status === "fetching") {
      const interval = setInterval(checkResourceStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [episodeId, resourceStatus?.status]);

  return {
    isFetching: resourceStatus?.status === "fetching",
    error,
    isLoading,
    refetch: checkResourceStatus,
  };
}
