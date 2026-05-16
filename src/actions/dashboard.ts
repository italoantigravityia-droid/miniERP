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
        topProducts
      } 
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return { success: false, error: "Falha ao buscar métricas." };
  }
}
