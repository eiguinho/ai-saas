import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard } from "lucide-react";

function MessageContent({ content }) {
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  const renderedMarkdown = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");

          return !inline && match ? (
            <div className="relative my-3">
              <button
                onClick={() => copyToClipboard(codeString)}
                className="absolute top-2 right-2 p-1 rounded-lg bg-gray-800 text-white text-xs hover:bg-gray-700 transition flex items-center gap-1"
              >
                <Clipboard className="w-4 h-4" /> Copiar
              </button>
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-xl !p-4 !text-sm"
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
              {children}
            </code>
          );
        },
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--color-primary)]">{children}</strong>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-gray-300 text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border px-3 py-2 bg-gray-100 text-left font-medium">{children}</th>
        ),
        td: ({ children }) => <td className="border px-3 py-2">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  ), [content]);

  return renderedMarkdown;
}

export default React.memo(MessageContent);