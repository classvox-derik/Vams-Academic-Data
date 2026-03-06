import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Match **bold**, *italic*, and `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    if (match[2]) {
      nodes.push(<strong key={match.index} className="font-semibold text-heading">{match[2]}</strong>)
    } else if (match[3]) {
      nodes.push(<em key={match.index}>{match[3]}</em>)
    } else if (match[4]) {
      nodes.push(<code key={match.index} className="rounded bg-tab px-1.5 py-0.5 text-xs font-mono">{match[4]}</code>)
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }
  return nodes.length > 0 ? nodes : [text]
}

interface ParsedBlock {
  type: "h1" | "h2" | "h3" | "h4" | "p" | "ul-item" | "ol-item" | "table-row" | "table-sep" | "hr" | "blank"
  content: string
  cells?: string[]
}

function parseBlocks(text: string): ParsedBlock[] {
  return text.split("\n").map(line => {
    if (!line.trim()) return { type: "blank" as const, content: "" }
    if (line.trim() === "---" || line.trim() === "***") return { type: "hr" as const, content: "" }
    if (line.startsWith("#### ")) return { type: "h4" as const, content: line.slice(5) }
    if (line.startsWith("### ")) return { type: "h3" as const, content: line.slice(4) }
    if (line.startsWith("## ")) return { type: "h2" as const, content: line.slice(3) }
    if (line.startsWith("# ")) return { type: "h1" as const, content: line.slice(2) }
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const inner = line.trim().slice(1, -1)
      // Check if it's a separator row (|---|---|)
      if (/^[\s\-:|]+$/.test(inner)) return { type: "table-sep" as const, content: line, cells: [] }
      const cells = inner.split("|").map(c => c.trim())
      return { type: "table-row" as const, content: line, cells }
    }
    if (/^[-*]\s/.test(line.trim())) return { type: "ul-item" as const, content: line.trim().slice(2) }
    if (/^\d+\.\s/.test(line.trim())) return { type: "ol-item" as const, content: line.trim().replace(/^\d+\.\s/, "") }
    return { type: "p" as const, content: line }
  })
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = parseBlocks(content)
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    // Skip blanks
    if (block.type === "blank") { i++; continue }

    // Horizontal rule
    if (block.type === "hr") {
      elements.push(<hr key={i} className="my-4 border-border-light" />)
      i++; continue
    }

    // Headings
    if (block.type === "h1") {
      elements.push(
        <h3 key={i} className="text-base sm:text-lg font-bold text-heading font-heading mt-5 mb-2 pb-1.5 border-b border-border-light">
          {renderInline(block.content)}
        </h3>
      )
      i++; continue
    }
    if (block.type === "h2") {
      elements.push(
        <h4 key={i} className="text-sm sm:text-base font-bold text-heading font-heading mt-5 mb-2">
          {renderInline(block.content)}
        </h4>
      )
      i++; continue
    }
    if (block.type === "h3") {
      elements.push(
        <h5 key={i} className="text-sm font-semibold text-heading font-heading mt-4 mb-1.5">
          {renderInline(block.content)}
        </h5>
      )
      i++; continue
    }
    if (block.type === "h4") {
      elements.push(
        <h6 key={i} className="text-xs sm:text-sm font-semibold text-heading mt-3 mb-1">
          {renderInline(block.content)}
        </h6>
      )
      i++; continue
    }

    // Tables: collect consecutive table rows
    if (block.type === "table-row" || block.type === "table-sep") {
      const tableBlocks: ParsedBlock[] = []
      while (i < blocks.length && (blocks[i].type === "table-row" || blocks[i].type === "table-sep")) {
        tableBlocks.push(blocks[i])
        i++
      }
      // First row is header, skip separator, rest are body
      const headerRow = tableBlocks.find(b => b.type === "table-row")
      const bodyRows = tableBlocks.filter(b => b.type === "table-row").slice(1)

      if (headerRow?.cells) {
        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-border-light">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  {headerRow.cells.map((cell, ci) => (
                    <th key={ci} className="bg-navy px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-left text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wide text-white whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-card" : "bg-stripe"}>
                    {row.cells?.map((cell, ci) => (
                      <td key={ci} className="border-t border-border-light px-2.5 py-2 sm:px-3.5 sm:py-2.5 whitespace-nowrap sm:whitespace-normal">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Unordered list: collect consecutive items
    if (block.type === "ul-item") {
      const items: ParsedBlock[] = []
      while (i < blocks.length && blocks[i].type === "ul-item") {
        items.push(blocks[i])
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-1">
          {items.map((item, li) => (
            <li key={li} className="flex gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span>{renderInline(item.content)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list: collect consecutive items
    if (block.type === "ol-item") {
      const items: ParsedBlock[] = []
      while (i < blocks.length && blocks[i].type === "ol-item") {
        items.push(blocks[i])
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-2 pl-1">
          {items.map((item, li) => (
            <li key={li} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-[0.65rem] font-bold text-teal mt-0.5">
                {li + 1}
              </span>
              <span className="flex-1">{renderInline(item.content)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Paragraph
    elements.push(
      <p key={i} className="mb-2 text-sm leading-relaxed">
        {renderInline(block.content)}
      </p>
    )
    i++
  }

  return (
    <div className={cn("text-secondary", className)}>
      {elements}
    </div>
  )
}
