import type { Product } from '../types/product';

export default function SpecTable({ product }: { product: Product }) {
    if (!product.specs) return null;

    return (
        <table className="mt-8 w-full text-sm border-t">
            <tbody>
            {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-b last:border-0">
                    <th className="py-2 pr-4 text-left font-medium">{k}</th>
                    <td className="py-2">{v}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
