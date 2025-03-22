'use client';

import { useState, useEffect } from 'react';
import FileInput from '@/components/file-input/FileInput';
import DiffViewer from '@/components/diff-viewer/DiffViewer';

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
      const result = await import('@/lib/diff/diffAlgorithm').then(module => {
        return module.default(leftContent, rightContent);
      });
      
      setDiffResult(result);
    } catch (error) {
      console.error('Error comparing files:', error);
    }
  };
  
  const handleResetView = () => {
    setDiffResult(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm text-gray-800 p-4">
        <h1 className="text-2xl font-bold text-blue-600">DiffCheck</h1>
      </header>
      
      <main className="flex-grow flex flex-col p-4 max-w-screen-2xl mx-auto w-full">
        {/* Show either input or diff view, not both */}
        {!diffResult ? (
          <div className="flex gap-4 flex-col md:flex-row h-full">
            <div className="flex-1">
              <FileInput
                label="Original File"
                content={leftContent}
                onChange={setLeftContent}
                language="abap"
              />
            </div>
            <div className="flex-1">
              <FileInput
                label="Modified File"
                content={rightContent}
                onChange={setRightContent}
                language="abap"
              />
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-120px)]">
            <DiffViewer 
              diffResult={diffResult} 
              leftContent={leftContent}
              rightContent={rightContent}
              onResetView={handleResetView}
            />
          </div>
        )}
      </main>
    </div>
  );
}
