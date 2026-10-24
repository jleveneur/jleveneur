/** Text with `inline code` spans, written with backticks in the content files. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={`${String(index)}:${part}`}
            className="bg-paper-deep px-1 py-0.5 font-mono text-sm text-ink"
          >
            {part}
          </code>
        ) : (
          part
        )
      )}
    </>
  )
}
