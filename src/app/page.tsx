import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">PodLingo</h1>
          <p className="text-gray-600 mb-6">播客英语学习应用</p>
          
          <div className="space-y-4">
            <Link 
              href="/episode/135018264"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              学习播客 #135018264
            </Link>
            
            <div className="text-sm text-gray-500">
              点击上方链接开始学习播客内容
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
