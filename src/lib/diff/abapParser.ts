/**
 * Utility functions for parsing ABAP code
 */

/**
 * Splits ABAP code into individual statements by periods
 * This ensures each ABAP statement is treated as a separate line in the diff
 * 
 * Handles special cases:
 * - Doesn't split periods inside string literals ('...' or "...")
 * - Ignores periods in comment lines
 * - Preserves existing newlines
 */
export function splitAbapStatements(abapCode: string): string {
  if (!abapCode) return '';
  
  let result = '';
  let inString = false;
  let stringChar: string | null = null; // ' or "
  let inComment = false;
  
  for (let i = 0; i < abapCode.length; i++) {
    const char = abapCode[i];
    const nextChar = abapCode[i + 1] || '';
    
    // Check for comment line start
    if (char === '*' && (i === 0 || abapCode[i - 1] === '\n')) {
      inComment = true;
    }
    
    // Check for end of line which also ends comments
    if (char === '\n') {
      inComment = false;
    }
    
    // Toggle string states (only if not in a comment)
    if (!inComment && !inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && nextChar !== stringChar) {
      // Handle string end (but not double quotes like '')
      inString = false;
      stringChar = null;
    }
    
    result += char;
    
    // If we see a period and we're not in a string or comment, add newline if needed
    if (char === '.' && !inString && !inComment) {
      // Look ahead for whitespace or end of file
      if (/\s/.test(nextChar) || nextChar === '') {
        // Only add newline if there isn't already one coming
        if (nextChar !== '\n') {
          result += '\n';
        }
      }
    }
  }
  
  return result;
}

/**
 * Normalizes line endings in ABAP code
 * Ensures consistent line endings across platforms
 */
export function normalizeLineEndings(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
} 