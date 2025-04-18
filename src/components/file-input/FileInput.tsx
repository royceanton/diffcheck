//code: src/components/file-input/FileInput.tsx
'use client';

import { useState, useEffect } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';

interface FileInputProps {
  label: string;
  content: string;
  onChange: (value: string) => void;
  language?: string;
}

export default function FileInput({ label, content, onChange, language = 'abap' }: FileInputProps) {
  const monaco = useMonaco();
  
  // Register ABAP keywords for syntax highlighting
  useEffect(() => {
    if (monaco) {
      // Register ABAP as a language if not already supported
      monaco.languages.register({ id: 'abap' });
      
      // Define ABAP syntax highlighting rules
      monaco.languages.setMonarchTokensProvider('abap', {
        defaultToken: '',
        tokenPostfix: '.abap',
        ignoreCase: true,
        
        keywords: [
          'REPORT', 'DATA', 'TYPE', 'TABLE', 'OF', 'SELECT', 'FROM', 'INTO', 'UP', 'TO', 'ROWS',
          'LOOP', 'AT', 'ENDLOOP', 'IF', 'ENDIF', 'WRITE', 'ENDMETHOD', 'CALL', 'FUNCTION', 
          'METHOD', 'IMPORTING', 'EXPORTING', 'CHANGING', 'FORM', 'ENDFORM', 'PERFORM',
          'CLEAR', 'FIELD-SYMBOLS', 'ASSIGN', 'CP', 'EQ', 'NE', 'GT', 'LT', 'GE', 'LE'
        ],
        
        operators: [
          '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '&', '&&'
        ],
        
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        
        tokenizer: {
          root: [
            [/[a-zA-Z_][\w$]*/, { 
              cases: { 
                '@keywords': 'keyword',
                '@default': 'identifier' 
              } 
            }],
            [/[=><!~?:&|+\-*\/\^%]+/, {
              cases: {
                '@operators': 'operator',
                '@default': 'symbol'
              }
            }],
            { include: '@whitespace' },
            [/[{}()\[\]]/, '@brackets'],
            [/\d+/, 'number'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single']
          ],
          
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\*.*$/, 'comment'],
            [/".*$/, 'comment']
          ],
          
          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop']
          ],
          
          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop']
          ]
        }
      });
      
      // Set a theme that works well with ABAP
      monaco.editor.defineTheme('abapTheme', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '6366f1', fontStyle: 'bold' }, // Indigo 500
          { token: 'comment', foreground: '84cc16' }, // Lime 500
          { token: 'string', foreground: 'ec4899' }, // Pink 500
          { token: 'identifier', foreground: '000000' },
          { token: 'number', foreground: '8b5cf6' } // Violet 500
        ],
        colors: {
          'editor.foreground': '#000000',
          'editor.background': '#ffffff',
          'editorError.foreground': '#00000000', // Make validation errors invisible
          'editorWarning.foreground': '#00000000' // Make validation warnings invisible
        }
      });
    }
  }, [monaco]);
  
  // Try to detect language from file content
  const detectLanguage = (content: string) => {
    if (!content) return language;
    
    // Check for ABAP keywords and patterns
    if (content.includes('REPORT') || 
        content.includes('DATA:') || 
        content.includes('ENDLOOP') || 
        content.includes('METHOD') ||
        content.includes('FORM') ||
        content.match(/\bLOOP\b.*\bAT\b/)) {
      return 'abap';
    }
    
    // Other languages
    if (content.includes('import React') || content.includes('from "react"')) return 'typescript';
    if (content.includes('def ') && content.includes(':')) return 'python';
    if (content.includes('<html') || content.includes('<!DOCTYPE')) return 'html';
    if (content.includes('package ') && content.includes(';')) return 'java';
    
    return language;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-zinc-200">
        <h3 className="font-medium text-sm text-zinc-800">{label}</h3>
        <div className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium">
          {detectLanguage(content).toUpperCase()}
        </div>
      </div>

      <div className="flex-grow">
        <Editor
          height="100%"
          language={detectLanguage(content)}
          value={content}
          onChange={(value) => onChange(value || '')}
          theme="abapTheme"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            fontFamily: 'var(--font-geist-mono), Menlo, Monaco, "Courier New", monospace',
            fontLigatures: true,
            scrollbar: {
              vertical: 'visible',
              horizontalSliderSize: 4,
              verticalSliderSize: 4,
            },
            renderWhitespace: 'boundary',
            bracketPairColorization: { enabled: true },
            autoIndent: 'full',
            formatOnPaste: true,
            renderControlCharacters: true,
            colorDecorators: true,
            matchBrackets: 'always',
          }}
        />
      </div>
    </div>
  );
} 