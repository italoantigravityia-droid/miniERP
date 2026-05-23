import { getDashboardMetrics } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { DollarSign, ShoppingBag, TrendingUp, Users, Package, AlertTriangle, Coins } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const response = await getDashboardMetrics();
  const {
    totalOrders = 0,
    totalRevenue = 0,
    averageTicket = 0,
    totalCustomers = 0,
    totalProducts = 0,
    lowStockProducts = 0,
    salesHistory = [],
    topProducts = []
  } = response.success && response.data ? response.data : {
    totalOrders: 0,
    totalRevenue: 0,
    averageTicket: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    salesHistory: [],
    topProducts: []
  };

  // Calcular pontos para o gráfico SVG de Faturamento
  const hasHistory = salesHistory && salesHistory.length > 0;
  const maxValue = hasHistory ? Math.max(...salesHistory.map(s => s.value), 100) : 100;
  const width = 600;
  const height = 180;
  const paddingBottom = 30;
  const paddingTop = 20;
  const graphHeight = height - paddingBottom - paddingTop;

  // Gerar coordenadas dos pontos do gráfico
  const points = hasHistory
    ? salesHistory.map((s, i) => {
        const x = (i * width) / (salesHistory.length - 1 || 1);
        const y = height - paddingBottom - (s.value * graphHeight) / maxValue;
        return `${x},${y}`;
      }).join(" ")
    : "";

  // Gerar área sob a linha para o gradiente
  const areaPoints = hasHistory
    ? `0,${height - paddingBottom} ${points} ${width},${height - paddingBottom}`
    : "";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Cabeçalho do Dashboard */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--md-sys-color-on-background)', margin: '0 0 4px 0' }}>
          Dashboard do Sistema
        </h1>
        <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
          Resumo geral da saúde financeira e comercial do miniERP.
        </p>
      </div>

      {/* Grid de KPIs - 4 Cartões Principais */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16
      }}>
        {/* KPI 1: Faturamento Total */}
        <Card style={{ backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)' }}>
          <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit', fontSize: 16 }}>
              <DollarSign size={20} /> Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
            </div>
            <p style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>Total acumulado de vendas</p>
          </CardContent>
        </Card>

        {/* KPI 2: Quantidade de Pedidos */}
        <Card>
          <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
              <ShoppingBag size={20} color="var(--md-sys-color-primary)" /> Volume de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--md-sys-color-on-surface)' }}>
              {totalOrders}
            </div>
            <p style={{ marginTop: 4, fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)' }}>Vendas finalizadas no total</p>
          </CardContent>
        </Card>

        {/* KPI 3: Ticket Médio */}
        <Card>
          <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
              <Coins size={20} color="var(--md-sys-color-primary)" /> Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--md-sys-color-on-surface)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
            </div>
            <p style={{ marginTop: 4, fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)' }}>Média de valor por venda</p>
          </CardContent>
        </Card>

        {/* KPI 4: Estoque Crítico */}
        <Card style={lowStockProducts > 0 ? { border: '1px solid var(--md-sys-color-error)' } : {}}>
          <CardHeader style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
              {lowStockProducts > 0 ? (
                <AlertTriangle size={20} color="var(--md-sys-color-error)" />
              ) : (
                <Package size={20} color="var(--md-sys-color-primary)" />
              )}
              Estoque Crítico
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 12 }}>
            <div style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: lowStockProducts > 0 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface)'
            }}>
              {lowStockProducts}
            </div>
            <p style={{
              marginTop: 4,
              fontSize: 12,
              color: lowStockProducts > 0 ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'
            }}>
              {lowStockProducts > 0 ? 'Produtos com menos de 5 unidades' : 'Todos os estoques regularizados'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Gráficos e Detalhes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24
      }}>
        {/* Gráfico 1: Evolução das Vendas (7 dias) */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={22} color="var(--md-sys-color-primary)" /> Faturamento Semanal
            </CardTitle>
            <CardDescription>Evolução financeira nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, padding: 16 }}>
            {hasHistory ? (
              <div style={{ width: '100%' }}>
                <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="200" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Linhas de fundo */}
                  <line x1="0" y1={paddingTop} x2={width} y2={paddingTop} stroke="var(--md-sys-color-outline-variant)" strokeDasharray="4 4" />
                  <line x1="0" y1={(height - paddingBottom + paddingTop) / 2} x2={width} y2={(height - paddingBottom + paddingTop) / 2} stroke="var(--md-sys-color-outline-variant)" strokeDasharray="4 4" />
                  <line x1="0" y1={height - paddingBottom} x2={width} y2={height - paddingBottom} stroke="var(--md-sys-color-outline-variant)" />

                  {/* Área preenchida */}
                  <polygon points={areaPoints} fill="url(#areaGradient)" />

                  {/* Linha do gráfico */}
                  <polyline points={points} fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Círculos e Valores */}
                  {salesHistory.map((s, i) => {
                    const x = (i * width) / (salesHistory.length - 1 || 1);
                    const y = height - paddingBottom - (s.value * graphHeight) / maxValue;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="var(--md-sys-color-primary)" stroke="var(--md-sys-color-surface-container-lowest)" strokeWidth="2.5" />
                        {s.value > 0 && (
                          <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--md-sys-color-on-background)">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(s.value)}
                          </text>
                        )}
                        <text x={x} y={height - 8} textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--md-sys-color-on-surface-variant)">
                          {s.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: 14 }}>
                Nenhuma venda registrada nos últimos 7 dias.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Adicionais e Top 5 Produtos */}
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CardHeader style={{ paddingBottom: 8 }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={22} color="var(--md-sys-color-primary)" /> Distribuição de Vendas
            </CardTitle>
            <CardDescription>Resumo dos produtos mais comercializados</CardDescription>
          </CardHeader>
          <CardContent style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Resumo rápido */}
            <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--md-sys-color-on-surface-variant)', fontSize: 13 }}>
                  <Users size={14} /> Clientes Cadastrados
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 2, color: 'var(--md-sys-color-on-surface)' }}>
                  {totalCustomers}
                </div>
              </div>
              <div style={{ width: 1, backgroundColor: 'var(--md-sys-color-outline-variant)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--md-sys-color-on-surface-variant)', fontSize: 13 }}>
                  <Package size={14} /> Total de Itens no Catálogo
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 2, color: 'var(--md-sys-color-on-surface)' }}>
                  {totalProducts}
                </div>
              </div>
            </div>

            {/* Listagem visual do Top 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--md-sys-color-on-surface-variant)' }}>
                TOP PRODUTOS POR FATURAMENTO
              </div>
              {!topProducts || topProducts.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', fontSize: 14 }}>
                  Nenhum produto vendido ainda.
                </div>
              ) : (
                topProducts.map((product, index) => {
                  const maxRevenue = Math.max(...topProducts.map(p => p.receita), 1);
                  const widthPercent = (product.receita / maxRevenue) * 100;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ fontWeight: '500', color: 'var(--md-sys-color-on-surface)' }}>
                          {index + 1}º {product.nome}
                        </span>
                        <span style={{ fontWeight: 'bold', color: 'var(--md-sys-color-primary)' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.receita)}
                          <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--md-sys-color-on-surface-variant)', marginLeft: 6 }}>
                            ({product.quantidade} un.)
                          </span>
                        </span>
                      </div>
                      {/* Barra de Progresso Customizada */}
                      <div style={{
                        width: '100%',
                        height: 8,
                        backgroundColor: 'var(--md-sys-color-surface-container-high)',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${widthPercent}%`,
                          height: '100%',
                          backgroundColor: 'var(--md-sys-color-primary)',
                          borderRadius: 4,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Top 5 Produtos (Tabela Detalhada) */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: 18 }}>Tabela Detalhada de Desempenho</CardTitle>
          <CardDescription>Lista com unidades vendidas e valores acumulados</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 60 }}>#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Quantidade Vendida</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Total Faturado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!topProducts || topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center', padding: 32 }}>
                    Sem dados comerciais suficientes.
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ fontWeight: 'bold', color: 'var(--md-sys-color-primary)' }}>{index + 1}º</TableCell>
                    <TableCell style={{ fontWeight: '500' }}>{product.nome}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{product.quantidade} unidades</TableCell>
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
