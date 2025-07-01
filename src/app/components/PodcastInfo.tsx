'use client';

import { Resource } from '../types';
import { formatDuration } from '../utils/helpers';

interface PodcastInfoProps {
  resource: Resource;
}

export default function PodcastInfo({ resource }: PodcastInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <img
          src={resource.logoUrl}
          alt="播客封面"
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {resource.title}
          </h1>
          <p className="text-gray-600 mb-3">
            {resource.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatDuration(resource.duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 