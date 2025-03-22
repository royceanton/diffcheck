'use client';

import { useState, useEffect, useRef } from 'react';
import { DiffResult, LineComparison } from '@/lib/diff/diffAlgorithm';
import { useMonaco } from '@monaco-editor/react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs.css';
import 'highlight.js/styles/github.css';

// Custom ABAP syntax for highlight.js
hljs.registerLanguage('abap', function(hljs) {
  return {
    name: 'ABAP',
    case_insensitive: true,
    keywords: {
      keyword: 'REPORT DATA TYPE TABLE OF SELECT FROM INTO UP TO ROWS ' +
               'LOOP AT ENDLOOP IF ENDIF WRITE ENDMETHOD CALL FUNCTION ' +
               'METHOD IMPORTING EXPORTING CHANGING FORM ENDFORM PERFORM ' +
               'CLEAR FIELD-SYMBOLS ASSIGN CP EQ NE GT LT GE LE',
      literal: 'TRUE FALSE NULL',
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: 'number',
        begin: '\\b\\d+\\b',
      },
      {
        className: 'string',
        begin: "'", end: "'",
      }
    ]
  };
});

// Add this style object to ensure ABAP keywords are properly styled
const abapStyles = {
  '.hljs-keyword': { color: '#0000ff', fontWeight: 'bold' },
  '.hljs-string': { color: '#a31515' },
  '.hljs-title': { color: '#795e26' },
  '.hljs-literal': { color: '#0000ff' },
  '.hljs-comment': { color: '#008000' },
  '.hljs-addition': { backgroundColor: '#eaffee' },
  '.hljs-deletion': { backgroundColor: '#ffebe9' },
};

interface DiffViewerProps {
  diffResult: DiffResult;
  leftContent: string;
  rightContent: string;
  onResetView: () => void;
}

export default function DiffViewer({ 
  diffResult, 
  leftContent, 
  rightContent,
  onResetView 
}: DiffViewerProps) {
  const [addedLines, setAddedLines] = useState(0);
  const [removedLines, setRemovedLines] = useState(0);
  const [identical, setIdentical] = useState(false);
  
  useEffect(() => {
    // Count added and removed lines
    let added = 0;
    let removed = 0;
    
    diffResult.lines.forEach(line => {
      if (line.type === 'added') added++;
      if (line.type === 'removed') removed++;
    });
    
    setAddedLines(added);
    setRemovedLines(removed);
    setIdentical(added === 0 && removed === 0);
  }, [diffResult]);
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center space-x-5 text-sm">
          {identical ? (
            <div className="text-blue-600 font-medium">
              Files are identical
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>{addedLines} additions</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>{removedLines} deletions</span>
              </div>
            </>
          )}
        </div>
        <button
          className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
          onClick={onResetView}
        >
          Reset Comparison
        </button>
      </div>
      
      {/* File headers */}
      <div className="flex bg-gray-100 text-gray-700 text-sm border-b">
        <div className="w-1/2 py-1 px-4 font-medium border-r text-gray-800">Original</div>
        <div className="w-1/2 py-1 px-4 font-medium text-gray-800">Modified</div>
      </div>
      
      {/* Diff content */}
      <div className="bg-gray-50 flex-grow overflow-auto">
        <div className="flex flex-col">
          {diffResult.lines.map((line, index) => (
            <div key={index} className={`flex ${line.type !== 'unchanged' ? getLineTypeClass(line.type) : ''}`}>
              {/* Left side */}
              <div className="w-1/2 border-r flex">
                <div className="w-8 min-w-[32px] flex-shrink-0 text-right pr-1 py-0 text-gray-500 select-none border-r bg-gray-50 text-xs">
                  {line.lineNumber.left || ' '}
                </div>
                <div className="w-full overflow-x-auto">
                  {line.content.left ? (
                    <CodeLine 
                      content={line.content.left} 
                      language="abap"
                    />
                  ) : (
                    <div className="px-2 py-0 h-5"></div>
                  )}
                </div>
              </div>
              
              {/* Right side */}
              <div className="w-1/2 flex">
                <div className="w-8 min-w-[32px] flex-shrink-0 text-right pr-1 py-0 text-gray-500 select-none border-r bg-gray-50 text-xs">
                  {line.lineNumber.right || ' '}
                </div>
                <div className="w-full overflow-x-auto">
                  {line.content.right ? (
                    <CodeLine 
                      content={line.content.right} 
                      language="abap"
                    />
                  ) : (
                    <div className="px-2 py-0 h-5"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Separated component for code lines with syntax highlighting
function CodeLine({ content, language }: { content: string, language: string }) {
  const codeRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    if (codeRef.current) {
      // Use highlight.js to highlight the code as a string and get the HTML
      const highlighted = hljs.highlight(content, { language, ignoreIllegals: true }).value;
      
      // Set the innerHTML to use the highlighted HTML
      codeRef.current.innerHTML = highlighted;
      
      // Apply custom styling to highlighted elements
      if (codeRef.current.querySelectorAll) {
        // Apply keyword styling
        const keywords = codeRef.current.querySelectorAll('.hljs-keyword');
        keywords.forEach(keyword => {
          (keyword as HTMLElement).style.color = '#0000ff';
          (keyword as HTMLElement).style.fontWeight = 'bold';
        });
        
        // Apply string styling
        const strings = codeRef.current.querySelectorAll('.hljs-string');
        strings.forEach(str => {
          (str as HTMLElement).style.color = '#a31515';
        });
        
        // Apply comment styling
        const comments = codeRef.current.querySelectorAll('.hljs-comment');
        comments.forEach(comment => {
          (comment as HTMLElement).style.color = '#008000';
        });
      }
    }
  }, [content, language]);
  
  return (
    <pre 
      ref={codeRef}
      className={`px-2 py-0 m-0 text-xs font-mono leading-tight`}
      style={{ 
        color: '#000', 
        backgroundColor: 'transparent',
      }}
    >
      {content}
    </pre>
  );
}

// Helper function to get class based on line type
function getLineTypeClass(type: string) {
  switch (type) {
    case 'added': return 'bg-[#eaffee]'; // Very light green
    case 'removed': return 'bg-[#ffebe9]'; // Very light red
    case 'modified': return 'bg-[#faf5d7]'; // Very light yellow
    default: return '';
  }
} 