//code: src/components/diff-viewer/DiffViewer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { DiffResult, LineComparison, DiffChunk } from '@/lib/diff/diffAlgorithm';
import { useMonaco } from '@monaco-editor/react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs.css';
import 'highlight.js/styles/github.css';
// Add diff-match-patch for word-level diff
import { diff_match_patch } from 'diff-match-patch';

// Custom ABAP syntax for highlight.js
hljs.registerLanguage('abap', function(hljs) {
  return {
    name: 'ABAP',
    case_insensitive: true,
    keywords: {
      keyword: 'REPORT DATA TYPE TABLE OF SELECT FROM INTO UP TO ROWS ' +
               'LOOP AT ENDLOOP IF ENDIF WRITE ENDMETHOD CALL FUNCTION ' +
               'METHOD IMPORTING EXPORTING CHANGING FORM ENDFORM PERFORM ' +
               'CLEAR FIELD-SYMBOLS ASSIGN CP EQ NE GT LT GE LE VALUE CONSTANTS',
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
  onMergeChanges?: (updatedLeftContent: string, updatedRightContent: string) => void;
}

// Define a history item type to track changes
interface HistoryItem {
  leftContent: string;
  rightContent: string;
}

export default function DiffViewer({ 
  diffResult, 
  leftContent, 
  rightContent,
  onResetView,
  onMergeChanges
}: DiffViewerProps) {
  const [activeChunk, setActiveChunk] = useState<number | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<number | null>(null);
  
  // Add history state tracking
  const [history, setHistory] = useState<HistoryItem[]>([{ leftContent, rightContent }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  const chunkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  
  // Set up chunk refs
  useEffect(() => {
    chunkRefs.current = chunkRefs.current.slice(0, diffResult.chunks.length);
    // Reset selection when diff result changes
    setSelectedChunk(null);
  }, [diffResult.chunks.length]);
  
  // Synchronize scroll between panes
  useEffect(() => {
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    
    if (!leftPane || !rightPane) return;
    
    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      const handler = () => {
        target.scrollTop = source.scrollTop;
      };
      
      source.addEventListener('scroll', handler);
      return () => source.removeEventListener('scroll', handler);
    };
    
    const cleanupLeft = syncScroll(leftPane, rightPane);
    const cleanupRight = syncScroll(rightPane, leftPane);
    
    return () => {
      cleanupLeft();
      cleanupRight();
    };
  }, []);
  
  // Function to add a new history state when changes are made
  const addToHistory = (newLeftContent: string, newRightContent: string) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add the new state
    newHistory.push({ leftContent: newLeftContent, rightContent: newRightContent });
    
    // Update history and index
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      // Apply the previous state
      if (onMergeChanges) {
        onMergeChanges(previousState.leftContent, previousState.rightContent);
      }
      
      // Update the history index
      setHistoryIndex(newIndex);
    }
  };
  
  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      // Apply the next state
      if (onMergeChanges) {
        onMergeChanges(nextState.leftContent, nextState.rightContent);
      }
      
      // Update the history index
      setHistoryIndex(newIndex);
    }
  };
  
  // Function to determine if a chunk has actual differences
  const chunkHasDifferences = (chunk: DiffChunk): boolean => {
    return chunk.additions > 0 || chunk.deletions > 0;
  };
  
  // Sort chunks by their line numbers to maintain correct order
  const sortedChunks = [...diffResult.chunks].sort((a, b) => {
    // Get the first valid line number from each chunk
    const aLine = a.lines[0]?.lineNumber.left || a.lines[0]?.lineNumber.right || 0;
    const bLine = b.lines[0]?.lineNumber.left || b.lines[0]?.lineNumber.right || 0;
    return aLine - bLine;
  });
  
  // Navigate to chunks
  const navigateToChunk = (index: number) => {
    // Get only chunks that have differences
    const diffChunks = sortedChunks
      .map((chunk, idx) => ({ chunk, idx }))
      .filter(({ chunk }) => chunkHasDifferences(chunk));
    
    if (diffChunks.length === 0) return;
    
    // If index is provided and valid, use it
    if (index >= 0 && index < diffChunks.length) {
      const { idx } = diffChunks[index];
      const chunk = chunkRefs.current[idx];
      if (chunk) {
        chunk.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveChunk(idx);
        setSelectedChunk(idx);
      }
    }
  };
  
  const navigatePrevChunk = () => {
    // Get only chunks that have differences
    const diffChunks = sortedChunks
      .map((chunk, idx) => ({ chunk, idx }))
      .filter(({ chunk }) => chunkHasDifferences(chunk));
    
    if (diffChunks.length === 0) return;
    
    // Find the current selected chunk in the diffChunks array
    const currentIndex = diffChunks.findIndex(({ idx }) => idx === selectedChunk);
    
    // If there's a selected chunk and it's not the first one
    if (currentIndex > 0) {
      // Go to previous diff chunk
      const { idx } = diffChunks[currentIndex - 1];
      navigateToChunk(currentIndex - 1);
    } else {
      // Wrap around to the last chunk if at the beginning
      const { idx } = diffChunks[diffChunks.length - 1];
      navigateToChunk(diffChunks.length - 1);
    }
  };
  
  const navigateNextChunk = () => {
    // Get only chunks that have differences
    const diffChunks = sortedChunks
      .map((chunk, idx) => ({ chunk, idx }))
      .filter(({ chunk }) => chunkHasDifferences(chunk));
    
    if (diffChunks.length === 0) return;
    
    // Find the current selected chunk in the diffChunks array
    const currentIndex = diffChunks.findIndex(({ idx }) => idx === selectedChunk);
    
    // If there's a selected chunk and it's not the last one
    if (currentIndex >= 0 && currentIndex < diffChunks.length - 1) {
      // Go to next diff chunk
      navigateToChunk(currentIndex + 1);
    } else {
      // Wrap around to the first chunk if at the end or no selection
      navigateToChunk(0);
    }
  };
  
  // Handle chunk selection
  const handleChunkClick = (chunkIndex: number) => {
    setSelectedChunk(chunkIndex === selectedChunk ? null : chunkIndex);
    setActiveChunk(chunkIndex);
  };

  // Merge selected chunk from left to right (overwrite right with left)
  const mergeLeftToRight = (chunkIndex: number) => {
    if (!diffResult || !diffResult.chunks) return;
    
    const chunk = diffResult.chunks[chunkIndex];
    if (!chunk) return;
    
    // Get all the lines from this chunk that exist in the left side
    const leftLines = chunk.lines
      .filter(line => line.content.left !== null)
      .map(line => line.content.left as string); // Non-null assertion with type cast
    
    // If no left lines, nothing to merge
    if (leftLines.length === 0) return;
    
    // Get line numbers to determine where to insert in the right content
    const lineNumbers = chunk.lines
      .filter(line => line.lineNumber.right !== null)
      .map(line => line.lineNumber.right as number); // Non-null assertion with type cast
    
    // Determine the insertion point in the right content
    let rightLines = rightContent.split('\n');
    
    // If we have line numbers on the right side, use them for positioning
    if (lineNumbers.length > 0) {
      // Sort and get the first and last line numbers
      const sortedLineNumbers = [...lineNumbers];
      sortedLineNumbers.sort((a, b) => a - b);
      
      const firstLine = sortedLineNumbers[0];
      const lastLine = sortedLineNumbers[sortedLineNumbers.length - 1];
      
      // Replace the lines in the right content
      if (firstLine !== undefined && lastLine !== undefined) {
        // Remove the lines that will be replaced (convert from 1-indexed to 0-indexed)
        rightLines.splice(firstLine - 1, lastLine - firstLine + 1);
        
        // Insert the left lines at the position of the first line
        rightLines.splice(firstLine - 1, 0, ...leftLines);
      } else {
        // If there's no clear position, append to the end
        rightLines.push(...leftLines);
      }
    } else {
      // If there are no line numbers on the right side, find adjacent content
      
      // Try to find lines before this chunk
      const prevRightLineNumber = chunk.lines
        .findIndex(line => line.lineNumber.right !== null);
      
      if (prevRightLineNumber >= 0) {
        // Insert after the previous line
        const lineNumber = chunk.lines[prevRightLineNumber].lineNumber.right;
        if (lineNumber !== null) {
          rightLines.splice(lineNumber, 0, ...leftLines);
        } else {
          // Fallback - append to the end
          rightLines.push(...leftLines);
        }
      } else {
        // If no clear position, append to the end
        rightLines.push(...leftLines);
      }
    }
    
    // Update right content
    const newRightContent = rightLines.join('\n');
    
    // Add the change to history before updating
    addToHistory(leftContent, newRightContent);
    
    // Call the callback with updated content
    if (onMergeChanges) {
      onMergeChanges(leftContent, newRightContent);
    }
    
    // Force re-render to show the updated diff
    setSelectedChunk(null);
  };
  
  // Merge selected chunk from right to left (overwrite left with right)
  const mergeRightToLeft = (chunkIndex: number) => {
    if (!diffResult || !diffResult.chunks) return;
    
    const chunk = diffResult.chunks[chunkIndex];
    if (!chunk) return;
    
    // Get all the lines from this chunk that exist in the right side
    const rightLines = chunk.lines
      .filter(line => line.content.right !== null)
      .map(line => line.content.right as string); // Non-null assertion with type cast
    
    // If no right lines, nothing to merge
    if (rightLines.length === 0) return;
    
    // Get line numbers to determine where to insert in the left content
    const lineNumbers = chunk.lines
      .filter(line => line.lineNumber.left !== null)
      .map(line => line.lineNumber.left as number); // Non-null assertion with type cast
    
    // Determine the insertion point in the left content
    let leftLines = leftContent.split('\n');
    
    // If we have line numbers on the left side, use them for positioning
    if (lineNumbers.length > 0) {
      // Sort and get the first and last line numbers
      const sortedLineNumbers = [...lineNumbers];
      sortedLineNumbers.sort((a, b) => a - b);
      
      const firstLine = sortedLineNumbers[0];
      const lastLine = sortedLineNumbers[sortedLineNumbers.length - 1];
      
      // Replace the lines in the left content
      if (firstLine !== undefined && lastLine !== undefined) {
        // Remove the lines that will be replaced (convert from 1-indexed to 0-indexed)
        leftLines.splice(firstLine - 1, lastLine - firstLine + 1);
        
        // Insert the right lines at the position of the first line
        leftLines.splice(firstLine - 1, 0, ...rightLines);
      } else {
        // If there's no clear position, append to the end
        leftLines.push(...rightLines);
      }
    } else {
      // If there are no line numbers on the left side, find adjacent content
      
      // Try to find lines before this chunk
      const prevLeftLineNumber = chunk.lines
        .findIndex(line => line.lineNumber.left !== null);
      
      if (prevLeftLineNumber >= 0) {
        // Insert after the previous line
        const lineNumber = chunk.lines[prevLeftLineNumber].lineNumber.left;
        if (lineNumber !== null) {
          leftLines.splice(lineNumber, 0, ...rightLines);
        } else {
          // Fallback - append to the end
          leftLines.push(...rightLines);
        }
      } else {
        // If no clear position, append to the end
        leftLines.push(...rightLines);
      }
    }
    
    // Update left content
    const newLeftContent = leftLines.join('\n');
    
    // Add the change to history before updating
    addToHistory(newLeftContent, rightContent);
    
    // Call the callback with updated content
    if (onMergeChanges) {
      onMergeChanges(newLeftContent, rightContent);
    }
    
    // Force re-render to show the updated diff
    setSelectedChunk(null);
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Success feedback could be added here
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  const copyLeftContent = () => {
    copyToClipboard(leftContent);
  };
  
  const copyRightContent = () => {
    copyToClipboard(rightContent);
  };
  
  // Update the reset functionality to clear history as well
  const handleReset = () => {
    // Clear history when resetting
    setHistory([{ leftContent, rightContent }]);
    setHistoryIndex(0);
    
    // Call the original reset function
    onResetView();
  };

  // Check if any diffs exist
  const hasChanges = diffResult.stats.additions > 0 || diffResult.stats.deletions > 0;
  
  // Determine if undo/redo are available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="bg-white border rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header with summary and controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center space-x-5">
          {!hasChanges ? (
            <div className="text-blue-600 font-medium text-base">
              Files are identical
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-green-700 font-medium text-base">{diffResult.stats.additions} additions</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-red-700 font-medium text-base">{diffResult.stats.deletions} deletions</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Navigation controls - always visible when there are changes */}
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-700">
                {selectedChunk !== null ? `Change ${selectedChunk + 1} of ${diffResult.chunks.filter(chunk => chunkHasDifferences(chunk)).length}` : ''}
              </div>
              <button 
                onClick={navigatePrevChunk}
                className="px-2 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded flex items-center"
                aria-label="Previous change"
                disabled={!hasChanges}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
                Prev
              </button>
              <button 
                onClick={navigateNextChunk}
                className="px-2 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded flex items-center"
                aria-label="Next change"
                disabled={!hasChanges}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {/* History and reset controls */}
          <div className="flex items-center space-x-2">
            {/* Undo button */}
            <button
              className={`px-3 py-1 text-sm rounded flex items-center ${
                canUndo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo last change"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
              </svg>
              Undo
            </button>
            
            {/* Redo button */}
            <button
              className={`px-3 py-1 text-sm rounded flex items-center ${
                canRedo ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo last undone change"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.207 2.232a.75.75 0 00.025 1.06L16.378 7.25H6.375a5.375 5.375 0 000 10.75h2.875a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.06.025z" clipRule="evenodd" />
              </svg>
              Redo
            </button>
            
            {/* Reset button */}
            <button
              className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
              onClick={handleReset}
            >
              Reset Comparison
            </button>
          </div>
        </div>
      </div>
      
      {/* File headers with copy buttons */}
      <div className="flex bg-gray-100 text-gray-700 text-sm border-b">
        <div className="w-1/2 py-1 px-4 font-medium border-r text-gray-800 flex justify-between items-center">
          <span>Original</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">{diffResult.stats.totalLeft} lines</span>
            <button 
              onClick={copyLeftContent}
              className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="w-1/2 py-1 px-4 font-medium text-gray-800 flex justify-between items-center">
          <span>Modified</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">{diffResult.stats.totalRight} lines</span>
            <button 
              onClick={copyRightContent}
              className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content with diffs */}
      <div className="relative flex-grow flex overflow-hidden">
        {/* Left pane */}
        <div 
          ref={leftPaneRef}
          className="w-1/2 overflow-auto border-r"
          style={{ height: '100%' }}
        >
          {sortedChunks.map((chunk, chunkIndex) => {
            const hasDifferences = chunkHasDifferences(chunk);
            
            return hasDifferences ? (
              <div 
                key={`chunk-left-${chunkIndex}`}
                ref={(el) => { chunkRefs.current[chunkIndex] = el; }}
                className={`${
                  selectedChunk === chunkIndex ? 'ring-2 ring-blue-500' : ''
                } ${chunkIndex > 0 ? 'border-t border-gray-200' : ''}`}
                onClick={hasDifferences ? () => handleChunkClick(chunkIndex) : undefined}
              >
                {/* Chunk header - only show for chunks with differences */}
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-700 flex justify-between items-center">
                  <span className="text-red-600 font-medium">
                    {chunk.deletions > 0 ? `−${chunk.deletions} ${chunk.deletions === 1 ? 'removal' : 'removals'}` : ''}
                  </span>
                  
                  {/* Merge controls - visible only when chunk is selected */}
                  {selectedChunk === chunkIndex && (
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeLeftToRight(chunkIndex);
                        }}
                        className="px-2 py-0.5 text-xs bg-red-500 text-white hover:bg-red-600 rounded"
                      >
                        Merge change ←
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Chunk content */}
                <div>
                  {chunk.lines.map((line, lineIndex) => (
                    <div 
                      key={`line-left-${chunkIndex}-${lineIndex}`}
                      className={`flex ${getLineClass(line.type, 'left')} cursor-pointer`}
                    >
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-gray-500 select-none border-r bg-gray-50 text-xs">
                        {line.lineNumber.left || ' '}
                      </div>
                      <div className="w-full overflow-x-auto">
                        {line.content.left ? (
                          <CodeLine 
                            content={line.content.left} 
                            language="abap"
                            isModified={line.type === 'modified'}
                            otherContent={line.content.right || ''}
                            side="left"
                          />
                        ) : (
                          <div className="px-2 py-0 h-5"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // For identical chunks, render without borders and extra styling
              <div 
                key={`chunk-left-${chunkIndex}`}
              >
                <div>
                  {chunk.lines.map((line, lineIndex) => (
                    <div 
                      key={`line-left-${chunkIndex}-${lineIndex}`}
                      className="flex"
                    >
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-gray-500 select-none border-r bg-gray-50 text-xs">
                        {line.lineNumber.left || ' '}
                      </div>
                      <div className="w-full overflow-x-auto">
                        {line.content.left ? (
                          <CodeLine 
                            content={line.content.left} 
                            language="abap"
                            side="left"
                          />
                        ) : (
                          <div className="px-2 py-0 h-5"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Right pane */}
        <div 
          ref={rightPaneRef}
          className="w-1/2 overflow-auto"
          style={{ height: '100%' }}
        >
          {sortedChunks.map((chunk, chunkIndex) => {
            const hasDifferences = chunkHasDifferences(chunk);
            
            return hasDifferences ? (
              <div 
                key={`chunk-right-${chunkIndex}`}
                className={`${
                  selectedChunk === chunkIndex ? 'ring-2 ring-blue-500' : ''
                } ${chunkIndex > 0 ? 'border-t border-gray-200' : ''}`}
                onClick={hasDifferences ? () => handleChunkClick(chunkIndex) : undefined}
              >
                {/* Chunk header - only show for chunks with differences */}
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-700 flex justify-between items-center">
                  <span className="text-green-600 font-medium">
                    {chunk.additions > 0 ? `+${chunk.additions} ${chunk.additions === 1 ? 'addition' : 'additions'}` : ''}
                  </span>
                  
                  {/* Merge controls - visible only when chunk is selected */}
                  {selectedChunk === chunkIndex && (
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeRightToLeft(chunkIndex);
                        }}
                        className="px-2 py-0.5 text-xs bg-green-500 text-white hover:bg-green-600 rounded"
                      >
                        Merge change →
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Chunk content */}
                <div>
                  {chunk.lines.map((line, lineIndex) => (
                    <div 
                      key={`line-right-${chunkIndex}-${lineIndex}`}
                      className={`flex ${getLineClass(line.type, 'right')} cursor-pointer`}
                    >
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-gray-500 select-none border-r bg-gray-50 text-xs">
                        {line.lineNumber.right || ' '}
                      </div>
                      <div className="w-full overflow-x-auto">
                        {line.content.right ? (
                          <CodeLine 
                            content={line.content.right} 
                            language="abap"
                            isModified={line.type === 'modified'}
                            otherContent={line.content.left || ''}
                            side="right"
                          />
                        ) : (
                          <div className="px-2 py-0 h-5"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // For identical chunks, render without borders and extra styling
              <div 
                key={`chunk-right-${chunkIndex}`}
              >
                <div>
                  {chunk.lines.map((line, lineIndex) => (
                    <div 
                      key={`line-right-${chunkIndex}-${lineIndex}`}
                      className="flex"
                    >
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-gray-500 select-none border-r bg-gray-50 text-xs">
                        {line.lineNumber.right || ' '}
                      </div>
                      <div className="w-full overflow-x-auto">
                        {line.content.right ? (
                          <CodeLine 
                            content={line.content.right} 
                            language="abap"
                            side="right"
                          />
                        ) : (
                          <div className="px-2 py-0 h-5"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Minimap indicator (right side) */}
        <div
          ref={minimapRef}
          className="absolute right-0 top-0 w-1.5 h-full"
          style={{ background: '#f5f5f5' }}
        >
          {sortedChunks.map((chunk, index) => {
            // Calculate position relative to file size
            const totalLines = Math.max(diffResult.stats.totalLeft, diffResult.stats.totalRight);
            const chunkLines = chunk.lines.length;
            const chunkStartLine = chunk.lines[0]?.lineNumber.left || chunk.lines[0]?.lineNumber.right || 0;
            
            const topPercent = (chunkStartLine / totalLines) * 100;
            const heightPercent = (chunkLines / totalLines) * 100;
            
            // Only show in minimap if chunk has differences
            const hasDifferences = chunkHasDifferences(chunk);
            if (!hasDifferences) return null;
            
            // Determine color based on chunk content
            let color = '#ccc'; // Default gray
            if (chunk.additions > 0 && chunk.deletions > 0) {
              color = '#f9d876'; // Yellow for mixed changes
            } else if (chunk.additions > 0) {
              color = '#4ac26b'; // Green for additions
            } else if (chunk.deletions > 0) {
              color = '#f85149'; // Red for deletions
            }
            
            // Highlight selected chunk
            const isSelected = selectedChunk === index;
            
            return (
              <div
                key={`minimap-${index}`}
                className={`absolute w-full transition-all ${isSelected ? 'w-2 -right-0.5' : ''}`}
                style={{
                  top: `${topPercent}%`,
                  height: `${Math.max(heightPercent, 1)}%`, // At least 1% height for visibility
                  backgroundColor: isSelected ? '#2196f3' : color,
                }}
                onClick={() => navigateToChunk(index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Separated component for code lines with syntax highlighting and word-level diffs
interface CodeLineProps {
  content: string;
  language: string;
  isModified?: boolean;
  otherContent?: string;
  side: 'left' | 'right';
}

function CodeLine({ content, language, isModified = false, otherContent = '', side }: CodeLineProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    if (codeRef.current) {
      // First, perform regular syntax highlighting
      const syntaxHighlighted = hljs.highlight(content, { language, ignoreIllegals: true }).value;
      
      if (isModified && otherContent) {
        try {
          // For modified lines, perform precise word-level diff
          const dmp = new diff_match_patch();
          
          // Improve diff quality with closer word boundaries
          dmp.Diff_EditCost = 4; 
          
          // Run the diff algorithm in the correct direction
          const diffs = side === 'left' 
            ? dmp.diff_main(content, otherContent)
            : dmp.diff_main(otherContent, content);
            
          // Clean up the diff to be more human-readable
          dmp.diff_cleanupSemantic(diffs);
          dmp.diff_cleanupEfficiency(diffs);
          
          // Create a syntax-highlighted version that we can overlay with diff markup
          codeRef.current.innerHTML = syntaxHighlighted;
          
          // Find text nodes to apply diff highlighting
          const textNodes = getTextNodes(codeRef.current);
          if (textNodes.length > 0) {
            // Apply word diff highlighting
            applyWordDiffHighlighting(textNodes, diffs, side);
          }
        } catch (e) {
          // Fallback to regular syntax highlighting if the diff fails
          codeRef.current.innerHTML = syntaxHighlighted;
        }
      } else {
        // Regular syntax highlighting for unchanged, purely added or purely removed lines
        codeRef.current.innerHTML = syntaxHighlighted;
      }
      
      // Apply ABAP-specific styling to highlighted elements
      if (language === 'abap' && codeRef.current.querySelectorAll) {
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
  }, [content, language, isModified, otherContent, side]);
  
  return (
    <pre 
      ref={codeRef}
      className="px-2 py-0 m-0 text-xs font-mono leading-tight"
      style={{ 
        color: '#000', 
        backgroundColor: 'transparent',
      }}
    >
      {content}
    </pre>
  );
}

// Helper function to get all text nodes from an element
function getTextNodes(node: Node): Text[] {
  const textNodes: Text[] = [];
  
  function traverse(currentNode: Node) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      textNodes.push(currentNode as Text);
    } else {
      for (const child of Array.from(currentNode.childNodes)) {
        traverse(child);
      }
    }
  }
  
  traverse(node);
  return textNodes;
}

// Helper function to apply word-level diff highlighting to text nodes
function applyWordDiffHighlighting(textNodes: Text[], diffs: [number, string][], side: 'left' | 'right') {
  let textContent = '';
  
  // Concatenate all text nodes to get the full text
  textNodes.forEach(node => {
    textContent += node.nodeValue;
  });
  
  // Create a map of changes
  const changes: {[key: number]: {type: number, length: number}} = {};
  let pos = 0;
  
  // Mark positions that need highlighting
  diffs.forEach(([op, text]) => {
    if ((op === -1 && side === 'left') || (op === 1 && side === 'right')) {
      // This text is deleted/added in the diff
      const start = textContent.indexOf(text, pos);
      if (start !== -1) {
        // Mark this range for highlighting
        for (let i = 0; i < text.length; i++) {
          changes[start + i] = {type: op, length: text.length};
        }
        pos = start + text.length;
      }
    } else {
      // Move position forward for unchanged text
      pos += text.length;
    }
  });
  
  // Apply highlights
  let currentPos = 0;
  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const text = node.nodeValue || '';
    
    // Check for changes in this node
    let hasChanges = false;
    for (let j = 0; j < text.length; j++) {
      if (changes[currentPos + j]) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      // Replace this text node with a highlighted version
      const parent = node.parentNode;
      if (parent) {
        const fragment = document.createDocumentFragment();
        let currentText = '';
        let inHighlight = false;
        
        for (let j = 0; j < text.length; j++) {
          const pos = currentPos + j;
          const char = text[j];
          
          if (changes[pos] && !inHighlight) {
            // Start a new highlighted section
            if (currentText) {
              fragment.appendChild(document.createTextNode(currentText));
              currentText = '';
            }
            
            const span = document.createElement('span');
            const changeType = changes[pos].type;
            
            if (changeType === -1 && side === 'left') {
              // Highlight deletion in left pane
              span.style.backgroundColor = '#ffcccc';
              span.style.color = '#770000';
            } else if (changeType === 1 && side === 'right') {
              // Highlight addition in right pane
              span.style.backgroundColor = '#ccffcc';
              span.style.color = '#007700';
            }
            
            span.appendChild(document.createTextNode(char));
            fragment.appendChild(span);
            inHighlight = true;
          } else if (!changes[pos] && inHighlight) {
            // End the highlighted section
            inHighlight = false;
            currentText = char;
          } else if (inHighlight) {
            // Continue the existing highlight
            const spans = fragment.querySelectorAll('span');
            const lastSpan = spans[spans.length - 1];
            if (lastSpan) {
              lastSpan.textContent += char;
            }
          } else {
            // Continue regular text
            currentText += char;
          }
        }
        
        // Add any remaining text
        if (currentText) {
          fragment.appendChild(document.createTextNode(currentText));
        }
        
        // Replace the original node with our enhanced version
        parent.replaceChild(fragment, node);
      }
    }
    
    currentPos += text.length;
  }
}

// Helper function to get class based on line type and side
function getLineClass(type: string, side: 'left' | 'right') {
  if (type === 'context') {
    return 'bg-[#fffbf0]'; // Light yellow for context lines
  }
  
  if (side === 'left') {
    switch (type) {
      case 'removed': return 'bg-[#ffecec]'; // Light red for removed lines
      case 'modified': return 'bg-[#ffecec]'; // Light red for modified lines on left
      default: return '';
    }
  } else {
    switch (type) {
      case 'added': return 'bg-[#e6ffed]'; // Light green for added lines
      case 'modified': return 'bg-[#e6ffed]'; // Light green for modified lines on right
      default: return '';
    }
  }
} 