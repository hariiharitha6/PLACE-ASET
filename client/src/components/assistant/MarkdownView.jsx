'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div style={{
      margin: '12px 0',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '12.5px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--accent-success)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)',
          }}
          title="Copy code snippet"
          aria-label="Copy code snippet"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{
        padding: '12px 14px',
        margin: 0,
        overflowX: 'auto',
        color: 'var(--text-primary)',
        lineHeight: '1.55',
        whiteSpace: 'pre',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Robust markdown renderer for assistant responses.
 * Parses headers, bold, italics, code blocks, lists, blockquotes, and tables cleanly.
 */
export default function MarkdownView({ content }) {
  if (!content) return null;

  // Split content into blocks: code blocks vs text blocks
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      value: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.substring(lastIndex),
    });
  }

  const renderInline = (str) => {
    if (!str) return null;

    // Handle inline code: `code`
    const codeSplit = str.split(/`([^`]+)`/g);
    return codeSplit.map((piece, i) => {
      if (i % 2 === 1) {
        return (
          <code
            key={i}
            style={{
              padding: '2px 5px',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--accent-teal, #38bdf8)',
              border: '1px solid var(--border-color)',
            }}
          >
            {piece}
          </code>
        );
      }

      // Handle bold: **text**
      const boldSplit = piece.split(/\*\*([^*]+)\*\*/g);
      return boldSplit.map((bPiece, j) => {
        if (j % 2 === 1) {
          return <strong key={`${i}-${j}`} style={{ color: 'var(--text-primary)', fontWeight: 650 }}>{bPiece}</strong>;
        }

        // Handle italics: *text* or _text_
        const italicSplit = bPiece.split(/\*([^*]+)\*/g);
        return italicSplit.map((itPiece, k) => {
          if (k % 2 === 1) {
            return <em key={`${i}-${j}-${k}`}>{itPiece}</em>;
          }
          return itPiece;
        });
      });
    });
  };

  const renderTextBlock = (text, blockIdx) => {
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let listType = null; // 'ul' | 'ol'
    let inTable = false;
    let tableRows = [];

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${elements.length}`} style={{ margin: '8px 0', paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {currentList.map((item, idx) => (
                <li key={idx} style={{ lineHeight: '1.5' }}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} style={{ margin: '8px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {currentList.map((item, idx) => (
                <li key={idx} style={{ lineHeight: '1.5' }}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const bodyRows = tableRows.slice(1).filter(r => !r.every(cell => /^[-:]+$/.test(cell.trim())));

        elements.push(
          <div key={`table-${elements.length}`} style={{ margin: '12px 0', overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12.5px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
                  {header.map((col, cIdx) => (
                    <th key={cIdx} style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid var(--border-color)',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                    }}>
                      {renderInline(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.04))' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '7px 12px', color: 'var(--text-secondary)' }}>
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check table row: starts and ends with |
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
        flushList();
        inTable = true;
        const cols = trimmed.slice(1, -1).split('|');
        tableRows.push(cols);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Check headings
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h3-${i}`} style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: '12px 0 6px' }}>
            {renderInline(trimmed.substring(4))}
          </h4>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h2-${i}`} style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-primary)', margin: '14px 0 8px' }}>
            {renderInline(trimmed.substring(3))}
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h1-${i}`} style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: '16px 0 8px' }}>
            {renderInline(trimmed.substring(2))}
          </h2>
        );
        continue;
      }

      // Check blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`bq-${i}`} style={{
            margin: '8px 0',
            paddingLeft: '12px',
            borderLeft: '3px solid var(--accent-primary)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            fontSize: '13px',
          }}>
            {renderInline(trimmed.substring(2))}
          </blockquote>
        );
        continue;
      }

      // Check bullet list item
      if (/^[-*+]\s+/.test(trimmed)) {
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        currentList.push(trimmed.replace(/^[-*+]\s+/, ''));
        continue;
      }

      // Check numbered list item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        currentList.push(numMatch[2]);
        continue;
      }

      // Plain line
      flushList();
      if (trimmed) {
        elements.push(
          <p key={`p-${i}`} style={{ margin: '6px 0', lineHeight: '1.55', color: 'var(--text-primary)' }}>
            {renderInline(trimmed)}
          </p>
        );
      }
    }

    flushList();
    flushTable();

    return (
      <div key={`block-${blockIdx}`} style={{ display: 'flex', flexDirection: 'column' }}>
        {elements}
      </div>
    );
  };

  return (
    <div style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlock key={idx} language={part.language} code={part.value} />;
        }
        return renderTextBlock(part.value, idx);
      })}
    </div>
  );
}
