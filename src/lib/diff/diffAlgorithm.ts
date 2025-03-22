// Implementing a better diff algorithm to get closer to diffchecker.com results

import { diffLines, Change } from 'diff';

export interface DiffResult {
  lines: LineComparison[];
}

export interface LineComparison {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: {
    left: string;
    right: string;
  };
  lineNumber: {
    left: number | null;
    right: number | null;
  };
}

// Helper function to clean and split content into lines
function prepareContent(content: string): string[] {
  // Handle empty content
  if (!content.trim()) return [];
  
  // Split into lines, preserving empty lines
  return content.split('\n');
}

// Implement LCS (Longest Common Subsequence) algorithm
function findLCS(leftLines: string[], rightLines: string[]): number[][] {
  const m = leftLines.length;
  const n = rightLines.length;
  
  // Create a matrix of zeros
  const lcsMatrix: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  // Fill the LCS matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }
  
  return lcsMatrix;
}

// Reconstruct the diff from the LCS matrix
function reconstructDiff(leftLines: string[], rightLines: string[], lcsMatrix: number[][]): LineComparison[] {
  const result: LineComparison[] = [];
  let i = leftLines.length;
  let j = rightLines.length;
  
  const paired = new Set<number>();
  
  // First pass: pair up unchanged and modified lines
  while (i > 0 && j > 0) {
    if (leftLines[i - 1] === rightLines[j - 1]) {
      // Unchanged line - pair them together
      result.unshift({
        lineNumber: { left: i, right: j },
        content: { left: leftLines[i - 1], right: rightLines[j - 1] },
        type: 'unchanged'
      });
      paired.add(i - 1);
      paired.add(j - 1);
      i--;
      j--;
    } else if (lcsMatrix[i - 1][j] >= lcsMatrix[i][j - 1]) {
      // Removed line - will handle in second pass
      i--;
    } else {
      // Added line - will handle in second pass
      j--;
    }
  }
  
  // Second pass: add removed lines with right side blank
  for (let k = 0; k < leftLines.length; k++) {
    if (!paired.has(k)) {
      result.push({
        lineNumber: { left: k + 1, right: null },
        content: { left: leftLines[k], right: null },
        type: 'removed'
      });
    }
  }
  
  // Third pass: add added lines with left side blank
  for (let k = 0; k < rightLines.length; k++) {
    if (!paired.has(k)) {
      result.push({
        lineNumber: { left: null, right: k + 1 },
        content: { left: null, right: rightLines[k] },
        type: 'added'
      });
    }
  }
  
  // Sort by line number for proper display
  result.sort((a, b) => {
    const leftA = a.lineNumber.left || Number.MAX_SAFE_INTEGER;
    const leftB = b.lineNumber.left || Number.MAX_SAFE_INTEGER;
    if (leftA !== leftB) return leftA - leftB;
    
    const rightA = a.lineNumber.right || Number.MAX_SAFE_INTEGER;
    const rightB = b.lineNumber.right || Number.MAX_SAFE_INTEGER;
    return rightA - rightB;
  });
  
  return result;
}

function diffAlgorithm(leftText: string, rightText: string): DiffResult {
  // Handle empty input
  if (!leftText && !rightText) {
    return { lines: [] };
  }
  
  // Split into lines
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  
  // Perform line by line diff
  const diffs = diffLines(leftText, rightText);
  
  const result: LineComparison[] = [];
  let leftLineNumber = 1;
  let rightLineNumber = 1;
  
  // Improved algorithm to better align related lines
  diffs.forEach((diff) => {
    const lines = diff.value.split('\n');
    // Remove the last empty line that comes from split
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    
    if (diff.added) {
      // Added lines (only in right file)
      lines.forEach((line) => {
        result.push({
          type: 'added',
          content: {
            left: '',
            right: line,
          },
          lineNumber: {
            left: null,
            right: rightLineNumber++,
          },
        });
      });
    } else if (diff.removed) {
      // Store removed lines to check for possible modifications
      const removedLines = lines.map(line => ({
        type: 'removed',
        content: {
          left: line,
          right: '',
        },
        lineNumber: {
          left: leftLineNumber++,
          right: null,
        },
      }));
      
      // Check if next diff is an addition (possible modification)
      const nextDiff = diffs[diffs.indexOf(diff) + 1];
      if (nextDiff && nextDiff.added) {
        const addedLines = nextDiff.value.split('\n');
        if (addedLines[addedLines.length - 1] === '') {
          addedLines.pop();
        }
        
        // Handle case where we have the same number of lines removed and added
        // Treat them as modifications rather than separate remove/add operations
        if (removedLines.length === addedLines.length) {
          for (let i = 0; i < removedLines.length; i++) {
            result.push({
              type: 'modified',
              content: {
                left: removedLines[i].content.left,
                right: addedLines[i],
              },
              lineNumber: {
                left: removedLines[i].lineNumber.left,
                right: rightLineNumber++,
              },
            });
          }
          // Skip the next diff since we've already processed it
          diffs[diffs.indexOf(diff) + 1].added = false;
        } else {
          // Different number of lines, treat as separate operations
          result.push(...removedLines);
        }
      } else {
        // No corresponding addition, just removed lines
        result.push(...removedLines);
      }
    } else {
      // Unchanged lines
      lines.forEach((line) => {
        result.push({
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
      });
    }
  });
  
  return { lines: result };
}

export default diffAlgorithm; 