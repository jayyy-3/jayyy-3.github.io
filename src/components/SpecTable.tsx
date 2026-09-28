import type { Product } from '../types/product';

export default function SpecTable({ product }: { product: Product }) {
  if (!product.specs) {
    return null;
  }

  return (
    <table className="mt-10 w-full border-t border-ink text-small">
      <tbody>
        {Object.entries(product.specs).map(([key, value]) => (
          <tr key={key} className="border-b border-line last:border-0">
            <th className="py-4 pr-4 text-left align-top text-meta font-semibold uppercase tracking-caps text-muted">
              {key}
            </th>
            <td className="py-4 text-copy text-body">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
