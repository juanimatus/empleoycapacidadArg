export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i}>
            {item}
            <em>·</em>
          </span>
        ))}
      </div>
    </div>
  );
}
