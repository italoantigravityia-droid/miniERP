import { getCustomers } from "@/actions/customer";
import { ClientPage } from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const response = await getCustomers();
  const customers = response.success ? response.data : [];

  return <ClientPage initialCustomers={customers || []} />;
}
