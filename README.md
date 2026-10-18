# Slimepedia

Uma enciclopédia comunitária de World of Slimes, organizada para ajudar jogadores a consultar e comparar informações dos slimes.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Começar

```bash
npm install
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador.

## Scripts

- `npm run dev`: inicia o servidor local de desenvolvimento.
- `npm run build`: verifica os tipos TypeScript e gera a versão de produção em `dist/`.
- `npm run preview`: serve localmente a versão gerada.

## Estrutura

```text
src/
  data/       Registros iniciais da Slimepedia
  lib/        Filtros e ordenação, sem dependência da interface
  main.ts     Renderização e interações da página
  styles.css  Estilos responsivos
```

## Dados do jogo

Os itens atuais são apenas exemplos de interface: não são dados oficiais. Antes de publicar informações canônicas, confirme nomes, atributos, tipos, Traits, skills, drops, localizações e sínteses em fontes confiáveis do jogo.

Os registros ficam como 175 objetos explícitos em `src/data/slimes.ts`, com IDs de 1 a 175. Campos ainda não catalogados são `null`; listas vazias (`[]`) indicam uma lista conhecida sem itens. Sínteses ficam no catálogo independente `src/data/syntheses.ts`, podendo cada slime participar em várias receitas. Tipos, Traits, locais, skills e itens têm catálogos próprios em `src/data/types.ts`, `src/data/traits.ts`, `src/data/locations.ts`, `src/data/skills.ts` e `src/data/items.ts`. São dados locais no cliente nesta etapa, não endpoints HTTP. O modelo `Slime` referencia esses catálogos por ID e usa:

- `type1` e demais informações são opcionais enquanto o registro estiver pendente; `type2` também é opcional para slimes catalogados.
- `locations` como lista de `{ locationId, levelRange, timeOfDay }`, pois cada slime pode ser encontrado em vários lugares e ranges de levels. `locationId` referencia o catálogo de locais, `levelRange` é `{ min, max }` (ex.: `{ min: 1, max: 2 }`) ou `null` quando ainda não foi catalogado, e `timeOfDay` aceita `Day` (padrão), `Night` ou `Both` quando aparece nos dois períodos.
- `traits` como uma lista de zero, uma ou duas Traits (`TraitId[]` limitada pelo tipo `SlimeTraits`), referenciadas pelo catálogo; `skills` e `drops` também são listas de IDs. A propriedade opcional `dropRates` associa cada ID de item a uma porcentagem numérica (0–100); use `null` para uma chance ainda não confirmada, por exemplo `dropRates: { "small-slime-fragment": 5 }`. Drops e itens exigidos nas sínteses usam o catálogo compartilhado de `src/data/items.ts`; cada item tem `type` e `description`, ambos `null` até serem catalogados. Imagens de itens ficam em `public/images/items/` e seus caminhos reutilizáveis são registrados em `src/data/item-images.ts`. Traits incluem `description`; cada skill inclui `mpCost`, `cooldown` e `damage`. Use `null` para valores ainda não confirmados.
- Cada síntese tem `id`, `mainSlimeId`, `subSlimeId`, `requiredLevel`, `ingredients` e `resultSlimeId`. O level da síntese está associado ao Main slime; o Sub slime precisa ter level menor. `requiredLevel` pode ser `null` até ser confirmado; quando informado, identifica o intervalo de level do Main slime, em grupos de três a partir do level 4, e não um limite mínimo cumulativo. Os intervalos continuam para níveis acima dos já catalogados. O simulador só considera receitas conhecidas do mesmo intervalo selecionado, salvo condições explicitamente catalogadas como nível máximo. `ingredients` é `[]` quando está confirmado que nenhum ingredient é necessário, uma lista de itens do tipo `Byproduct` para materiais exigidos ou alternativos, ou `null` quando ainda não foi verificado. Receitas com o mesmo Main slime, Sub slime e níveis em intervalos diferentes são registros distintos e podem produzir resultados diferentes. O campo `synthesis` no slime indica `unavailable`, `unknown` ou `null` quando o estado ainda não foi catalogado; receitas conhecidas são lidas do catálogo independente.

Os slimes das sínteses são referenciados separadamente por seus papéis no jogo: Main slime e Sub slime. Os atributos de batalha foram removidos do modelo e da lista inicial enquanto os dados não forem confirmados.

Na lista inicial, o nome do slime abre sua página de detalhes em `#slime/{id}`. O resumo reúne tipo e Traits; abaixo, a página organiza Stats (aguardando dados) e Drops, todas as sínteses relacionadas, e por fim Localizações e Skills em colunas paralelas. Campos sem informação confirmada são indicados como pendentes. Sprites coloridos extraídos das texturas dos bundles locais do jogo estão em `public/images/slimes/` para os registros com correspondência confirmada; os demais continuam com o avatar ilustrativo.

As páginas `#sinteses` e `#map` estão disponíveis pelo header. Sínteses lista as receitas registradas e inclui um simulador que cruza Main slime, Sub slime, level do Main slime e Ingredients com `src/data/syntheses.ts`; ele apresenta somente resultados existentes nesse catálogo, sem inferir receitas desconhecidas. O simulador mostra a miniatura do slime quando disponível, usando o avatar ilustrativo como fallback, e o número de cada slime escolhido; atualiza as combinações conhecidas à medida que os campos são preenchidos e oferece um botão para limpar os campos. Map permite buscar locais cadastrados e consultar os slimes já associados em seus registros. O painel cartográfico é apenas um mockup visual: coordenadas reais ainda não foram catalogadas.

## Próximas etapas sugeridas

1. Confirmar o esquema dos dados e reunir fontes verificáveis para cada slime.
2. Substituir os registros demonstrativos e adicionar imagens autorizadas ou próprias.
3. Criar páginas de detalhe e navegação por tipo/localização conforme o conteúdo crescer.
4. Adicionar testes para filtros e ordenação quando os dados e regras estiverem definidos.
