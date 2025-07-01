'use client';

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            PodLingo - 播客英语学习
          </h1>
        </div>
      </header>
      
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 PodLingo. 让播客学习更简单。
          </p>
        </div>
      </footer>
    </div>
  );
} 