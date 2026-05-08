import type { Product } from '../types/product';

export default function SpecTable({ product }: { product: Product }) {
  if (!product.specs) {
    return null;
  }

  return (
    <table className="mt-10 w-full border-t border-black/15 text-sm">
      <tbody>
        {Object.entries(product.specs).map(([key, value]) => (
          <tr key={key} className="border-b border-black/10 last:border-0">
            <th className="py-4 pr-4 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-black/60">
              {key}
            </th>
            <td className="py-4 text-[15px] leading-7 text-[var(--urblo-text)]">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
