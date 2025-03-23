//code: src/lib/diff/diffAlgorithm.ts
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
 * 
 * For ABAP code, statements are pre-split by periods before being passed to this function
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
  
  // Pre-process the inputs to handle empty lines properly
  const { 
    processedLeftText, 
    processedRightText, 
    leftLineOffset, 
    rightLineOffset,
    originalLeftLines,
    originalRightLines
  } = preprocessInputs(leftText, rightText);
  
  // Split the processed content into lines
  const leftLines = processedLeftText.split('\n');
  const rightLines = processedRightText.split('\n');
  
  // Get the basic diff based on preprocessed content
  const lineDiffs = diffLines(processedLeftText, processedRightText);
  
  // Raw result before chunking
  const rawDiff: LineComparison[] = [];
  
  // Track line numbers - account for skipped leading empty lines
  let leftLineNumber = 1 + leftLineOffset;
  let rightLineNumber = 1 + rightLineOffset;
  
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
  // Reduced context lines to 0 for ABAP statements to ensure each statement is in its own chunk
  const CONTEXT_LINES = 0; 
  
  // Process the raw diff to create chunks with optimal grouping for ABAP
  processRawDiffIntoChunks(rawDiff, chunks);
  
  // Calculate total stats
  let totalAdditions = 0;
  let totalDeletions = 0;
  
  // Update stats
  for (const chunk of chunks) {
    totalAdditions += chunk.additions;
    totalDeletions += chunk.deletions;
  }
  
  return { 
    chunks,
    stats: {
      additions: totalAdditions,
      deletions: totalDeletions,
      totalLeft: originalLeftLines.length,
      totalRight: originalRightLines.length
    }
  };
}

/**
 * Preprocesses input texts to handle leading empty lines
 * This function strips leading empty lines and returns processed texts
 * along with information about the original line counts.
 */
function preprocessInputs(leftText: string, rightText: string) {
  // Split into lines
  const originalLeftLines = leftText.split('\n');
  const originalRightLines = rightText.split('\n');
  
  // Find first non-empty line in left text
  let leftLineOffset = 0;
  while (leftLineOffset < originalLeftLines.length && originalLeftLines[leftLineOffset].trim() === '') {
    leftLineOffset++;
  }
  
  // Find first non-empty line in right text
  let rightLineOffset = 0;
  while (rightLineOffset < originalRightLines.length && originalRightLines[rightLineOffset].trim() === '') {
    rightLineOffset++;
  }
  
  // Create processed texts without leading empty lines
  const processedLeftText = originalLeftLines.slice(leftLineOffset).join('\n');
  const processedRightText = originalRightLines.slice(rightLineOffset).join('\n');
  
  return {
    processedLeftText,
    processedRightText,
    leftLineOffset,
    rightLineOffset,
    originalLeftLines,
    originalRightLines
  };
}

/**
 * Process raw diff results into well-formed chunks
 * This is a completely rewritten chunk generator that properly handles ABAP statements
 */
function processRawDiffIntoChunks(rawDiff: LineComparison[], chunks: DiffChunk[]): void {
  if (rawDiff.length === 0) return;
  
  // Map to track which lines have been processed into chunks
  const processedLines = new Set<number>();
  
  // Process each line in the raw diff
  for (let i = 0; i < rawDiff.length; i++) {
    // Skip already processed lines
    if (processedLines.has(i)) continue;
    
    const line = rawDiff[i];
    
    // Check if this is a significant line that should start a new chunk
    if (line.type === 'added' || line.type === 'removed' || line.type === 'modified') {
      // Mark this line as processed
      processedLines.add(i);
      
      // Start a new chunk with this line
      const chunk: DiffChunk = { 
        lines: [line], 
        additions: line.type === 'added' || line.type === 'modified' ? 1 : 0,
        deletions: line.type === 'removed' || line.type === 'modified' ? 1 : 0
      };
      
      // Find all consecutive changed lines of the same type
      let currentIndex = i + 1;
      while (
        currentIndex < rawDiff.length && 
        (rawDiff[currentIndex].type === line.type ||
         // Add modified lines following the same addtions/removals
         (line.type === 'added' && rawDiff[currentIndex].type === 'modified') ||
         (line.type === 'removed' && rawDiff[currentIndex].type === 'modified') ||
         // Continue current chunk for mixed add/remove/modify
         (line.type === 'modified' && 
          (rawDiff[currentIndex].type === 'added' || rawDiff[currentIndex].type === 'removed'))
        )
      ) {
        // Add this line to the current chunk
        const currentLine = rawDiff[currentIndex];
        chunk.lines.push(currentLine);
        
        // Update the chunk's stats
        if (currentLine.type === 'added' || currentLine.type === 'modified') chunk.additions++;
        if (currentLine.type === 'removed' || currentLine.type === 'modified') chunk.deletions++;
        
        // Mark this line as processed
        processedLines.add(currentIndex);
        currentIndex++;
      }
      
      // Add the chunk to our result
      chunks.push(chunk);
    } else if (line.type === 'unchanged') {
      // For unchanged lines, check if it's an ABAP statement that should be its own chunk
      const content = line.content.left || '';
      const isAbapStatement = content.trim().length > 0;
      
      if (isAbapStatement) {
        const isKeywordLine = /^\s*(REPORT|DATA|CONSTANTS|TYPES|FORM|ENDFORM|METHOD|ENDMETHOD|CLASS|ENDCLASS|INTERFACE|ENDINTERFACE|FUNCTION|ENDFUNCTION|MODULE|ENDMODULE)\b/i.test(content);
        
        if (isKeywordLine) {
          // Create a chunk for this unchanged ABAP statement
          const chunk: DiffChunk = { 
            lines: [{ ...line, type: 'context' }], 
            additions: 0,
            deletions: 0
          };
          
          // Add all related lines that belong to this statement
          let currentIndex = i + 1;
          while (
            currentIndex < rawDiff.length && 
            rawDiff[currentIndex].type === 'unchanged' &&
            // Continue until we find another keyword or a period at the end of a line
            !(/^\s*(REPORT|DATA|CONSTANTS|TYPES|FORM|ENDFORM|METHOD|ENDMETHOD|CLASS|ENDCLASS|INTERFACE|ENDINTERFACE|FUNCTION|ENDFUNCTION|MODULE|ENDMODULE)\b/i.test(rawDiff[currentIndex].content.left || '')) &&
            !(/\.\s*$/.test(line.content.left || ''))
          ) {
            // Add this line to the current chunk
            const currentLine = rawDiff[currentIndex];
            chunk.lines.push({ ...currentLine, type: 'context' });
            
            // Mark this line as processed
            processedLines.add(currentIndex);
            currentIndex++;
          }
          
          // Mark the starting line as processed
          processedLines.add(i);
          
          // Add the chunk to our result if it has lines
          if (chunk.lines.length > 0) {
            chunks.push(chunk);
          }
        }
      }
    }
  }
  
  // Final pass: handle any unchanged lines that haven't been processed yet
  for (let i = 0; i < rawDiff.length; i++) {
    if (!processedLines.has(i) && rawDiff[i].type === 'unchanged') {
      // Create a chunk for these remaining unchanged lines
      const line = rawDiff[i];
      const chunk: DiffChunk = { 
        lines: [{ ...line, type: 'context' }], 
        additions: 0,
        deletions: 0
      };
      
      // Mark this line as processed
      processedLines.add(i);
      
      // Find consecutive unchanged lines
      let j = i + 1;
      while (j < rawDiff.length && !processedLines.has(j) && rawDiff[j].type === 'unchanged') {
        chunk.lines.push({ ...rawDiff[j], type: 'context' });
        processedLines.add(j);
        j++;
      }
      
      // Add the chunk to our result if it has lines
      if (chunk.lines.length > 0) {
        chunks.push(chunk);
      }
    }
  }
}

export default diffAlgorithm; 