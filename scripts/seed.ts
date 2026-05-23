const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando carga de dados de Cidades (IBGE)...");
  
  try {
    const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios");
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do IBGE: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const cities = data.map((city: any) => {
      let uf = "";
      if (city.microrregiao && city.microrregiao.mesorregiao && city.microrregiao.mesorregiao.UF) {
        uf = city.microrregiao.mesorregiao.UF.sigla;
      } else if (city['regiao-imediata'] && city['regiao-imediata']['regiao-intermediaria'] && city['regiao-imediata']['regiao-intermediaria'].UF) {
        uf = city['regiao-imediata']['regiao-intermediaria'].UF.sigla;
      }

      return {
        id: city.id,
        nome: city.nome,
        uf: uf
      };
    }).filter((c: any) => c.id && c.nome && c.uf);

    console.log(`Baixados ${cities.length} municípios. Limpando tabela e inserindo no banco de dados...`);

    // Verificar se já existem cidades para evitar erro de chave estrangeira e lentidão no deploy
    const cityCount = await prisma.city.count();
    if (cityCount > 0) {
      console.log(`Tabela de Cidades já possui ${cityCount} registros. Pulando seed.`);
      return;
    }

    const chunkSize = 500;
    for (let i = 0; i < cities.length; i += chunkSize) {
      const chunk = cities.slice(i, i + chunkSize);
      await prisma.city.createMany({
        data: chunk
      });
      console.log(`Inseridos ${Math.min(i + chunkSize, cities.length)} de ${cities.length}`);
    }

    console.log("Carga de Cidades concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante o seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
