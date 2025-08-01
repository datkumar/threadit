"use client";

import type { OutputData } from "@editorjs/editorjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FC, JSX } from "react";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);

interface EditorOutputProps {
  content: OutputData;
}

// Consistent styling that matches the Editor's prose classes
const style = {
  paragraph: {
    fontSize: "1rem", // Match prose styling
    lineHeight: "1.5rem",
    marginTop: "1.5rem",
    marginBottom: "1.2rem",
    color: "#374151", // text-gray-700
  },
  header: {
    h1: {
      fontSize: "2.25rem",
      lineHeight: "2.5rem",
      fontWeight: "800",
      marginBottom: "2rem",
      marginTop: "0",
      color: "#111827", // text-gray-900
    },
    h2: {
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: "700",
      marginBottom: "1.5rem",
      marginTop: "2rem",
      color: "#111827",
    },
    h3: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: "600",
      marginBottom: "1rem",
      marginTop: "1.5rem",
      color: "#111827",
    },
  },
  list: {
    container: {
      marginBottom: "1.25rem",
    },
    listItem: {
      marginBottom: "0.5rem",
      lineHeight: "1.75rem",
    },
  },
  codeBlock: {
    backgroundColor: "#1f2937",
    color: "#f9fafb",
    padding: "1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontFamily: "ui-monospace, monospace",
    overflow: "auto",
    marginBottom: "1.25rem",
  },
  codeInline: {
    backgroundColor: "#f3f4f6", // light gray
    color: "#111827", // near-black text
    padding: "0.2rem 0.4rem",
    borderRadius: "0.25rem",
    fontSize: "0.875rem",
    fontFamily: "ui-monospace, monospace",
  },
};

function CustomImageRenderer({ data }: any) {
  const src = data.file?.url;

  if (!src) {
    return <div className="text-gray-500 italic">Image not available</div>;
  }

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image
        src={src}
        alt={data.caption || "Post image"}
        fill
        // height="240"
        // width="240"
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Add caption? */}
    </div>
  );
}

function CustomCodeRenderer({ data }: any) {
  return (
    <div className="my-6">
      <pre className="bg-gray-800 rounded-md p-4 overflow-x-auto">
        <code className="text-gray-100 text-sm">{data.code}</code>
      </pre>
    </div>
  );
}

function CustomHeaderRenderer({ data }: any) {
  const HeaderTag = `h${data.level}` as keyof JSX.IntrinsicElements;
  const headerClasses = {
    1: "text-2xl font-semibold mb-6 mt-0 text-gray-900",
    2: "text-xl font-semibold mb-4 mt-8 text-gray-900",
    3: "text-lg font-semibold mb-3 mt-6 text-gray-900",
    4: "text-base font-semibold mb-2 mt-4 text-gray-900",
    5: "text-sm font-medium mb-2 mt-3 text-gray-900",
    6: "text-xs font-medium mb-1 mt-2 text-gray-900",
  };

  return (
    <HeaderTag
      className={
        headerClasses[data.level as keyof typeof headerClasses] ||
        headerClasses[1]
      }
    >
      {data.text}
    </HeaderTag>
  );
}

function CustomListRenderer({ data }: any) {
  const ListTag = data.style === "ordered" ? "ol" : "ul";

  return (
    <ListTag
      className={`my-4 ${
        data.style === "ordered" ? "list-decimal" : "list-disc"
      } list-inside space-y-2`}
    >
      {data.items.map((item: any, index: number) => (
        <li key={index} className="text-gray-700 leading-relaxed">
          {typeof item === "string"
            ? item
            : item?.content || JSON.stringify(item)}
        </li>
      ))}
    </ListTag>
  );
}

function CustomTableRenderer({ data }: any) {
  const hasHeadings = data.withHeadings;

  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <tbody>
          {data.content.map((row: string[], rowIndex: number) => (
            <tr
              key={rowIndex}
              className={hasHeadings && rowIndex === 0 ? "bg-gray-50" : ""}
            >
              {row.map((cell: string, cellIndex: number) => {
                const CellTag = hasHeadings && rowIndex === 0 ? "th" : "td";
                return (
                  <CellTag
                    key={cellIndex}
                    className={`border border-gray-300 px-4 py-2 text-left ${
                      hasHeadings && rowIndex === 0
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {cell}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomParagraphRenderer({ data }: any) {
  return (
    <p className="text-base leading-7 text-gray-700 mb-5">
      {typeof data.text === "string" ? data.text : JSON.stringify(data.text)}
    </p>
  );
}

function UnknownBlockRenderer({ data, type }: any) {
  console.warn("Unhandled block type:", type, data);
  return (
    <pre className="bg-yellow-100 text-yellow-800 text-sm p-2">
      {type}: {JSON.stringify(data, null, 2)}
    </pre>
  );
}

const renderers = {
  header: CustomHeaderRenderer,
  // paragraph: CustomParagraphRenderer,
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
  list: CustomListRenderer,
  table: CustomTableRenderer,
  // fallback for unknown blocks
  // fallback: UnknownBlockRenderer,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  // Handle null/undefined content
  if (!content) {
    return <div className="text-gray-500 italic">No content available</div>;
  }
  // Handle empty content
  if (!content.blocks || content.blocks.length === 0) {
    return <div className="text-gray-500 italic">No content to display</div>;
  }

  return (
    <div className="prose prose-stone dark:prose max-w-none">
      <Output
        className="text-base"
        data={content}
        renderers={renderers}
        style={style}
      />
    </div>
  );
};

export default EditorOutput;
