"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de validação no lado do servidor (Backend)
// Protege a API contra inserções de dados inválidos caso seja chamada fora do Frontend.
const customerServerSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres."),
  documento: z.string().trim().min(11, "Documento inválido."),
  email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")).or(z.null()),
  telefone: z.string().trim().optional().or(z.literal("")).or(z.null()),
  cidade_id: z.coerce.number({ invalid_type_error: "Selecione uma cidade válida." }),
});

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        cidade: true
      },
      orderBy: { nome: "asc" },
    });
    return { success: true, data: customers };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, error: "Falha ao buscar clientes." };
  }
}

export async function createCustomer(data: { nome: string; documento: string; email?: string | null; telefone?: string | null; cidade_id: number }) {
  try {
    // 1. Validação dos dados de entrada
    const validatedData = customerServerSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    // 2. Interação com o Banco de Dados
    const customer = await prisma.customer.create({
      data: {
        nome: validatedData.data.nome,
        documento: validatedData.data.documento,
        email: validatedData.data.email || null,
        telefone: validatedData.data.telefone || null,
        cidade_id: validatedData.data.cidade_id,
      },
    });
    
    // 3. Revalidação de cache
    revalidatePath("/clientes");
    return { success: true, data: customer };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    // Tratamento de Erros Amigável
    if (error.code === 'P2002') {
      return { success: false, error: "Já existe um cliente cadastrado com este documento." };
    }
    return { success: false, error: "Falha ao criar cliente." };
  }
}

export async function updateCustomer(id: number, data: { nome: string; documento: string; email?: string | null; telefone?: string | null; cidade_id: number }) {
  try {
    const validatedData = customerServerSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        nome: validatedData.data.nome,
        documento: validatedData.data.documento,
        email: validatedData.data.email || null,
        telefone: validatedData.data.telefone || null,
        cidade_id: validatedData.data.cidade_id,
      },
    });
    
    revalidatePath("/clientes");
    return { success: true, data: customer };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Já existe outro cliente com este documento." };
    }
    return { success: false, error: "Falha ao atualizar cliente." };
  }
}

export async function deleteCustomer(id: number) {
  try {
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath("/clientes");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    if (error.code === 'P2003') {
      return { success: false, error: "Não é possível excluir este cliente pois existem vendas associadas a ele." };
    }
    return { success: false, error: "Falha ao excluir cliente." };
  }
}
