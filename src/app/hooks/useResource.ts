"use client";

import { useState, useEffect, useRef } from "react";
import { ResourceStatus } from "../types";

export function useResource(episodeId: string) {
  const [status, setStatus] = useState<ResourceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkResourceStatus = async () => {
    try {
      const response = await fetch(`/api/resource-status/${episodeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "检查资源状态时发生错误");
      stopAutoRefresh();
    } finally {
      setLoading(false);
    }
  };

  const autoRefreshRef = useRef<any>(undefined);
  const startAutoRefresh = () => {
    checkResourceStatus();
    autoRefreshRef.current = setInterval(checkResourceStatus, 3000);
  };
  const stopAutoRefresh = () => {
    clearInterval(autoRefreshRef.current);
  };

  useEffect(() => {
    startAutoRefresh();
    return stopAutoRefresh;
  }, []);

  useEffect(() => {
    if (status?.status === "completed" || status?.status !== "failed") {
      stopAutoRefresh();
    }
  }, [status?.status]);

  return { status, error, loading, refetch: startAutoRefresh };
}
