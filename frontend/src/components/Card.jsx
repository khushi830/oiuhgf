// frontend/src/components/Card.jsx
// Reusable white panel with a title and a one-line "what am I looking at" subtitle.
export default function Card({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 mb-4 text-sm text-slate-500">{subtitle}</p>}
      {children}
    </section>
  );
}