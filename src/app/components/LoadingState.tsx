"use client";

import { ResourceStatus } from "../types";

export default function LoadingState({
  status,
}: {
  status: ResourceStatus | null;
}) {
  let description = {
    default: "...",
    start: "准备资源...",
    metadata: "正在获取播客元数据...",
    transcript: "正在获取播客文本...",
    translate: "正在翻译播客文本...",
    postprocess: "正在处理播客文本...",
  }[status?.status || "default"];

  if (status?.status === "translate") {
    description += ` ${status?.loaded}/${status?.total}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            准备资源...
          </h2>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
