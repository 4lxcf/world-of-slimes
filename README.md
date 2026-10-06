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
- `traits` como uma lista de zero, uma ou duas Traits (`TraitId[]` limitada pelo tipo `SlimeTraits`), referenciadas pelo catálogo; `skills` e `drops` também são listas de IDs. Drops e itens exigidos nas sínteses usam o catálogo compartilhado de `src/data/items.ts`; cada item tem `type` e `description`, ambos `null` até serem catalogados. Traits incluem `description`; cada skill inclui `mpCost`, `cooldown` e `damage`. Use `null` para valores ainda não confirmados.
- Cada síntese tem `id`, `slimeIds` (par sem ordem), `requiredLevel`, `requiredItems` e `resultSlimeId`. `requiredLevel` pode ser `null` até ser confirmado. `requiredItems` é uma lista de itens necessários, `[]` quando está confirmado que nenhum item é necessário ou `null` quando ainda não foi verificado. Receitas com o mesmo par de slimes e levels diferentes são registros distintos e podem produzir resultados diferentes. O campo `synthesis` no slime indica `unavailable`, `unknown` ou `null` quando o estado ainda não foi catalogado; receitas conhecidas são lidas do catálogo independente.

Os dois IDs em `slimeIds` são ingredientes equivalentes: a ordem não altera a combinação. Os slimes são relacionados por IDs, sem duplicar nomes. Os atributos de batalha foram removidos do modelo e da lista inicial enquanto os dados não forem confirmados.

Na lista inicial, o nome do slime abre sua página de detalhes em `#slime/{id}`. A página apresenta tipos, localizações e horários, Traits, skills, drops e todas as sínteses relacionadas ao slime. Campos sem informação confirmada são indicados como pendentes.

## Próximas etapas sugeridas

1. Confirmar o esquema dos dados e reunir fontes verificáveis para cada slime.
2. Substituir os registros demonstrativos e adicionar imagens autorizadas ou próprias.
3. Criar páginas de detalhe e navegação por tipo/localização conforme o conteúdo crescer.
4. Adicionar testes para filtros e ordenação quando os dados e regras estiverem definidos.
