/** A visible placeholder for data the team must confirm before the pitch ([PENDIENTE]). */
export function Pending({ children }: { children: string }) {
  return (
    <span
      className="mono"
      style={{
        display: 'inline-block',
        fontSize: 14,
        letterSpacing: '0.08em',
        color: 'var(--coral)',
        border: '1px dashed rgba(255,110,66,0.6)',
        borderRadius: 8,
        padding: '6px 10px',
        textTransform: 'none',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
