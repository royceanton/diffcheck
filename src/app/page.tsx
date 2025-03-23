//code: src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FileInput from '@/components/file-input/FileInput';
import DiffViewer from '@/components/diff-viewer/DiffViewer';
import { splitAbapStatements, normalizeLineEndings } from '@/lib/diff/abapParser';
import Link from 'next/link';

export default function Home() {
  const [leftContent, setLeftContent] = useState<string>('');
  const [rightContent, setRightContent] = useState<string>('');
  const [diffResult, setDiffResult] = useState<any>(null);
  
  // Calculate diff when content changes
  useEffect(() => {
    if (leftContent && rightContent) {
      handleCompare();
    }
  }, [leftContent, rightContent]);
  
  const handleCompare = async () => {
    try {
      // Preprocess ABAP code - split by statements and normalize line endings
      const processedLeftContent = splitAbapStatements(normalizeLineEndings(leftContent));
      const processedRightContent = splitAbapStatements(normalizeLineEndings(rightContent));
      
      const result = await import('@/lib/diff/diffAlgorithm').then(module => {
        return module.default(processedLeftContent, processedRightContent);
      });
      
      setDiffResult(result);
    } catch (error) {
      console.error('Error comparing files:', error);
    }
  };
  
  const handleResetView = () => {
    setDiffResult(null);
  };
  
  // Handle merging changes
  const handleMergeChanges = (updatedLeftContent: string, updatedRightContent: string) => {
    setLeftContent(updatedLeftContent);
    setRightContent(updatedRightContent);
    
    // Toast notification or feedback could be added here
    showMergeNotification();
  };
  
  // Simple notification to show merge was successful
  const showMergeNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5';
    notification.textContent = 'Changes merged successfully!';
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };
  
  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* More compact header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 py-3 px-6 shadow-md">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                DiffCatcher
                <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full text-white/90 uppercase tracking-wide">Beta</span>
              </h1>
            </div>
            
            {/* Navigation buttons */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {[
                { name: 'Home', href: '/' },
                { name: 'About', href: '/about' },
                { name: 'Text Compare', href: '/text-compare' },
                { name: 'Code Compare', href: '/code-compare' },
                { name: 'Document Compare', href: '/document-compare' }
              ].map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="px-2 py-1.5 text-xs sm:text-sm text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content with fixed height to ensure footer visibility */}
      <main className="flex-grow flex flex-col p-4 max-w-screen-2xl mx-auto w-full overflow-hidden" style={{height: 'calc(100vh - 120px)'}}>
        {!diffResult ? (
          <div className="h-full flex gap-6 flex-col md:flex-row">
            <div className="flex-1">
              <FileInput
                label="Original File"
                content={leftContent}
                onChange={setLeftContent}
                language="plaintext"
              />
            </div>
            <div className="flex-1">
              <FileInput
                label="Modified File"
                content={rightContent}
                onChange={setRightContent}
                language="plaintext"
              />
            </div>
          </div>
        ) : (
          <div className="h-full">
            <DiffViewer 
              diffResult={diffResult} 
              leftContent={leftContent}
              rightContent={rightContent}
              onResetView={handleResetView}
              onMergeChanges={handleMergeChanges}
            />
          </div>
        )}
      </main>
      
      {/* Fixed footer that doesn't scroll */}
      <footer className="py-2 text-center text-sm text-zinc-500 border-t border-zinc-200 bg-white shadow-sm">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-center items-center gap-2">
            <span>DiffCatcher &copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span>Fast code comparison and merging</span>
            <span>•</span>
            <span>Supports 20+ programming languages</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
