//code: src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FileInput from '@/components/file-input/FileInput';
import DiffViewer from '@/components/diff-viewer/DiffViewer';
import { splitAbapStatements, normalizeLineEndings } from '@/lib/diff/abapParser';

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
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
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
              onMergeChanges={handleMergeChanges}
            />
          </div>
        )}
      </main>
    </div>
  );
}
