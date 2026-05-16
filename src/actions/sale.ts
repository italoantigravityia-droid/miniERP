"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSales() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        cliente: true,
        items: {
          include: {
            produto: true
          }
        }
      },
      orderBy: { data_venda: "desc" },
    });
    return { success: true, data: sales };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { success: false, error: "Falha ao buscar vendas." };
  }
}

export async function createSale(data: { cliente_id: number; items: { produto_id: number; quantidade: number }[] }) {
  if (!data.cliente_id) {
    return { success: false, error: "É obrigatório selecionar um cliente." };
  }

  if (!data.items || data.items.length === 0) {
    return { success: false, error: "A venda deve conter pelo menos um item." };
  }

  for (const item of data.items) {
    if (item.quantidade < 1) {
      return { success: false, error: "A quantidade de cada item deve ser pelo menos 1." };
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validate customer
      const customer = await tx.customer.findUnique({ where: { id: data.cliente_id } });
      if (!customer) throw new Error("Cliente não encontrado.");

      let valor_total = 0;
      const saleItemsData = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.produto_id } });
        if (!product) throw new Error(`Produto ID ${item.produto_id} não encontrado.`);
        
        if (product.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${product.nome}.`);
        }

        const preco_aplicado = Number(product.preco_unitario);
        valor_total += preco_aplicado * item.quantidade;

        saleItemsData.push({
          produto_id: product.id,
          quantidade: item.quantidade,
          preco_aplicado: preco_aplicado
        });

        // Update stock
        await tx.product.update({
          where: { id: product.id },
          data: { estoque: { decrement: item.quantidade } }
        });
      }

      // Create Sale
      const sale = await tx.sale.create({
        data: {
          cliente_id: data.cliente_id,
          valor_total,
          items: {
            create: saleItemsData
          }
        }
      });

      return sale;
    });

    revalidatePath("/pdv");
    revalidatePath("/produtos");
    revalidatePath("/relatorios");
    revalidatePath("/"); // dashboard
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating sale:", error);
    return { success: false, error: error.message || "Falha ao registrar a venda." };
  }
}
