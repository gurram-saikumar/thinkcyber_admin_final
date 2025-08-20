'use client';

import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  // Check if content already contains HTML tags (from TinyMCE)
  const containsHtml = /<[^>]+>/.test(content);
  
  if (containsHtml) {
    // Content is already HTML (from TinyMCE), enhance it with better table styling
    const enhancedContent = content
      // Add classes to tables for better styling
      .replace(/<table/g, '<table class="border-collapse border border-gray-300 my-4 w-full"')
      // Add classes to table headers
      .replace(/<th/g, '<th class="border border-gray-300 px-3 py-2 bg-gray-100 font-medium text-left"')
      // Add classes to table cells
      .replace(/<td/g, '<td class="border border-gray-300 px-3 py-2"')
      // Add classes to paragraphs
      .replace(/<p>/g, '<p class="mb-3">')
      // Add classes to lists
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-1 my-2">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-1 my-2">')
      // Add classes to headings
      .replace(/<h1>/g, '<h1 class="text-2xl font-semibold mb-2 mt-4">')
      .replace(/<h2>/g, '<h2 class="text-xl font-semibold mb-2 mt-4">')
      .replace(/<h3>/g, '<h3 class="text-lg font-semibold mb-2 mt-4">')
      .replace(/<h4>/g, '<h4 class="text-base font-semibold mb-2 mt-4">')
      .replace(/<h5>/g, '<h5 class="text-sm font-semibold mb-2 mt-4">')
      .replace(/<h6>/g, '<h6 class="text-xs font-semibold mb-2 mt-4">');
    
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: enhancedContent }}
      />
    );
  }

  // Convert markdown-style formatting to HTML (for legacy content)
  const formatContent = (text: string) => {
    return text
      // Bold text: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic text: *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Bullet points: • or - at start of line
      .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
      // Numbered lists: 1. or 1) at start of line
      .replace(/^\d+[\.\)]\s+(.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  // Handle table formatting
  const formatTables = (html: string) => {
    return html.replace(/(\|.*?\|(?:<br>\|.*?\|)*)/g, (match) => {
      const rows = match.split('<br>');
      let tableHtml = '<table class="table-auto border-collapse border border-gray-300 my-4 w-full">';
      
      rows.forEach((row, index) => {
        if (row.trim()) {
          const cells = row.split('|').filter(cell => cell.trim());
          if (cells.length > 0) {
            if (index === 0) {
              // Header row
              tableHtml += '<thead><tr>';
              cells.forEach(cell => {
                tableHtml += `<th class="border border-gray-300 px-3 py-2 bg-gray-100 font-medium text-left">${cell.trim()}</th>`;
              });
              tableHtml += '</tr></thead><tbody>';
            } else if (index === 1 && row.includes('---')) {
              // Skip separator row
              return;
            } else {
              // Data row
              tableHtml += '<tr>';
              cells.forEach(cell => {
                tableHtml += `<td class="border border-gray-300 px-3 py-2">${cell.trim()}</td>`;
              });
              tableHtml += '</tr>';
            }
          }
        }
      });
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
  };

  // Wrap consecutive <li> elements in <ul>
  const wrapLists = (html: string) => {
    return html
      .replace(/(<li>.*?<\/li>)/g, (match) => {
        // Only wrap if not already wrapped
        if (!match.includes('<ul>')) {
          return `<ul class="list-disc list-inside space-y-1 my-2">${match}</ul>`;
        }
        return match;
      });
  };

  const formattedContent = formatTables(wrapLists(formatContent(content)));

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}
