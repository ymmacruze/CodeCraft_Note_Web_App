import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold border-b pb-2 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold border-b pb-2 mb-3 mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mb-2 mt-5">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mb-2 mt-4">{children}</h4>
          ),
          // Custom code block
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={cn('block p-4 rounded-lg bg-muted overflow-x-auto', className)} {...props}>
                {children}
              </code>
            );
          },
          // Custom pre block
          pre: ({ children }) => (
            <pre className="bg-muted rounded-lg overflow-hidden my-4">{children}</pre>
          ),
          // Custom blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          // Custom links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          // Custom lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
          ),
          // Task list items
          li: ({ children, className }) => {
            const isTask = className?.includes('task-list-item');
            return (
              <li className={cn('leading-relaxed', isTask && 'list-none flex items-start gap-2')}>
                {children}
              </li>
            );
          },
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-border">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          // Horizontal rule
          hr: () => <hr className="my-6 border-border" />,
          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4"
            />
          ),
        }}
      >
        {content || '*No content yet. Start writing!*'}
      </ReactMarkdown>
    </div>
  );
}
