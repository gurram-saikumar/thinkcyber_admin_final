'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Eye, 
  Edit3,
  Table,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
  disabled = false
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      });
    }
  }, []);

  // Convert HTML table to markdown format
  const convertHtmlTableToMarkdown = (html: string): string => {
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const table = tempDiv.querySelector('table');
      if (!table) {
        // If no table found, try to extract from raw HTML string
        const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
        if (tableMatch) {
          tempDiv.innerHTML = tableMatch[0];
          return convertHtmlTableToMarkdown(tempDiv.innerHTML);
        }
        return html; // Return original if no table found
      }
      
      let markdownTable = '';
      const rows = table.querySelectorAll('tr');
      
      if (rows.length === 0) return html;
      
      let isFirstRow = true;
      
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length === 0) return;
        
        const cellContents = Array.from(cells).map(cell => {
          // Get text content and preserve basic formatting
          let content = cell.innerHTML
            .replace(/<strong[^>]*>/gi, '**')
            .replace(/<\/strong>/gi, '**')
            .replace(/<b[^>]*>/gi, '**')
            .replace(/<\/b>/gi, '**')
            .replace(/<em[^>]*>/gi, '*')
            .replace(/<\/em>/gi, '*')
            .replace(/<i[^>]*>/gi, '*')
            .replace(/<\/i>/gi, '*')
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          return content || ' ';
        });
        
        // Add table row
        markdownTable += '| ' + cellContents.join(' | ') + ' |\n';
        
        // Add separator after first row or if row contains th elements
        if (isFirstRow || row.querySelector('th')) {
          markdownTable += '|' + cellContents.map(() => '----------').join('|') + '|\n';
          isFirstRow = false;
        }
      });
      
      return markdownTable.trim();
    } catch (error) {
      console.error('Error converting HTML table:', error);
      return html; // Return original on error
    }
  };

  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');
    
    console.log('Paste detected:');
    console.log('HTML data length:', htmlData.length);
    console.log('Text data length:', textData.length);
    
    // Only check for HTML if there's actual HTML data that's significantly different from text
    const hasHtmlData = htmlData && htmlData.length > 0;
    
    // Check for HTML tables specifically
    const hasTableHtml = hasHtmlData && (
      htmlData.toLowerCase().includes('<table') || 
      htmlData.toLowerCase().includes('<tbody') || 
      htmlData.toLowerCase().includes('<tr>') ||
      htmlData.toLowerCase().includes('<th>') ||
      htmlData.toLowerCase().includes('<td>')
    );
    
    // Check if text data contains table-like HTML (for cases where HTML data is in text format)
    const hasTableInText = textData && (
      textData.includes('<table') || 
      textData.includes('<tbody') || 
      textData.includes('<tr>') ||
      textData.includes('<th>') ||
      textData.includes('<td>')
    );
    
    // Handle table conversion
    if (hasTableHtml || hasTableInText) {
      e.preventDefault();
      const dataToConvert = hasTableHtml ? htmlData : textData;
      console.log('Detected HTML table data');
      const markdownTable = convertHtmlTableToMarkdown(dataToConvert);
      console.log('Converted to markdown:', markdownTable);
      
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newValue = value.substring(0, start) + '\n\n' + markdownTable + '\n\n' + value.substring(end);
        onChange(newValue);
        
        // Set cursor after inserted content
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos = start + markdownTable.length + 4;
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            textareaRef.current.focus();
          }
        }, 0);
        
        alert('HTML table pasted and converted to markdown!');
      }
      return; // Exit early after handling table
    }
    
    // Only process other HTML if:
    // 1. There's substantial HTML data (much more than text)
    // 2. AND it contains actual structural HTML tags (not just basic formatting)
    if (hasHtmlData && htmlData.length > (textData.length * 2) && htmlData.length > 200) {
      const hasStructuralHtml = htmlData.match(/<(div|p|span|ul|ol|li|h[1-6]|article|section)[^>]*>/i);
      const hasFormattingHtml = htmlData.match(/<(strong|b|em|i|br)[^>]*>/gi);
      
      // Only convert if there's structural HTML, not just basic formatting
      if (hasStructuralHtml && (hasFormattingHtml ? hasFormattingHtml.length > 3 : false)) {
        e.preventDefault();
        console.log('Detected significant HTML content');
        const convertedContent = htmlData
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
          .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1')
          .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1')
          .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
          .trim();
        
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const newValue = value.substring(0, start) + convertedContent + value.substring(end);
          onChange(newValue);
          
          // Set cursor after inserted content
          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPos = start + convertedContent.length;
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
              textareaRef.current.focus();
            }
          }, 0);
          
          alert('HTML content pasted and converted!');
        }
      }
    }
    // If none of the conditions are met, allow normal paste behavior (no alert)
  }, [value, onChange]);

  const insertText = useCallback((before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue = 
      value.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      value.substring(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  }, [value, onChange]);

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatUnorderedList = () => {
    const lines = value.split('\n');
    const start = textareaRef.current?.selectionStart || 0;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    insertText('\n• ', '');
  };
  const formatOrderedList = () => {
    const lines = value.split('\n');
    const start = textareaRef.current?.selectionStart || 0;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineNumber = lines.slice(0, lines.findIndex((_, i) => 
      lines.slice(0, i + 1).join('\n').length >= start
    )).filter(line => line.match(/^\d+\./)).length + 1;
    insertText(`\n${lineNumber}. `, '');
  };

  const insertTable = () => {
    const tableTemplate = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`;
    insertText('\n' + tableTemplate + '\n', '');
  };

  const convertHtmlInContent = () => {
    if (!value.trim()) {
      alert('Please paste or type some HTML content first!');
      return;
    }
    
    if (value.includes('<table') || value.includes('<tbody') || value.includes('<tr>')) {
      const convertedContent = convertHtmlTableToMarkdown(value);
      onChange(convertedContent);
      alert('HTML table converted to markdown format!');
    } else {
      // Try to convert any HTML content to plain text with basic formatting
      const convertedContent = value
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
        .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1')
        .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1')
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up extra newlines
        .trim();
      
      if (convertedContent !== value) {
        onChange(convertedContent);
        alert('HTML content converted to markdown format!');
      } else {
        alert('No HTML content detected to convert.');
      }
    }
  };

  const renderPreview = (text: string) => {
    let html = text;
    
    // First, handle tables before other formatting
    html = html.replace(/(\|[^|\n]*\|[\s\S]*?)(?=\n\n|\n$|$)/g, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;
      
      let tableHtml = '<table class="table-auto border-collapse border border-gray-300 my-4 w-full">';
      let headerProcessed = false;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Skip separator lines like |---|---|---|
        if (trimmedLine.match(/^\|[\s\-|]+\|$/)) {
          return;
        }
        
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
          const cells = trimmedLine.slice(1, -1).split('|').map(cell => cell.trim());
          
          if (!headerProcessed) {
            // First row is header
            tableHtml += '<thead class="bg-gray-50"><tr>';
            cells.forEach(cell => {
              const cellContent = cell
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
              tableHtml += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${cellContent}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
            headerProcessed = true;
          } else {
            // Data rows
            tableHtml += '<tr class="hover:bg-gray-50">';
            cells.forEach(cell => {
              const cellContent = cell
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
              tableHtml += `<td class="border border-gray-300 px-4 py-2">${cellContent}</td>`;
            });
            tableHtml += '</tr>';
          }
        }
      });
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
    
    // Then handle other formatting
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      .replace(/\n/g, '<br>');
    
    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*?<\/li>(?:<br><li>.*?<\/li>)*)/g, '<ul class="list-none space-y-1 my-4">$1</ul>');
    html = html.replace(/<br>(?=<li>)/g, '').replace(/(?<=<\/li>)<br>/g, '');
    
    return html;
  };

  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 rounded-t-lg">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBold}
          disabled={disabled || isPreview}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatItalic}
          disabled={disabled || isPreview}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatUnorderedList}
          disabled={disabled || isPreview}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatOrderedList}
          disabled={disabled || isPreview}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertTable}
          disabled={disabled || isPreview}
          className="h-8 w-8 p-0"
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={convertHtmlInContent}
          disabled={disabled || isPreview}
          className="h-8 w-8 p-0"
          title="Convert HTML to Markdown (Click to convert any HTML content in the editor)"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsPreview(!isPreview);
              // Focus textarea when switching to edit mode
              if (isPreview && textareaRef.current) {
                setTimeout(() => {
                  textareaRef.current?.focus();
                }, 0);
              }
            }}
            disabled={disabled}
            className="h-8 px-3"
          >
            {isPreview ? (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[120px]">
        {isPreview ? (
          <div 
            className="p-4 max-w-none overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
            style={{
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelectionChange}
            onFocus={handleSelectionChange}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={isPreview}
            className="border-0 resize-none focus-visible:ring-0 min-h-[120px] rounded-none rounded-b-lg"
            style={{ opacity: isPreview ? 0.6 : 1 }}
          />
        )}
      </div>
    </div>
  );
}
