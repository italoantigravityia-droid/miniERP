"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            produto: true
          }
        }
      }
    });

    const totalOrders = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.valor_total), 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Buscar total de clientes cadastrados
    const totalCustomers = await prisma.customer.count();

    // Buscar total de produtos e estoque baixo (<= 5)
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({
      where: {
        estoque: {
          lte: 5
        }
      }
    });

    // Calcular dados para o gráfico dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSales = await prisma.sale.findMany({
      where: {
        data_venda: {
          gte: sevenDaysAgo
        }
      }
    });

    const dailyRevenue: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      dailyRevenue[dateStr] = 0;
    }

    recentSales.forEach(sale => {
      const dateStr = new Date(sale.data_venda).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += Number(sale.valor_total);
      }
    });

    const salesHistory = Object.entries(dailyRevenue).map(([date, value]) => ({
      date,
      value
    }));

    // Calculate top 5 products by quantity sold
    const productSales: Record<string, { nome: string, quantidade: number, receita: number }> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prodId = String(item.produto_id);
        if (!productSales[prodId]) {
          productSales[prodId] = {
            nome: item.produto.nome,
            quantidade: 0,
            receita: 0
          };
        }
        productSales[prodId].quantidade += item.quantidade;
        productSales[prodId].receita += (item.quantidade * Number(item.preco_aplicado));
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    return { 
      success: true, 
      data: {
        totalOrders,
        totalRevenue,
        averageTicket,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        salesHistory,
        topProducts
      } 
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return { success: false, error: "Falha ao buscar métricas." };
  }
}
