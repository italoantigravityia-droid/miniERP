import { getDashboardMetrics } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const response = await getDashboardMetrics();
  const metrics = response.success ? response.data : { totalOrders: 0, totalRevenue: 0, topProducts: [] };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Total Revenue Card */}
        <Card style={{ flex: 1, backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)' }}>
          <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
              <DollarSign size={24} /> Total de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.totalRevenue || 0)}
            </div>
            <p style={{ marginTop: 8, opacity: 0.8 }}>Receita bruta acumulada</p>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card style={{ flex: 1 }}>
          <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={24} color="var(--md-sys-color-primary)" /> Quantidade de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: 'var(--md-sys-color-on-surface)' }}>
              {metrics?.totalOrders || 0}
            </div>
            <p style={{ marginTop: 8, color: 'var(--md-sys-color-on-surface-variant)' }}>Pedidos finalizados com sucesso</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={24} color="var(--md-sys-color-primary)" /> Top 5 Produtos Mais Vendidos
          </CardTitle>
          <CardDescription>Produtos com maior volume de saída</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 50 }}>#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Unidades Vendidas</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Receita Gerada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!metrics?.topProducts || metrics.topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center', padding: 32 }}>
                    Não há dados de vendas suficientes.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.topProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ fontWeight: 'bold', color: 'var(--md-sys-color-primary)' }}>{index + 1}º</TableCell>
                    <TableCell style={{ fontWeight: '500' }}>{product.nome}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{product.quantidade} un.</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.receita)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
