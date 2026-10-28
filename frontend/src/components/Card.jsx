// frontend/src/components/Card.jsx
// Reusable white panel with a title and a one-line "what am I looking at" subtitle.
export default function Card({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-panel border border-border bg-surface p-5 shadow-panel ${className}`}>
      <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      {subtitle && <p className="mt-1 mb-4 text-sm text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}