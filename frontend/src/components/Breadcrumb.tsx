import { Link } from 'react-router-dom';

export default function Breadcrumb({
  items,
}: {
  items: { label: string; to?: string }[];
}) {
  return (
    <div className="text-xs text-gray-600">
      {items.map((it, i) => (
        <span key={i}>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
          {i < items.length - 1 && <span className="mx-1">/</span>}
        </span>
      ))}
    </div>
  );
}
