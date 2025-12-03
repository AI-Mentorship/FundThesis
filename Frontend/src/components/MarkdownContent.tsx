"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <div className={`text-gray-600 prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }: { children?: React.ReactNode }) => (
            <p className="mb-3 leading-relaxed">{children}</p>
          ),
          strong: ({ children }: { children?: React.ReactNode }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }: { children?: React.ReactNode }) => (
            <em className="italic">{children}</em>
          ),
          ul: ({ children }: { children?: React.ReactNode }) => (
            <ul className="list-disc list-outside mb-3 space-y-1 ml-6">
              {children}
            </ul>
          ),
          ol: ({ children }: { children?: React.ReactNode }) => (
            <ol className="list-decimal list-outside mb-3 space-y-1 ml-6">
              {children}
            </ol>
          ),
          li: ({ children }: { children?: React.ReactNode }) => (
            <li className="pl-2">{children}</li>
          ),
          h1: ({ children }: { children?: React.ReactNode }) => (
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              {children}
            </h1>
          ),
          h2: ({ children }: { children?: React.ReactNode }) => (
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }: { children?: React.ReactNode }) => (
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {children}
            </h3>
          ),
          code: ({ children }: { children?: React.ReactNode }) => (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }: { children?: React.ReactNode }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
