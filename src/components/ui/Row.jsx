export default function Row({ title, children }) {
  return (
    <section className="space-y-3 md:space-y-4">
      {title && <h2 className="text-lg md:text-2xl font-heading font-semibold">{title}</h2>}
      <div className="flex gap-3 md:gap-5 overflow-x-auto scroll-hidden pb-4">
        {children}
      </div>
    </section>
  )
}
