"use server";

import { prisma } from "@/lib/prisma";

export async function searchCities(query: string) {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: [] }; // Don't fetch if query is too short
    }

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

    return { success: true, data: cities };
  } catch (error) {
    console.error("Error searching cities:", error);
    return { success: false, error: "Falha ao buscar cidades." };
  }
}
