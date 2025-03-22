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
          { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
          { token: 'comment', foreground: '008000' },
          { token: 'string', foreground: 'a31515' },
          { token: 'identifier', foreground: '000000' },
          { token: 'number', foreground: '098658' }
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
    <div className="flex flex-col h-[calc(100vh-120px)] border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
        <h3 className="font-medium text-sm text-gray-800">{label}</h3>
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
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
            //semanticHighlighting: false, // Disable semantic highlighting (which can cause unwanted highlighting)
            matchBrackets: 'always',
            // Disable validators that might cause red squiggly lines
            //'semanticValidation.enabled': false,
            //'syntaxValidation.enabled': false,
            //'suggestions.enabled': false, // Disable suggestions
            //'renderValidationDecorations': 'off', // Turn off validation decorations
          }}
        />
      </div>
    </div>
  );
} 