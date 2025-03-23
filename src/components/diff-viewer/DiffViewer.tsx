//code: src/components/diff-viewer/DiffViewer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { DiffResult, LineComparison, DiffChunk } from '@/lib/diff/diffAlgorithm';
import { useMonaco } from '@monaco-editor/react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs.css';
import 'highlight.js/styles/github.css';
// Import popular programming languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
// Add diff-match-patch for word-level diff
import { diff_match_patch } from 'diff-match-patch';

// Custom ABAP syntax for highlight.js
hljs.registerLanguage('abap', function(hljs) {
  return {
    name: 'ABAP',
    case_insensitive: true,
    keywords: {
      keyword:
      'REPORT DATA TYPE TABLE OF SELECT FROM INTO UP TO ROWS ' +
               'LOOP AT ENDLOOP IF ENDIF WRITE ENDMETHOD CALL FUNCTION ' +
               'METHOD IMPORTING EXPORTING CHANGING FORM ENDFORM PERFORM ' +
      'CLEAR FIELD-SYMBOLS FIELD SYMBOLS ASSIGN CP EQ NE GT LT GE LE VALUE CONSTANTS ' +
      'CLASS ENDCLASS TRY CATCH ENDTRY FIELD-SYMBOLS DEFINITION RETURNING ' +
      'METHODS IMPLEMENTATION USING ELSE PUBLIC FINAL CREATE ' +
      'INSERT UPDATE DELETE MODIFY COMMIT ROLLBACK WHERE ORDER BY START' +
      'GROUP BY HAVING JOIN INNER LEFT OUTER RIGHT FULL ON CREATE OBJECT ' +
      'START-OF-SELECTION END-OF-SELECTION AT SELECTION-SCREEN USER-COMMAND ' +
      'ABAP_SYSTEM_TIMEZONE ABAP_USER_TIMEZONE ABAP-SOURCE ABBREVIATED ABS ' +
      'ABSTRACT ACCEPT ACCEPTING ACCORDING ACTIVATION ACTUAL ADABAS ADD ADD-CORRESPONDING ADJACENT ' +
      'AFTER ALIAS ALIASES ALIGN ALL ALLOCATE ALPHA ANALYSIS ANALYZER AND ' +
      'ANNOTATE ANY APPEND APPENDAGE APPENDING APPLICATION ARCHIVE AREA ARITHMETIC AS ' +
      'AS400 ASCENDING ASPECT ASSERT ASSIGN ASSIGNED ASSIGNING ASSOCIATION ASYNCHRONOUS AT ' +
      'ATTRIBUTES AUTHORITY AUTHORITY-CHECK AVG AVG, BACK BACKGROUND BACKUP BACKWARD BADI ' +
      'BASE BEFORE BEGIN BETWEEN BIG BINARY BINTOHEX BIT BIT-AND BIT-NOT BIT-OR BIT-XOR BLACK ' +
      'BLANK BLANKS BLOB BLOCK BLOCKS BLUE BOUND BOUNDARIES BOUNDS BOXED BREAK-POINT BT ' +
      'BUFFER BY BYPASSING BYTE BYTE-CA BYTE-CN BYTE-CO BYTE-CS BYTE-NA BYTE-NS BYTE-ORDER CA ' +
      'CALL CALLING CASE CAST CASTING CATCH CEIL CENTER CENTERED CHAIN CHAIN-INPUT CHAIN-REQUEST ' +
      'CHANGE CHANGING CHANNELS CHAR CHAR-TO-HEX CHARACTER CHECK CHECKBOX CI_ CIRCULAR CLASS ' +
      'CLASS-CODING CLASS-DATA CLASS-EVENTS CLASS-METHODS CLASS-POOL CLEANUP CLEAR CLIENT CLNT ' +
      'CLOB CLOCK CLOSE CN CO COALESCE CODE CODING COL_BACKGROUND COL_GROUP COL_HEADING COL_KEY ' +
      'COL_NEGATIVE COL_NORMAL COL_POSITIVE COL_TOTAL COLLECT COLOR COLUMN COLUMNS COMMENT COMMENTS ' +
      'COMMIT COMMON COMMUNICATION COMPARING COMPONENT COMPONENTS COMPRESSION COMPUTE CONCAT ' +
      'CONCAT_WITH_SPACE CONCATENATE COND CONDENSE CONDITION CONNECT CONNECTION CONSTANTS CONTEXT ' +
      'CONTEXTS CONTINUE CONTROL CONTROLS CONV CONVERSION CONVERT COPIES COPY CORRESPONDING COUNT ' +
      'COUNTRY COVER CP CPI CREATE CREATING CRITICAL CROSS CS CUKY CURR CURRENCY CURRENCY_CONVERSION ' +
      'CURRENT CURSOR CURSOR-SELECTION CUSTOMER CUSTOMER-FUNCTION DANGEROUS DATA DATABASE DATAINFO ' +
      'DATASET DATE DATS DATS_ADD_DAYS DATS_ADD_MONTHS DATS_DAYS_BETWEEN DATS_IS_VALID DATS_TIMS_TO_TSTMP ' +
      'DAYLIGHT DB2 DB6 DD/MM/YY DD/MM/YYYY DDMMYY DEALLOCATE DEC DECIMAL_SHIFT DECIMALS ' +
      'DECLARATIONS DEEP DEFAULT DEFERRED DEFINE DEFINING DEFINITION DELETE DELETING DEMAND ' +
      'DEPARTMENT DESCENDING DESCRIBE DESTINATION DETAIL DIALOG DIRECTORY DISCARDING DISCONNECT ' +
      'DISPLAY DISPLAY-MODE DISTANCE DISTINCT DIV DIVIDE DIVIDE-CORRESPONDING DIVISION DO DUMMY ' +
      'DUPLICATE DUPLICATES DURATION DURING DYNAMIC DYNPRO E EDIT EDITOR-CALL ELSE ELSEIF EMPTY ' +
      'ENABLED ENABLING ENCODING END END-ENHANCEMENT-SECTION END-LINES END-OF-DEFINITION END-OF-FILE ' +
      'END-OF-PAGE END-OF-SELECTION END-TEST-INJECTION END-TEST-SEAM ENDAT ENDCASE ENDCATCH ENDCHAIN ' +
      'ENDCLASS ENDDO ENDENHANCEMENT ENDEXEC ENDFORM ENDFUNCTION ENDIAN ENDIF ENDING ENDINTERFACE ' +
      'ENDLOOP ENDMETHOD ENDMODULE ENDON ENDPROVIDE ENDSELECT ENDTRY ENDWHILE ENDWITH ENGINEERING ' +
      'ENHANCEMENT ENHANCEMENT-POINT ENHANCEMENT-SECTION ENHANCEMENTS ENTRIES ENTRY ENUM ENVIRONMENT ' +
      'EQ EQUIV ERRORMESSAGE ERRORS ESCAPE ESCAPING EVENT EVENTS EXACT EXCEPT EXCEPTION ' +
      'EXCEPTION-TABLE EXCEPTIONS EXCLUDE EXCLUDING EXEC EXECUTE EXISTS EXIT EXIT-COMMAND EXPAND ' +
      'EXPANDING EXPIRATION EXPLICIT EXPONENT EXPORT EXPORTING EXTEND EXTENDED EXTENSION EXTRACT ' +
      'FAIL FETCH FIELD FIELD-GROUPS FIELD-SYMBOL FIELD-SYMBOLS FIELDS FILE FILTER FILTER-TABLE ' +
      'FILTERS FINAL FIND FIRST FIRST-LINE FIXED-POINT FKEQ FKGE FLOOR FLTP FLTP_TO_DEC FLUSH ' +
      'FONT FOR FORM FORMAT FORWARD FOUND FRAME FRAMES FREE FRIENDS FROM FUNCTION FUNCTION-POOL ' +
      'FUNCTIONALITY FURTHER GAPS GE GENERATE GET GIVING GKEQ GKGE GLOBAL GRANT GREEN GROUP GROUPS ' +
      'GT HANDLE HANDLER HARMLESS HASHED HAVING HDB HEAD-LINES HEADER HEADERS HEADING HELP-ID ' +
      'HELP-REQUEST HEXTOBIN HIDE HIGH HINT HOLD HOTSPOT I ICON ID IDENTIFICATION IDENTIFIER IDS ' +
      'IF IGNORE IGNORING IMMEDIATELY IMPLEMENTATION IMPLEMENTATIONS IMPLEMENTED IMPLICIT IMPORT ' +
      'IMPORTING IN INACTIVE INCL INCLUDE INCLUDES INCLUDING INCREMENT INDEX INDEX-LINE INFOTYPES ' +
      'INHERIT INHERITING INIT INITIAL INITIALIZATION INNER INOUT *-INPUT INPUT INSERT INSTANCE ' +
      'INSTANCES INSTR INT1 INT2 INT4 INT8 INTENSIFIED INTERFACE INTERFACE-POOL INTERFACES ' +
      'INTERNAL INTERVALS INTO INVERSE INVERTED-DATE IS ISO ITNO JOB JOIN KEEP KEEPING KERNEL ' +
      'KEY KEYS KEYWORDS KIND LANG LANGUAGE LAST LATE LAYOUT LE LEADING LEAVE LEFT LEFT-JUSTIFIED ' +
      'LEFTPLUS LEFTSPACE LEGACY LENGTH LET LEVEL LEVELS LIKE LINE LINE-COUNT LINE-SELECTION ' +
      'LINE-SIZE LINEFEED LINES LIST LIST-PROCESSING LISTBOX LITTLE LLANG LOAD LOAD-OF-PROGRAM ' +
      'LOB LOCAL LOCALE LOCATOR LOG-POINT LOGFILE LOGICAL LONG LOOP LOW LOWER LPAD LPI LT LTRIM M ' +
      'MAIL MAIN MAJOR-ID MAPPING MARGIN MARK MASK MATCH MATCHCODE MAX MAXIMUM MEDIUM MEMBERS MEMORY ' +
      'MESH MESSAGE MESSAGE-ID MESSAGES MESSAGING METHOD METHODS MIN MINIMUM MINOR-ID MM/DD/YY ' +
      'MM/DD/YYYY MMDDYY MOD MODE MODIF MODIFIER MODIFY MODULE MOVE MOVE-CORRESPONDING MSSQLNT ' +
      'MULTIPLY MULTIPLY-CORRESPONDING NA NAME NAMETAB NATIVE NB NE NESTED NESTING NEW NEW-LINE ' +
      'NEW-PAGE NEW-SECTION NEXT NO NO-DISPLAY NO-EXTENSION NO-GAP NO-GAPS NO-GROUPING NO-HEADING ' +
      'NO-SCROLLING NO-SIGN NO-TITLE NO-TOPOFPAGE NO-ZERO NODE NODES NON-UNICODE NON-UNIQUE NOT ' +
      'NP NS NULL NUMBER NUMC O OBJECT OBJECTS OBLIGATORY OCCURRENCE OCCURRENCES OCCURS OF OFF ' +
      'OFFSET OLE ON ONLY OPEN OPTION OPTIONAL OPTIONS OR ORACLE ORDER OTHER OTHERS OUT OUTER ' +
      'OUTPUT OUTPUT-LENGTH OVERFLOW OVERLAY PACK PACKAGE PAD PADDING PAGE PAGES PARAMETER ' +
      'PARAMETER-TABLE PARAMETERS PART PARTIALLY PATTERN PERCENTAGE PERFORM PERFORMING PERSON PF ' +
      'PF-STATUS PINK PLACES POOL POS_HIGH POS_LOW POSITION PRAGMAS PRECOMPILED PREFERRED ' +
      'PRESERVING PRIMARY PRINT PRINT-CONTROL PRIORITY PRIVATE PROCEDURE PROCESS PROGRAM ' +
      'PROPERTY PROTECTED PROVIDE PUBLIC PUSH PUSHBUTTON PUT QUAN QUEUE-ONLY QUICKINFO ' +
      'RADIOBUTTON RAISE RAISING RANGE RANGES RAW READ READ-ONLY READER RECEIVE RECEIVED ' +
      'RECEIVER RECEIVING RED REDEFINITION REDUCE REDUCED REF REFERENCE REFRESH REGEX REJECT ' +
      'REMOTE RENAMING REPLACE REPLACEMENT REPLACING REPORT REQUEST REQUESTED RESERVE RESET ' +
      'RESOLUTION RESPECTING RESPONSIBLE RESULT RESULTS RESUMABLE RESUME RETRY RETURN RETURNCODE ' +
      'RETURNING RETURNS RIGHT RIGHT-JUSTIFIED RIGHTPLUS RIGHTSPACE RISK RMC_COMMUNICATION_FAILURE ' +
      'RMC_INVALID_STATUS RMC_SYSTEM_FAILURE ROLE ROLLBACK ROUND ROWS RPAD RTRIM RUN SAP SAP-SPOOL ' +
      'SAVING SCALE_PRESERVING SCALE_PRESERVING_SCIENTIFIC SCAN SCIENTIFIC SCIENTIFIC_WITH_LEADING_ZERO ' +
      'SCREEN SCROLL SCROLL-BOUNDARY SCROLLING SEARCH SECONDARY SECONDS SECTION SELECT SELECT-OPTIONS ' +
      'SELECTION SELECTION-SCREEN SELECTION-SET SELECTION-SETS SELECTION-TABLE SELECTIONS SEND ' +
      'SEPARATE SEPARATED SET SHARED SHIFT SHORT SHORTDUMP-ID SIGN SIGN_AS_POSTFIX SIMPLE SINGLE SIZE ' +
      'SKIP SKIPPING SMART SOME SORT SORTABLE SORTED SOURCE SPACE SPECIFIED SPLIT SPOOL SPOTS SQL ' +
      'SQLSCRIPT SSTRING STABLE STAMP STANDARD START-OF-SELECTION STARTING STATE STATEMENT ' +
      'STATEMENTS STATIC STATICS STATUSINFO STEP-LOOP STOP STRUCTURE STRUCTURES STYLE ' +
      'SUBKEY SUBMATCHES SUBMIT SUBROUTINE SUBSCREEN SUBSTRING SUBTRACT SUBTRACT-CORRESPONDING ' +
      'SUFFIX SUM SUMMARY SUMMING SUPPLIED SUPPLY SUPPRESS SWITCH SWITCHSTATES SYBASE SYMBOL ' +
      'SYNCPOINTS SYNTAX SYNTAX-CHECK SYNTAX-TRACE SYSTEM-CALL SYSTEM-EXCEPTIONS SYSTEM-EXIT ' +
      'TAB TABBED TABLE TABLES TABLEVIEW TABSTRIP TARGET TASK TASKS TEST TEST-INJECTION ' +
      'TEST-SEAM TESTING TEXT TEXTPOOL THEN THROW TIME TIMES TIMESTAMP TIMEZONE TIMS TIMS_IS_VALID ' +
      'TITLE TITLE-LINES TITLEBAR ?TO TO TOKENIZATION TOKENS TOP-LINES TOP-OF-PAGE TRACE-FILE ' +
      'TRACE-TABLE TRAILING TRANSACTION TRANSFER TRANSFORMATION TRANSLATE TRANSPORTING TRMAC ' +
      'TRUNCATE TRUNCATION TRY TSTMP_ADD_SECONDS TSTMP_CURRENT_UTCTIMESTAMP TSTMP_IS_VALID ' +
      'TSTMP_SECONDS_BETWEEN TSTMP_TO_DATS TSTMP_TO_DST TSTMP_TO_TIMS TYPE TYPE-POOL TYPE-POOLS ' +
      'TYPES ULINE UNASSIGN UNDER UNICODE UNION UNIQUE UNIT UNIT_CONVERSION UNIX UNPACK UNTIL ' +
      'UNWIND UP UPDATE UPPER USER USER-COMMAND USING UTF-8 VALID VALUE VALUE-REQUEST VALUES ' +
      'VARIANT VARY VARYING VERIFICATION-MESSAGE VERSION VIA VIEW VISIBLE WAIT WARNING WHEN ' +
      'WHENEVER WHERE WHILE WIDTH WINDOW WINDOWS WITH WITH-HEADING WITH-TITLE WITHOUT WORD ' +
      'WORK WRITE WRITER XML XSD YELLOW YES YYMMDD Z ZERO ZONE',
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

// Register languages for syntax highlighting
// After the ABAP language registration
// Register common programming languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('html', xml); // XML handles HTML
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);

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
    if (!sortedChunks) return;
    
    const chunk = sortedChunks[chunkIndex];
    if (!chunk) return;
    
    // Get all the lines from this chunk that exist in the left side
    // Include empty lines by checking for null specifically, not empty strings
    const leftLines = chunk.lines
      .filter(line => line.content.left !== null) // Keep empty strings, only filter out null
      .map(line => line.content.left as string);
    
    // If there are no lines to merge (all null), return early
    if (leftLines.length === 0) return;
    
    // Special handling for leading empty lines chunk
    const isLeadingEmptyLinesChunk = chunk.lines.every(line => 
      (line.lineNumber.left === 1 || line.lineNumber.right === 1) && 
      (line.content.left === '' || line.content.right === '')
    );
    
    // Get line numbers to determine where to insert in the right content
    const lineNumbers = chunk.lines
      .filter(line => line.lineNumber.right !== null)
      .map(line => line.lineNumber.right as number);
    
    // Determine the insertion point in the right content
    let rightLines = rightContent.split('\n');
    
    // Handle leading empty lines specially
    if (isLeadingEmptyLinesChunk) {
      // For leading empty lines, we want to either add or remove them
      // from the beginning of the file
      const targetEmptyLineCount = leftLines.length;
      
      // Count existing empty lines at beginning of right content
      let existingEmptyLines = 0;
      while (existingEmptyLines < rightLines.length && rightLines[existingEmptyLines].trim() === '') {
        existingEmptyLines++;
      }
      
      // Remove existing empty lines
      if (existingEmptyLines > 0) {
        rightLines.splice(0, existingEmptyLines);
      }
      
      // Add the correct number of empty lines from left
      if (targetEmptyLineCount > 0) {
        rightLines.unshift(...Array(targetEmptyLineCount).fill(''));
      }
    }
    // Regular handling for non-leading empty line chunks
    else if (lineNumbers.length > 0) {
      // Sort and get the first and last line numbers
      const sortedLineNumbers = [...lineNumbers];
      sortedLineNumbers.sort((a, b) => a - b);
      
      const firstLine = sortedLineNumbers[0];
      const lastLine = sortedLineNumbers[sortedLineNumbers.length - 1];
      
      // Replace the lines in the right content
      if (firstLine !== undefined && lastLine !== undefined) {
        // Make sure we've captured all lines intended to be replaced on the right side
        const actualLastLine = chunk.lines.reduce((maxLine, line) => {
          if (line.lineNumber.right !== null && line.lineNumber.right > maxLine) {
            return line.lineNumber.right;
          }
          return maxLine;
        }, lastLine);
        
        // Remove the lines that will be replaced (convert from 1-indexed to 0-indexed)
        rightLines.splice(firstLine - 1, actualLastLine - firstLine + 1);
        
        // Insert the left lines at the position of the first line
        rightLines.splice(firstLine - 1, 0, ...leftLines);
      } else {
        // If there's no clear position, append to the end
        rightLines.push(...leftLines);
      }
    } else {
      // SPECIAL CASE: Handle lines that only exist on the left side (no right line numbers)
      // Find adjacent line numbers to determine insertion point
      
      // First try to find the previous chunk with line numbers on the right 
      let insertPosition = rightLines.length; // Default to end of file
      
      // Look at the chunk index to determine where this chunk should go relative to others
      const currentChunkIndex = sortedChunks.indexOf(chunk);
      
      if (currentChunkIndex > 0) {
        // Look at previous chunks to find a reference point
        for (let i = currentChunkIndex - 1; i >= 0; i--) {
          const prevChunk = sortedChunks[i];
          const lastLineOfPrevChunk = prevChunk.lines[prevChunk.lines.length - 1];
          
          if (lastLineOfPrevChunk.lineNumber.right !== null) {
            // Found a previous chunk with line numbers, insert after its last line
            insertPosition = lastLineOfPrevChunk.lineNumber.right;
            break;
          }
        }
      }
      
      // If we found a reference point, use it for insertion
      if (insertPosition > 0 && insertPosition <= rightLines.length) {
        rightLines.splice(insertPosition, 0, ...leftLines);
      } else {
        // Look for the next chunk to determine position
        for (let i = currentChunkIndex + 1; i < sortedChunks.length; i++) {
          const nextChunk = sortedChunks[i];
          const firstLineOfNextChunk = nextChunk.lines[0];
          
          if (firstLineOfNextChunk.lineNumber.right !== null) {
            // Found a following chunk with line numbers, insert before its first line
            insertPosition = firstLineOfNextChunk.lineNumber.right - 1;
            if (insertPosition <= 0) insertPosition = 0;
            break;
          }
        }
        
        // Insert at the determined position
        rightLines.splice(insertPosition, 0, ...leftLines);
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
    if (!sortedChunks) return;
    
    const chunk = sortedChunks[chunkIndex];
    if (!chunk) return;
    
    // Get all the lines from this chunk that exist in the right side
    // Include empty lines by checking for null specifically, not empty strings
    const rightLines = chunk.lines
      .filter(line => line.content.right !== null) // Keep empty strings, only filter out null
      .map(line => line.content.right as string);
    
    // If there are no lines to merge (all null), return early
    if (rightLines.length === 0) return;
    
    // Special handling for leading empty lines chunk
    const isLeadingEmptyLinesChunk = chunk.lines.every(line => 
      (line.lineNumber.left === 1 || line.lineNumber.right === 1) && 
      (line.content.left === '' || line.content.right === '')
    );
    
    // Get line numbers to determine where to insert in the left content
    const lineNumbers = chunk.lines
      .filter(line => line.lineNumber.left !== null)
      .map(line => line.lineNumber.left as number);
    
    // Determine the insertion point in the left content
    let leftLines = leftContent.split('\n');
    
    // Handle leading empty lines specially
    if (isLeadingEmptyLinesChunk) {
      // For leading empty lines, we want to either add or remove them
      // from the beginning of the file
      const targetEmptyLineCount = rightLines.length;
      
      // Count existing empty lines at beginning of left content
      let existingEmptyLines = 0;
      while (existingEmptyLines < leftLines.length && leftLines[existingEmptyLines].trim() === '') {
        existingEmptyLines++;
      }
      
      // Remove existing empty lines
      if (existingEmptyLines > 0) {
        leftLines.splice(0, existingEmptyLines);
      }
      
      // Add the correct number of empty lines from right
      if (targetEmptyLineCount > 0) {
        leftLines.unshift(...Array(targetEmptyLineCount).fill(''));
      }
    }
    // Regular handling for non-leading empty line chunks
    else if (lineNumbers.length > 0) {
      // Sort and get the first and last line numbers
      const sortedLineNumbers = [...lineNumbers];
      sortedLineNumbers.sort((a, b) => a - b);
      
      const firstLine = sortedLineNumbers[0];
      const lastLine = sortedLineNumbers[sortedLineNumbers.length - 1];
      
      // Replace the lines in the left content
      if (firstLine !== undefined && lastLine !== undefined) {
        // Make sure we've captured all lines intended to be replaced on the left side
        const actualLastLine = chunk.lines.reduce((maxLine, line) => {
          if (line.lineNumber.left !== null && line.lineNumber.left > maxLine) {
            return line.lineNumber.left;
          }
          return maxLine;
        }, lastLine);
        
        // Remove the lines that will be replaced (convert from 1-indexed to 0-indexed)
        leftLines.splice(firstLine - 1, actualLastLine - firstLine + 1);
        
        // Insert the right lines at the position of the first line
        leftLines.splice(firstLine - 1, 0, ...rightLines);
      } else {
        // If there's no clear position, append to the end
        leftLines.push(...rightLines);
      }
    } else {
      // SPECIAL CASE: Handle lines that only exist on the right side (no left line numbers)
      // Find adjacent line numbers to determine insertion point
      
      // First try to find the previous chunk with line numbers on the left
      let insertPosition = leftLines.length; // Default to end of file
      
      // Look at the chunk index to determine where this chunk should go relative to others
      const currentChunkIndex = sortedChunks.indexOf(chunk);
      
      if (currentChunkIndex > 0) {
        // Look at previous chunks to find a reference point
        for (let i = currentChunkIndex - 1; i >= 0; i--) {
          const prevChunk = sortedChunks[i];
          const lastLineOfPrevChunk = prevChunk.lines[prevChunk.lines.length - 1];
          
          if (lastLineOfPrevChunk.lineNumber.left !== null) {
            // Found a previous chunk with line numbers, insert after its last line
            insertPosition = lastLineOfPrevChunk.lineNumber.left;
            break;
          }
        }
      }
      
      // If we found a reference point, use it for insertion
      if (insertPosition > 0 && insertPosition <= leftLines.length) {
        leftLines.splice(insertPosition, 0, ...rightLines);
      } else {
        // Look for the next chunk to determine position
        for (let i = currentChunkIndex + 1; i < sortedChunks.length; i++) {
          const nextChunk = sortedChunks[i];
          const firstLineOfNextChunk = nextChunk.lines[0];
          
          if (firstLineOfNextChunk.lineNumber.left !== null) {
            // Found a following chunk with line numbers, insert before its first line
            insertPosition = firstLineOfNextChunk.lineNumber.left - 1;
            if (insertPosition <= 0) insertPosition = 0;
            break;
          }
        }
        
        // Insert at the determined position
        leftLines.splice(insertPosition, 0, ...rightLines);
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
        // Show feedback toast
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5';
        notification.textContent = 'Copied to clipboard!';
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
          notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 2000);
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
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden h-full flex flex-col shadow-sm transition-all">
      {/* Header with summary and controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200">
        <div className="flex items-center space-x-5">
          {!hasChanges ? (
            <div className="text-indigo-600 font-medium text-base flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Files are identical
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                <span className="text-emerald-700 font-medium text-base">{diffResult.stats.additions} additions</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                <span className="text-rose-700 font-medium text-base">{diffResult.stats.deletions} deletions</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Navigation controls - always visible when there are changes */}
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-zinc-600 hidden md:block">
                {selectedChunk !== null ? `Change ${selectedChunk + 1} of ${diffResult.chunks.filter(chunk => chunkHasDifferences(chunk)).length}` : ''}
              </div>
              <button 
                onClick={navigatePrevChunk}
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md flex items-center transition-colors font-medium"
                aria-label="Previous change"
                disabled={!hasChanges}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
                Prev
              </button>
              <button 
                onClick={navigateNextChunk}
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md flex items-center transition-colors font-medium"
                aria-label="Next change"
                disabled={!hasChanges}
                type="button"
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
              className={`px-3 py-1.5 text-sm rounded-md flex items-center transition-colors ${
                canUndo 
                  ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200' 
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-70'
              }`}
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo last change"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
              </svg>
              Undo
            </button>
            
            {/* Redo button */}
            <button
              className={`px-3 py-1.5 text-sm rounded-md flex items-center transition-colors ${
                canRedo 
                  ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200' 
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-70'
              }`}
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo last undone change"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.207 2.232a.75.75 0 00.025 1.06L16.378 7.25H6.375a5.375 5.375 0 000 10.75h2.875a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.06.025z" clipRule="evenodd" />
              </svg>
              Redo
            </button>
            
            {/* Reset button */}
        <button
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
              onClick={handleReset}
              type="button"
        >
          Reset Comparison
        </button>
          </div>
        </div>
      </div>
      
      {/* File headers with copy buttons */}
      <div className="flex bg-zinc-50 text-zinc-700 text-sm border-b border-zinc-200">
        <div className="w-1/2 py-2 px-4 font-medium border-r border-zinc-200 text-zinc-800 flex justify-between items-center">
          <span>Original</span>
          <div className="flex items-center">
            <span className="text-xs text-zinc-500 mr-2">{diffResult.stats.totalLeft} lines</span>
            <button 
              onClick={copyLeftContent}
              className="px-3 py-1.5 text-sm bg-zinc-200 hover:bg-zinc-300 rounded-md transition-colors flex items-center space-x-1 active:scale-95 active:bg-indigo-100 transform duration-75"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              <span>Copy</span>
            </button>
          </div>
        </div>
        <div className="w-1/2 py-2 px-4 font-medium text-zinc-800 flex justify-between items-center">
          <span>Modified</span>
          <div className="flex items-center">
            <span className="text-xs text-zinc-500 mr-2">{diffResult.stats.totalRight} lines</span>
            <button 
              onClick={copyRightContent}
              className="px-3 py-1.5 text-sm bg-zinc-200 hover:bg-zinc-300 rounded-md transition-colors flex items-center space-x-1 active:scale-95 active:bg-indigo-100 transform duration-75"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content with diffs */}
      <div className="relative flex-grow flex overflow-hidden">
        {/* Left pane */}
        <div 
          ref={leftPaneRef}
          className="w-1/2 overflow-auto border-r border-zinc-200"
          style={{ height: '100%' }}
        >
          {sortedChunks.map((chunk, chunkIndex) => {
            const hasDifferences = chunkHasDifferences(chunk);
            
            return hasDifferences ? (
              <div 
                key={`chunk-left-${chunkIndex}`}
                ref={(el) => { chunkRefs.current[chunkIndex] = el; }}
                className={`relative transition-all duration-200 ${
                  selectedChunk === chunkIndex 
                    ? 'ring-2 ring-indigo-500 shadow-lg z-10 bg-white before:absolute before:inset-0 before:bg-indigo-100/30 before:z-[-1] before:blur-sm before:rounded-lg before:opacity-60' 
                    : `${selectedChunk !== null ? 'opacity-80' : ''} hover:opacity-100`
                } ${chunkIndex > 0 ? 'border-t border-zinc-200' : ''}`}
                onClick={hasDifferences ? () => handleChunkClick(chunkIndex) : undefined}
              >
                {/* Selection indicator bar */}
                {selectedChunk === chunkIndex && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500 animate-pulse-subtle"></div>
                )}

                {/* Chunk header - only show for chunks with differences */}
                <div 
                  className={`bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 flex justify-between items-center ${
                    selectedChunk === chunkIndex 
                      ? 'bg-gradient-to-r from-zinc-100 to-zinc-50 cursor-pointer border-b border-zinc-200' 
                      : ''
                  }`}
                  onDoubleClick={(e) => {
                    // Only trigger if this chunk is already selected
                    if (selectedChunk === chunkIndex) {
                      e.stopPropagation();
                      mergeLeftToRight(chunkIndex);
                    }
                  }}
                  title={selectedChunk === chunkIndex ? "Double-click to merge to right" : ""}
                >
                  <span className={`${selectedChunk === chunkIndex ? 'text-rose-600 font-medium text-sm px-2 py-0.5 bg-rose-50 rounded-full' : 'text-rose-600 font-medium'}`}>
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
                        className="px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600 rounded-md transition-all duration-300 shadow-sm flex items-center font-medium group animate-fade-in"
                        type="button"
                      >
                        Merge to right
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Chunk content */}
                <div
                  onDoubleClick={(e) => {
                    // Only trigger if this chunk is already selected
                    if (selectedChunk === chunkIndex) {
                      e.stopPropagation();
                      mergeLeftToRight(chunkIndex);
                    }
                  }}
                  className={selectedChunk === chunkIndex ? 'cursor-pointer' : ''}
                  title={selectedChunk === chunkIndex ? "Double-click to merge to right" : ""}
                >
                  {chunk.lines.map((line, lineIndex) => (
                    <div 
                      key={`line-left-${chunkIndex}-${lineIndex}`}
                      className={`flex ${getLineClass(line.type, 'left')} cursor-pointer`}
                    >
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-zinc-500 select-none border-r border-zinc-200 bg-zinc-50 text-xs">
                  {line.lineNumber.left || ' '}
                </div>
                <div className="w-full overflow-x-auto">
                  {line.content.left ? (
                    <CodeLine 
                      content={line.content.left} 
                            language="auto"
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
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-zinc-500 select-none border-r border-zinc-200 bg-zinc-50 text-xs">
                        {line.lineNumber.left || ' '}
                      </div>
                      <div className="w-full overflow-x-auto">
                        {line.content.left ? (
                          <CodeLine 
                            content={line.content.left} 
                            language="auto"
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
                className={`relative transition-all duration-200 ${
                  selectedChunk === chunkIndex 
                    ? 'ring-2 ring-indigo-500 shadow-lg z-10 bg-white before:absolute before:inset-0 before:bg-indigo-100/30 before:z-[-1] before:blur-sm before:rounded-lg before:opacity-60' 
                    : `${selectedChunk !== null ? 'opacity-80' : ''} hover:opacity-100`
                } ${chunkIndex > 0 ? 'border-t border-zinc-200' : ''}`}
                onClick={hasDifferences ? () => handleChunkClick(chunkIndex) : undefined}
              >
                {/* Selection indicator bar */}
                {selectedChunk === chunkIndex && (
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500 animate-pulse-subtle"></div>
                )}

                {/* Chunk header - only show for chunks with differences */}
                <div 
                  className={`bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 flex justify-between items-center ${
                    selectedChunk === chunkIndex 
                      ? 'bg-gradient-to-r from-zinc-50 to-zinc-100 cursor-pointer border-b border-zinc-200' 
                      : ''
                  }`}
                  onDoubleClick={(e) => {
                    // Only trigger if this chunk is already selected
                    if (selectedChunk === chunkIndex) {
                      e.stopPropagation();
                      mergeRightToLeft(chunkIndex);
                    }
                  }}
                  title={selectedChunk === chunkIndex ? "Double-click to merge to left" : ""}
                >
                  {/* Merge controls - visible only when chunk is selected - moved to the left */}
                  {selectedChunk === chunkIndex ? (
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeRightToLeft(chunkIndex);
                        }}
                        className="px-3 py-2 text-sm bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-all duration-300 shadow-sm flex items-center font-medium group animate-fade-in"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform">
                          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                        </svg>
                        Merge to left
                      </button>
                    </div>
                  ) : (
                    <div></div> /* Empty div to maintain flex spacing when button isn't shown */
                  )}
                  
                  {/* Additions count - moved to the right */}
                  <span className={`${selectedChunk === chunkIndex ? 'text-emerald-600 font-medium text-sm px-2 py-0.5 bg-emerald-50 rounded-full' : 'text-emerald-600 font-medium'}`}>
                    {chunk.additions > 0 ? `+${chunk.additions} ${chunk.additions === 1 ? 'addition' : 'additions'}` : ''}
                  </span>
              </div>
              
                {/* Chunk content */}
                <div
                  onDoubleClick={(e) => {
                    // Only trigger if this chunk is already selected
                    if (selectedChunk === chunkIndex) {
                      e.stopPropagation();
                      mergeRightToLeft(chunkIndex);
                    }
                  }}
                  className={selectedChunk === chunkIndex ? 'cursor-pointer' : ''}
                  title={selectedChunk === chunkIndex ? "Double-click to merge to left" : ""}
                >
                  {chunk.lines.map((line, lineIndex) => (
                    <div 
                      key={`line-right-${chunkIndex}-${lineIndex}`}
                      className={`flex ${getLineClass(line.type, 'right')} cursor-pointer`}
                    >
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-zinc-500 select-none border-r border-zinc-200 bg-zinc-50 text-xs">
                  {line.lineNumber.right || ' '}
                </div>
                <div className="w-full overflow-x-auto">
                  {line.content.right ? (
                    <CodeLine 
                      content={line.content.right} 
                            language="auto"
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
                      <div className="w-10 min-w-[40px] flex-shrink-0 text-right pr-2 py-0 text-zinc-500 select-none border-r border-zinc-200 bg-zinc-50 text-xs">
                        {line.lineNumber.right || ' '}
                      </div>
                      <div className="w-full overflow-x-auto">
                        {line.content.right ? (
                          <CodeLine 
                            content={line.content.right} 
                            language="auto"
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
          style={{ background: '#f9fafb' }}
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
            let color = '#d4d4d8'; // Default zinc-300
            if (chunk.additions > 0 && chunk.deletions > 0) {
              color = '#fbbf24'; // Amber-400 for mixed changes
            } else if (chunk.additions > 0) {
              color = '#34d399'; // Emerald-400 for additions
            } else if (chunk.deletions > 0) {
              color = '#f87171'; // Rose-400 for deletions
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
                  backgroundColor: isSelected ? '#6366f1' : color, // Indigo-500 for selected
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
  language: string | 'auto';
  isModified?: boolean;
  otherContent?: string;
  side: 'left' | 'right';
}

function CodeLine({ content, language = 'abap', isModified = false, otherContent = '', side }: CodeLineProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  
  // Helper function to detect language from content
  const detectLanguage = (content: string, defaultLang = 'abap') => {
    if (!content) return defaultLang;
    
    // Pattern matching for common languages
    if (content.includes('import ') || content.includes('function ') || content.includes('const ') || content.includes('class ')) {
      return content.includes('import type ') || content.includes('interface ') ? 'typescript' : 'javascript';
    }
    if (content.includes('def ') && content.includes(':')) return 'python';
    if (content.includes('<html') || content.match(/<\w+>.*<\/\w+>/)) return 'html';
    if (content.includes('public class') || content.includes('import java.')) return 'java';
    if (content.includes('using System;') || content.includes('namespace ')) return 'csharp';
    if (content.includes('#include') || content.includes('int main(')) return 'cpp';
    if (content.includes('<?php')) return 'php';
    if (content.includes('SELECT') && content.includes('FROM')) return 'sql';
    if (content.includes('REPORT') || content.includes('DATA:')) return 'abap';
    
    return defaultLang;
  };
  
  useEffect(() => {
    if (codeRef.current) {
      try {
        // First, perform regular syntax highlighting with language detection
        const detectedLanguage = language === 'auto' ? detectLanguage(content, 'abap') : language;
        
        const syntaxHighlighted = hljs.highlight(content, { 
          language: detectedLanguage, 
          ignoreIllegals: true 
        }).value;
        
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
        
        // Apply ABAP style overrides to ensure keywords are blue
        if (detectedLanguage === 'abap' && codeRef.current) {
          // Special handling for ABAP comment lines
          if (content.trim().startsWith('*')) {
            // Handle lines starting with * (entire line is a comment)
            codeRef.current.style.color = '#888888';
            codeRef.current.style.fontStyle = 'italic';
            // Override any syntax highlighting that might have been applied
            codeRef.current.innerHTML = `<span style="color: #888888; font-style: italic;">${content}</span>`;
          } else if (content.includes('"')) {
            // Handle comment indicators within a line (everything after " is a comment)
            const commentIndex = content.indexOf('"');
            const beforeComment = content.substring(0, commentIndex);
            const commentPart = content.substring(commentIndex);
            
            // First apply normal syntax highlighting to the code part
            let codeHtml = hljs.highlight(beforeComment, { 
              language: 'abap', 
              ignoreIllegals: true 
            }).value;
            
            // Then add the comment part styled as a comment
            codeRef.current.innerHTML = codeHtml + 
              `<span style="color: #888888; font-style: italic;">${commentPart}</span>`;
            
            // Continue with keyword styling only for the code part
            const keywordElements = codeRef.current.querySelectorAll('.hljs-keyword');
            keywordElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.color = '#0000ff';
                el.style.fontWeight = 'bold';
              }
            });
          } else {
            // Normal handling for non-comment lines
            
            // Find and style keywords in blue
            const keywordElements = codeRef.current.querySelectorAll('.hljs-keyword');
            keywordElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.color = '#0000ff';
                el.style.fontWeight = 'bold';
              }
            });
            
            // Apply other ABAP-specific styling
            const commentElements = codeRef.current.querySelectorAll('.hljs-comment');
            commentElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.color = '#008000';
              }
            });
            
            const stringElements = codeRef.current.querySelectorAll('.hljs-string');
            stringElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.color = '#a31515';
              }
            });
            
            // Enhanced handling for compound keywords like START-OF-SELECTION
            const compoundKeywords = [
              'START-OF-SELECTION', 'END-OF-SELECTION', 
              'AT SELECTION-SCREEN', 'AT USER-COMMAND',
              'SELECTION-SCREEN', 'START-OF', 'END-OF', 
              'SELECTION-SCREEN', 'USER-COMMAND'
            ];
            
            let htmlContent = codeRef.current.innerHTML;
            
            // First, special case for START-OF-SELECTION which needs reliable highlighting
            if (content.includes('START-OF-SELECTION')) {
              // Use a more specific regex to ensure we capture the entire keyword including hyphens
              htmlContent = htmlContent.replace(
                /(START-OF-SELECTION)/gi,
                '<span style="color: #0000ff; font-weight: bold;">$1</span>'
              );
            }
            
            // Handle other special compound keywords
            if (content.includes('START-OF')) {
              htmlContent = htmlContent.replace(
                /(START-OF)/gi,
                '<span style="color: #0000ff; font-weight: bold;">$1</span>'
              );
            }
            
            if (content.includes('END-OF-SELECTION')) {
              htmlContent = htmlContent.replace(
                /(END-OF-SELECTION)/gi,
                '<span style="color: #0000ff; font-weight: bold;">$1</span>'
              );
            }
            
            // Apply other compound keywords
            compoundKeywords.forEach(keyword => {
              if (content.includes(keyword)) {
                // Handle hyphenated keywords by replacing the exact string rather than using word boundaries
                const escapedKeyword = keyword.replace(/-/g, '\\-');
                
                // Match the exact keyword, being careful with word boundaries
                const regex = new RegExp(`(${escapedKeyword})(?![a-zA-Z0-9_-])`, 'g');
                
                htmlContent = htmlContent.replace(
                  regex, 
                  '<span style="color: #0000ff; font-weight: bold;">$1</span>'
                );
              }
            });
            
            if (codeRef.current) {
              codeRef.current.innerHTML = htmlContent;
            }
          }
        }
      } catch (e) {
        // If highlighting fails, just display as plain text
        if (codeRef.current) {
          codeRef.current.textContent = content;
        }
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
              // Highlight deletion in left pane - revert to original red
              span.style.backgroundColor = '#ffcccc';
              span.style.color = '#770000';
            } else if (changeType === 1 && side === 'right') {
              // Keep highlight addition in right pane as green
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
    return 'bg-amber-50'; // Light amber for context lines
  }
  
  if (side === 'left') {
    switch (type) {
      case 'removed': return 'bg-rose-50'; // Light rose for removed lines (reverted)
      case 'modified': return 'bg-rose-50'; // Light rose for modified lines on left (reverted)
      default: return '';
    }
  } else {
  switch (type) {
      case 'added': return 'bg-emerald-50'; // Light emerald for added lines
      case 'modified': return 'bg-emerald-50'; // Light emerald for modified lines on right
    default: return '';
    }
  }
} 