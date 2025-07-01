"use client";

import { ResourceStatus } from "../types";

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            准备资源...
          </h2>
          <p className="text-gray-600 text-sm">
            正在为您准备播客资源，请稍候...
          </p>
        </div>
      </div>
    </div>
  );
}
