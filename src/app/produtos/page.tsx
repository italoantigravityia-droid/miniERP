import { getProducts } from "@/actions/product";
import { ClientPage } from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function ProdutosPage() {
  const response = await getProducts();
  // Prisma returns Decimal, which can cause hydration issues if not serialized.
  // We'll map them to strings or numbers before passing to client component.
  const products = response.success ? response.data?.map(p => ({
    ...p,
    preco_unitario: Number(p.preco_unitario)
  })) : [];

  return <ClientPage initialProducts={products || []} />;
}
