'use client';

import { useState, useEffect } from 'react';
import { Resource } from '../types';

export function useResource(episodeId: string) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResource = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/episodes/${episodeId}/resource.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResource(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取资源数据时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [episodeId]);

  return {
    resource,
    error,
    isLoading,
    refetch: fetchResource
  };
} 