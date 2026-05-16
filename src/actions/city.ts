"use server";

import { prisma } from "@/lib/prisma";

export async function searchCities(query: string) {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: [] }; // Don't fetch if query is too short
    }

    console.log(`[CITY_SEARCH] Buscando cidades por: "${query}"`);

    const cities = await prisma.city.findMany({
      where: {
        nome: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: 20, // Limit to top 20 to keep it fast
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`[CITY_SEARCH] Resultados encontrados: ${cities.length}`);
    return { success: true, data: cities };
  } catch (error: any) {
    console.error("[CITY_SEARCH] Erro fatal na busca:", error.message || error);
    return { success: false, error: "Falha ao buscar cidades." };
  }
}
