// Implementing a better diff algorithm to get closer to diffchecker.com results

import { diffLines, Change } from 'diff';

export interface DiffResult {
  chunks: DiffChunk[];
  stats: {
    additions: number;
    deletions: number;
    totalLeft: number;
    totalRight: number;
  };
}

export interface DiffChunk {
  lines: LineComparison[];
  additions: number;
  deletions: number;
}

export interface LineComparison {
  type: 'added' | 'removed' | 'unchanged' | 'modified' | 'context';
  content: {
    left: string | null;
    right: string | null;
  };
  lineNumber: {
    left: number | null;
    right: number | null;
  };
}

/**
 * A significantly improved diff algorithm that groups changes into chunks
 * similar to diffchecker.com, with proper context lines
 */
function diffAlgorithm(leftText: string, rightText: string): DiffResult {
  // Handle empty input
  if (!leftText && !rightText) {
    return { 
      chunks: [], 
      stats: { 
        additions: 0, 
        deletions: 0,
        totalLeft: 0,
        totalRight: 0
      } 
    };
  }
  
  // Split the content into lines
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  
  // Track line numbers separately
  let leftLineNumber = 1;
  let rightLineNumber = 1;
  
  // Get the basic diff
  const lineDiffs = diffLines(leftText, rightText);
  
  // Raw result before chunking
  const rawDiff: LineComparison[] = [];
  
  // Process each diff segment
  for (let i = 0; i < lineDiffs.length; i++) {
    const segment = lineDiffs[i];
    const lines = segment.value.split('\n');
    
    // Remove empty line at the end if present
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    
    if (segment.added) {
      // These lines exist only in the right file (added)
      for (const line of lines) {
        rawDiff.push({
          type: 'added',
          content: {
            left: null,
            right: line,
          },
          lineNumber: {
            left: null,
            right: rightLineNumber++,
          }
        });
      }
    } else if (segment.removed) {
      // These lines exist only in the left file (removed)
      const removedLines = lines.map(line => ({
        type: 'removed' as const,
        content: {
          left: line,
          right: null,
        },
        lineNumber: {
          left: leftLineNumber++,
          right: null,
        },
      }));
      
      // Look for potential modifications (removed+added pairs)
      const nextSegment = i < lineDiffs.length - 1 ? lineDiffs[i + 1] : null;
      
      if (nextSegment && nextSegment.added) {
        // We have a potential modification scenario
        const addedLines = nextSegment.value.split('\n');
        if (addedLines[addedLines.length - 1] === '') {
          addedLines.pop();
        }
        
        // Match up pairs as modifications
        const minLength = Math.min(removedLines.length, addedLines.length);
        
        // One-to-one pairing for modified lines
        for (let j = 0; j < minLength; j++) {
          rawDiff.push({
            type: 'modified',
            content: {
              left: removedLines[j].content.left,
              right: addedLines[j],
            },
            lineNumber: {
              left: removedLines[j].lineNumber.left,
              right: rightLineNumber++,
            },
          });
        }
        
        // Handle remaining removed lines
        if (removedLines.length > addedLines.length) {
          for (let j = minLength; j < removedLines.length; j++) {
            rawDiff.push(removedLines[j]);
          }
        }
        
        // Handle remaining added lines
        if (addedLines.length > removedLines.length) {
          for (let j = minLength; j < addedLines.length; j++) {
            rawDiff.push({
              type: 'added',
              content: {
                left: null,
                right: addedLines[j],
              },
              lineNumber: {
                left: null,
                right: rightLineNumber++,
              },
            });
          }
        }
        
        // Skip the next segment since we've already processed it
        i++;
      } else {
        // No modifications, just plain removed lines
        rawDiff.push(...removedLines);
      }
    } else {
      // Unchanged lines exist in both files
      for (const line of lines) {
        rawDiff.push({
          type: 'unchanged',
          content: {
            left: line,
            right: line,
          },
          lineNumber: {
            left: leftLineNumber++,
            right: rightLineNumber++,
          },
        });
      }
    }
  }
  
  // Group changes into chunks with context
  const chunks: DiffChunk[] = [];
  const CONTEXT_LINES = 2; // Number of context lines before and after changes
  
  let currentChunk: DiffChunk | null = null;
  let contextBuffer: LineComparison[] = [];
  let inChange = false;
  
  // Track for stats
  let totalAdditions = 0;
  let totalDeletions = 0;
  
  // Helper to add context lines to the current chunk
  const addContextToChunk = () => {
    if (!currentChunk) {
      currentChunk = { lines: [], additions: 0, deletions: 0 };
    }
    
    // Add buffered context lines, but mark them as context
    for (const line of contextBuffer) {
      currentChunk.lines.push({
        ...line,
        type: 'context',
      });
    }
    
    // Clear buffer
    contextBuffer = [];
  };
  
  // Process the raw diff to create chunks with context
  for (let i = 0; i < rawDiff.length; i++) {
    const line = rawDiff[i];
    
    // If this is a changed line
    if (line.type === 'added' || line.type === 'removed' || line.type === 'modified') {
      if (!inChange) {
        // Starting a new change
        inChange = true;
        
        // Add buffered context
        addContextToChunk();
      }
      
      // Create chunk if needed
      if (!currentChunk) {
        currentChunk = { lines: [], additions: 0, deletions: 0 };
      }
      
      // Add the line to the current chunk
      currentChunk.lines.push(line);
      
      // Update statistics
      if (line.type === 'added') {
        currentChunk.additions++;
        totalAdditions++;
      } else if (line.type === 'removed') {
        currentChunk.deletions++;
        totalDeletions++;
      } else if (line.type === 'modified') {
        // Modified counts as both addition and deletion
        currentChunk.additions++;
        currentChunk.deletions++;
        totalAdditions++;
        totalDeletions++;
      }
    } else {
      // This is an unchanged line
      
      if (inChange) {
        // Buffer up to CONTEXT_LINES trailing context
        contextBuffer.push(line);
        
        // If we've buffered enough context or reached end, end the change
        if (contextBuffer.length >= CONTEXT_LINES || i === rawDiff.length - 1) {
          inChange = false;
          
          // Add trailing context
          addContextToChunk();
          
          // Finalize the chunk
          if (currentChunk && currentChunk.lines.length > 0) {
            chunks.push(currentChunk);
            currentChunk = null;
          }
          
          // Start buffering for next potential chunk
          contextBuffer = [];
        }
      } else {
        // Not in a change, buffer context for next potential change
        contextBuffer.push(line);
        if (contextBuffer.length > CONTEXT_LINES) {
          // Keep only the most recent context lines
          contextBuffer.shift();
        }
      }
    }
  }
  
  // Add any remaining chunk
  if (currentChunk && currentChunk.lines.length > 0) {
    chunks.push(currentChunk);
  }
  
  return { 
    chunks,
    stats: {
      additions: totalAdditions,
      deletions: totalDeletions,
      totalLeft: leftLines.length,
      totalRight: rightLines.length
    }
  };
}

export default diffAlgorithm; 