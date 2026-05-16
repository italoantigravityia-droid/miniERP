import { getCustomers } from "@/actions/customer";
import { getProducts } from "@/actions/product";
import { ClientPage } from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function PDVPage() {
  const [customersRes, productsRes] = await Promise.all([
    getCustomers(),
    getProducts()
  ]);

  const customers = customersRes.success ? customersRes.data : [];
  const products = productsRes.success ? productsRes.data?.map(p => ({
    ...p,
    preco_unitario: Number(p.preco_unitario)
  })) : [];

  return <ClientPage customers={customers || []} products={products || []} />;
}
