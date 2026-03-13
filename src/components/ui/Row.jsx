export default function Row({ title, children }) {
  return (
    <section className="space-y-4">
      {title && <h2 className="text-2xl font-heading font-semibold">{title}</h2>}
      <div className="row-scroll">
        {children}
      </div>
    </section>
  )
}
