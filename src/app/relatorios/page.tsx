import { getSales } from "@/actions/sale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = 'force-dynamic';

export default async function RelatoriosPage() {
  const response = await getSales();
  const sales = response.success ? response.data : [];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ font: 'var(--md-sys-typescale-headline-large)', margin: 0 }}>Relatórios de Vendas</h2>
      </div>

      <Card>
        <CardContent style={{ padding: 0 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens (Qtd)</TableHead>
                <TableHead>Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales && sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: "center", padding: 32 }}>
                    Nenhuma venda registrada.
                  </TableCell>
                </TableRow>
              ) : (
                sales && sales.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell>#{sale.id}</TableCell>
                    <TableCell>
                      {new Date(sale.data_venda).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {sale.cliente.nome}
                    </TableCell>
                    <TableCell>
                      {sale.items.map((item: any) => (
                        <div key={item.id} style={{ fontSize: 14 }}>
                          {item.produto.nome} ({item.quantidade}x)
                        </div>
                      ))}
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.valor_total))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
