import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";

/** Shown under host description fields — mirrors what we render (no links). */
export const EXPERIENCE_DESCRIPTION_FORMAT_HINT =
  "Press Enter for a new line. Use Bold / Italic / Bullet above, or type **bold**, *italic*, and lines starting with \"- \". Blank line between blocks adds spacing. Links aren’t supported.";

/** Drop <a> so markdown/HTML links never render as clickable. */
const descriptionSanitizeSchema = {
  ...defaultSchema,
  tagNames: (defaultSchema.tagNames ?? []).filter((t) => t !== "a"),
} satisfies typeof defaultSchema;

type Props = {
  markdown: string;
  className?: string;
};

/**
 * Renders host-authored experience copy as Markdown (bold, italic, lists, line breaks)
 * with sanitization. Links are not supported as clickable anchors.
 * Single newlines become visible line breaks (remark-breaks).
 */
export function ExperienceDescriptionMarkdown({ markdown, className }: Props) {
  const raw = markdown ?? "";
  if (!raw.trim()) return null;

  return (
    <div
      className={cn(
        "experience-description-markdown prose prose-sm max-w-none",
        "prose-headings:font-headline prose-headings:font-bold prose-headings:text-on-surface dark:prose-headings:text-zinc-100 prose-headings:scroll-mt-24",
        "prose-p:text-on-surface-variant dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0",
        "prose-strong:text-on-surface dark:prose-strong:text-white prose-strong:font-bold",
        "prose-em:text-on-surface-variant dark:prose-em:text-zinc-300",
        "prose-ul:text-on-surface-variant dark:prose-ul:text-zinc-400 prose-ul:my-2 prose-li:my-0.5",
        "prose-ol:text-on-surface-variant dark:prose-ol:text-zinc-400 prose-ol:my-2",
        "prose-li:marker:text-primary dark:prose-li:marker:text-green-400",
        "prose-hr:border-outline-variant/30 dark:prose-hr:border-zinc-700",
        "prose-blockquote:border-l-primary prose-blockquote:text-on-surface-variant dark:prose-blockquote:text-zinc-400",
        "prose-code:text-primary dark:prose-code:text-green-400 prose-code:bg-surface-container-low dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        rehypePlugins={[[rehypeSanitize, descriptionSanitizeSchema]]}
        components={{
          a: ({ children }) => <span>{children}</span>,
        }}
      >
        {raw}
      </ReactMarkdown>
    </div>
  );
}
