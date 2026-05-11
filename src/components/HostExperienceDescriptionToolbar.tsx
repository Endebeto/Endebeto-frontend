import type { RefObject } from "react";
import { Bold, Italic, List } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
};

function focusSelect(
  ref: RefObject<HTMLTextAreaElement | null>,
  start: number,
  end: number,
) {
  requestAnimationFrame(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const safeEnd = Math.min(end, el.value.length);
    const safeStart = Math.min(start, safeEnd);
    el.setSelectionRange(safeStart, safeEnd);
  });
}

/**
 * Inserts Markdown snippets into the host description field — no need to memorize syntax.
 */
export function HostExperienceDescriptionToolbar({
  textareaRef,
  value,
  onChange,
  disabled,
  className,
}: Props) {
  const btnCls =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-outline-variant/35 bg-white dark:bg-zinc-800 dark:border-zinc-600 text-on-surface dark:text-zinc-200 hover:bg-surface-container-low dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:pointer-events-none";

  const applyBold = () => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end);
    const inner = sel || "bold text";
    const insert = `**${inner}**`;
    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    if (sel) focusSelect(textareaRef, start, start + insert.length);
    else focusSelect(textareaRef, start + 2, start + 2 + inner.length);
  };

  const applyItalic = () => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end);
    const inner = sel || "italic text";
    const insert = `*${inner}*`;
    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    if (sel) focusSelect(textareaRef, start, start + insert.length);
    else focusSelect(textareaRef, start + 1, start + 1 + inner.length);
  };

  const applyBullet = () => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const atLineStart = start === 0 || value[start - 1] === "\n";
    const insert = atLineStart ? "- " : "\n- ";
    const next = value.slice(0, start) + insert + value.slice(end);
    const caret = start + insert.length;
    onChange(next);
    focusSelect(textareaRef, caret, caret);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 mb-2",
        className,
      )}
      role="toolbar"
      aria-label="Description formatting"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant dark:text-zinc-500 mr-1">
        Quick format
      </span>
      <button type="button" className={btnCls} onClick={applyBold} disabled={disabled} title="Bold">
        <Bold className="h-3.5 w-3.5" aria-hidden />
        Bold
      </button>
      <button type="button" className={btnCls} onClick={applyItalic} disabled={disabled} title="Italic">
        <Italic className="h-3.5 w-3.5" aria-hidden />
        Italic
      </button>
      <button type="button" className={btnCls} onClick={applyBullet} disabled={disabled} title="Bullet line">
        <List className="h-3.5 w-3.5" aria-hidden />
        Bullet
      </button>
    </div>
  );
}
