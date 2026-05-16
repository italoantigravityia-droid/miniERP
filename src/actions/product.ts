"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de validação no lado do servidor (Backend)
// Protege a API contra inserções de dados inválidos caso seja chamada fora do Frontend.
const productServerSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres."),
  preco_unitario: z.coerce.number().positive("O preço unitário deve ser maior que zero."), // .positive() exige > 0
  estoque: z.coerce.number().int("Estoque deve ser número inteiro.").min(0, "O estoque não pode ser negativo."),
});

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { nome: "asc" },
    });
    return { success: true, data: products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Falha ao buscar produtos." };
  }
}

export async function createProduct(data: { nome: string; preco_unitario: number; estoque: number }) {
  try {
    // 1. Validação dos dados de entrada
    const validatedData = productServerSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    // 2. Interação com Banco de Dados
    const product = await prisma.product.create({
      data: {
        nome: validatedData.data.nome,
        preco_unitario: validatedData.data.preco_unitario,
        estoque: validatedData.data.estoque,
      },
    });
    
    // 3. Revalidação de cache
    revalidatePath("/produtos");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Falha ao criar produto." };
  }
}

export async function updateProduct(id: number, data: { nome: string; preco_unitario: number; estoque: number }) {
  try {
    const validatedData = productServerSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        nome: validatedData.data.nome,
        preco_unitario: validatedData.data.preco_unitario,
        estoque: validatedData.data.estoque,
      },
    });
    
    revalidatePath("/produtos");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Falha ao atualizar produto." };
  }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/produtos");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    // Tratamento de Erros Amigável
    if (error.code === 'P2003') {
      return { success: false, error: "Não é possível excluir este produto pois ele já foi vendido." };
    }
    return { success: false, error: "Falha ao excluir produto." };
  }
}
