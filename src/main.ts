import { slimes, type Slime } from "./data/slimes";
import { slimeImages } from "./data/slime-images";
import { itemImages } from "./data/item-images";
import { items, type ItemId } from "./data/items";
import { locations } from "./data/locations";
import { skills, type Skill, type SkillCategory, type SkillRange } from "./data/skills";
import { syntheses } from "./data/syntheses";
import { traits } from "./data/traits";
import { slimeTypes, type SlimeTypeId } from "./data/types";
import { getSlimeList, type SortKey } from "./lib/slime-list";
import "./styles.css";

function getRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Não foi possível encontrar o elemento "${selector}".`);
  }
  return element;
}

const app = getRequiredElement<HTMLDivElement>("#app");

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function hasKnownSlimeIdentity(slime: Pick<Slime, "name" | "type1" | "type2">): boolean {
  return typeof slime.name === "string" && slime.name.trim().length > 0 && (slime.type1 !== null || slime.type2 !== null);
}

function getTraitStatusText(slime: Pick<Slime, "name" | "type1" | "type2">): string {
  return hasKnownSlimeIdentity(slime) ? "—" : "A catalogar";
}

function renderTraitCell(slime: Slime): string {
  if (slime.traits === null || slime.traits === undefined || slime.traits.length === 0) {
    return `<span class="type-empty">${escapeHtml(getTraitStatusText(slime))}</span>`;
  }

  const traits = slime.traits.map((traitId) => {
    const name = traitNames.get(traitId);
    if (!name) {
      throw new Error(`Trait não cadastrada: ${traitId}`);
    }
    return `<li>${escapeHtml(name)}</li>`;
  }).join("");
  return `<ul class="detail-list trait-cell-list">${traits}</ul>`;
}

const slimesById = new Map(slimes.map((slime) => [slime.id, slime]));
const itemsById = new Map(items.map((item) => [item.id, item]));
const locationsById = new Map(locations.map((location) => [location.id, location]));
const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
const typeNames = new Map(slimeTypes.map(({ id, name }) => [id, name]));
const traitNames = new Map(traits.map(({ id, name }) => [id, name]));
const featuredSlimeIds = [104, 107, 105, 108, 115];
const featuredSlimes = featuredSlimeIds.map((id) => {
  const slime = slimesById.get(id);
  if (!slime || !slime.name || !slimeImages[id]) {
    throw new Error(`Dados incompletos para o slime em destaque #${id}.`);
  }
  return slime;
});

function renderFeaturedSlime(slime: Slime, index: number): string {
  const imagePath = slimeImages[slime.id];
  if (!imagePath || !slime.name) {
    throw new Error(`Dados incompletos para o slime em destaque #${slime.id}.`);
  }
  const types = [slime.type1, slime.type2]
    .filter((type): type is SlimeTypeId => type !== null)
    .map((type) => `<span class="type-tag type-tag-${escapeHtml(type)}"><i></i>${escapeHtml(getTypeName(type))}</span>`)
    .join("");

  return `<article class="hero-slide" data-hero-slide aria-label="${index + 1} de ${featuredSlimes.length}" aria-roledescription="slide"${index === 0 ? "" : " hidden"}>
    <a class="hero-slide-link" href="#slime/${slime.id}" aria-label="${escapeHtml(slime.name)}, ID ${String(slime.id).padStart(3, "0")}, tipos ${[slime.type1, slime.type2].filter((type): type is SlimeTypeId => type !== null).map(getTypeName).join(" e ")}">
      <img class="hero-slide-image" src="${imagePath}" alt="${escapeHtml(slime.name)}" decoding="async">
      <div class="hero-slide-info">
        <span class="hero-slide-id">ID #${String(slime.id).padStart(3, "0")}</span>
        <h2>${escapeHtml(slime.name)}</h2>
        <div class="hero-slide-types">${types}</div>
      </div>
    </a>
  </article>`;
}

app.innerHTML = `
  <div class="site-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Slimepedia, página inicial">
        <span class="brand-mark" aria-hidden="true"><span></span></span>
        <span class="brand-name">slimepedia<span>.</span></span>
      </a>
      <nav class="topnav" id="primary-navigation" aria-label="Navegação principal">
        <a class="topnav-link" href="#slimes">Slimepedia</a>
        <a class="topnav-link" href="#skills">Skills</a>
        <a class="topnav-link" href="#sinteses">Sínteses</a>
        <a class="topnav-link" href="#map">Map</a>
      </nav>
      <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-controls="primary-navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <span class="game-label"><span class="status-dot"></span> WORLD OF SLIMES</span>
    </header>

    <main id="home-content">
      <section class="intro" id="intro">
        <div class="intro-copy">
          <p class="eyebrow"><span class="eyebrow-line"></span> GUIA DA COMUNIDADE</p>
          <h1>Conheça cada<br /><span>slime.</span></h1>
          <p class="intro-description">Seu guia para descobrir, comparar e encontrar os slimes de World of Slimes.</p>
        </div>
        <div class="hero-art">
          <div class="hero-showcase">
            <p class="hero-showcase-label"><span aria-hidden="true">✦</span> DESCOBERTAS RECENTES</p>
            <section class="hero-carousel" id="featured-slimes" aria-label="Últimos slimes identificados" aria-roledescription="carrossel">
              <div class="hero-carousel-track" aria-live="off">
                ${featuredSlimes.map(renderFeaturedSlime).join("")}
              </div>
              <div class="hero-carousel-progress" aria-hidden="true"><span class="hero-carousel-progress-bar"></span></div>
            </section>
          </div>
        </div>
      </section>

      <section class="catalog" id="slimes" aria-labelledby="catalog-heading">
        <div class="catalog-heading">
          <div>
            <p class="eyebrow"><span class="eyebrow-line"></span> A ENCICLOPÉDIA</p>
            <h2 id="catalog-heading">Slimepedia <span class="heading-count" id="total-count"></span></h2>
          </div>
          <p class="catalog-note">Tudo o que você precisa saber,<br />em um só lugar.</p>
        </div>

        <div class="demo-notice" role="note">
          <span class="notice-icon" aria-hidden="true">i</span>
          <p><strong>Catálogo em construção.</strong> Os registros ainda sem dados estão marcados como pendentes; informações não confirmadas não foram inventadas.</p>
        </div>

        <div class="toolbar">
          <label class="search-box">
            <span class="sr-only">Buscar por nome ou número</span>
            <span class="search-icon" aria-hidden="true"></span>
            <input id="search" type="search" placeholder="Buscar slime por nome ou número..." autocomplete="off" />
            <kbd>/</kbd>
          </label>
          <label class="select-wrap">
            <span class="sr-only">Filtrar por tipo</span>
            <select id="type-filter">
              <option value="all">Todas as categorias</option>
              ${slimeTypes.map(({ id, name }) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`).join("")}
            </select>
            <span class="select-chevron" aria-hidden="true">⌄</span>
          </label>
          <label class="select-wrap sort-wrap">
            <span class="sr-only">Ordenar lista</span>
            <select id="sort-by">
              <option value="id">Número: menor primeiro</option>
              <option value="name">Nome: A a Z</option>
            </select>
            <span class="select-chevron" aria-hidden="true">⌄</span>
          </label>
        </div>

        <div class="table-frame">
          <table>
            <thead>
              <tr>
                <th scope="col">Nº</th>
                <th scope="col">Slime</th>
                <th scope="col">Tipo 1</th>
                <th scope="col">Tipo 2</th>
                <th scope="col">Traits</th>
              </tr>
            </thead>
            <tbody id="slime-rows"></tbody>
          </table>
          <div class="empty-state" id="empty-state" hidden>
            <span aria-hidden="true">⌕</span>
            <strong>Nenhum slime encontrado</strong>
            <p>Tente buscar por outro nome ou ajustar os filtros.</p>
          </div>
        </div>
        <div class="list-footer">
          <span id="result-count" aria-live="polite"></span>
          <span class="footer-legend"><i></i> Dados demonstrativos</span>
        </div>
      </section>
    </main>
    <main id="detail-screen" class="detail-screen" hidden></main>
    <main id="section-screen" class="section-screen" hidden></main>

    <footer class="footer">
      <a class="brand footer-brand" href="#">
        <span class="brand-mark" aria-hidden="true"><span></span></span>
        <span class="brand-name">slimepedia<span>.</span></span>
      </a>
      <p>Feito por fãs, para fãs. Um projeto independente da comunidade.</p>
      <span class="footer-year">WORLD OF SLIMES · 2026</span>
    </footer>
  </div>
`;

const searchInput = getRequiredElement<HTMLInputElement>("#search");
const typeFilter = getRequiredElement<HTMLSelectElement>("#type-filter");
const sortSelect = getRequiredElement<HTMLSelectElement>("#sort-by");
const rows = getRequiredElement<HTMLTableSectionElement>("#slime-rows");
const emptyState = getRequiredElement<HTMLDivElement>("#empty-state");
const resultCount = getRequiredElement<HTMLSpanElement>("#result-count");
const totalCount = getRequiredElement<HTMLSpanElement>("#total-count");
const homeContent = getRequiredElement<HTMLElement>("#home-content");
const detailScreen = getRequiredElement<HTMLElement>("#detail-screen");
const sectionScreen = getRequiredElement<HTMLElement>("#section-screen");
const primaryNavigation = getRequiredElement<HTMLElement>("#primary-navigation");
const menuToggle = getRequiredElement<HTMLButtonElement>(".menu-toggle");
const heroCarousel = getRequiredElement<HTMLElement>("#featured-slimes");
const heroSlides = [...heroCarousel.querySelectorAll<HTMLElement>("[data-hero-slide]")];
const heroCarouselProgress = getRequiredElement<HTMLElement>(".hero-carousel-progress-bar");
let activeHeroSlideIndex = 0;
const HERO_SLIDE_DURATION_MS = 10_000;
let selectedMapLocationId: string = locations[0]?.id ?? "";
let selectedSynthesisItem: ItemId | null = null;

const SYNTHESIS_LEVEL_MIN = 4;
const SYNTHESIS_LEVELS_PER_RANGE = 3;

function getSynthesisLevelRange(level: number): { min: number; max: number } | null {
  if (!Number.isInteger(level) || level < SYNTHESIS_LEVEL_MIN) {
    return null;
  }
  const rangeMin = SYNTHESIS_LEVEL_MIN +
    Math.floor((level - SYNTHESIS_LEVEL_MIN) / SYNTHESIS_LEVELS_PER_RANGE) * SYNTHESIS_LEVELS_PER_RANGE;
  return {
    min: rangeMin,
    max: rangeMin + SYNTHESIS_LEVELS_PER_RANGE - 1,
  };
}

function formatSynthesisLevel(level: number | null): string {
  if (level === null) {
    return "Level a confirmar";
  }
  const range = getSynthesisLevelRange(level);
  return range
    ? `Lv. ${range.min}–${range.max}`
    : `Level ${level} fora do intervalo disponível`;
}

function getSynthesisIngredientsLabel(
  ingredientIds: ItemId[] | null,
  ingredientStatus: (typeof syntheses)[number]["ingredientStatus"] = "undetermined",
): string {
  if (ingredientIds === null) {
    return ingredientStatus === "required-undiscovered"
      ? "O ingrediente necessário ainda não foi descoberto"
      : "Ainda não foi possível confirmar se precisa de ingrediente";
  }
  if (ingredientIds.length === 0) {
    return "No ingredients";
  }
  const ingredientNames = ingredientIds.map((itemId) => {
    const item = itemsById.get(itemId);
    if (!item) {
      throw new Error(`Item não cadastrado na receita: ${itemId}`);
    }
    return item.name;
  });
  return ingredientNames.length === 1
    ? ingredientNames[0]
    : `Any one of: ${ingredientNames.join(", ")}`;
}

function formatRecipeLevel(recipe: (typeof syntheses)[number]): string {
  if (recipe.minimumMainLevel !== null) {
    return `Level mínimo do Main slime: Lv. ${recipe.minimumMainLevel}`;
  }
  return formatSynthesisLevel(recipe.requiredLevel);
}

function isSortKey(value: string): value is SortKey {
  return value === "id" || value === "name";
}

function getSelectedType(value: string): SlimeTypeId | "all" {
  if (value === "all") {
    return value;
  }

  const type = slimeTypes.find(({ id }) => id === value);
  if (!type) {
    throw new Error(`Tipo selecionado não cadastrado: ${value}`);
  }
  return type.id;
}

function getTypeName(typeId: SlimeTypeId): string {
  const name = typeNames.get(typeId);
  if (!name) {
    throw new Error(`Tipo de slime não cadastrado: ${typeId}`);
  }
  return name;
}

function renderSlimeLink(slimeId: number): string {
  const slime = slimesById.get(slimeId);
  if (!slime) {
    throw new Error(`Síntese referencia slime inexistente: #${slimeId}`);
  }
  return `<a class="detail-slime-link" href="#slime/${slime.id}">${escapeHtml(slime.name ?? `Slime #${String(slime.id).padStart(3, "0")}`)}</a>`;
}

function renderDetailLocations(slime: Slime): string {
  if (slime.locations === null) {
    return '<p class="detail-unknown">A catalogar</p>';
  }
  if (slime.locations.length === 0) {
    return '<p class="detail-unknown">Nenhuma localização registrada</p>';
  }

  return `<ul class="detail-list">${slime.locations.map(({ locationId, levelRange, timeOfDay }) => {
    const location = locationsById.get(locationId);
    if (!location) {
      throw new Error(`Local não cadastrado: ${locationId}`);
    }
    const level = levelRange ? `Level ${levelRange.min}-${levelRange.max}` : "Level não informado";
    const timeIcons = `${timeOfDay !== "Night" ? '<span class="location-time-icon" role="img" aria-label="Day" title="Day">☀</span>' : ""}${timeOfDay !== "Day" ? '<span class="location-time-icon" role="img" aria-label="Night" title="Night">☾</span>' : ""}`;
    return `<li><strong>${escapeHtml(location.name)}${timeIcons}</strong><span class="detail-meta">${level}</span></li>`;
  }).join("")}</ul>`;
}

function renderSummaryTraits(slime: Slime): string {
  if (slime.traits === null || slime.traits === undefined || slime.traits.length === 0) {
    return `<span class="detail-unknown">${escapeHtml(getTraitStatusText(slime))}</span>`;
  }

  return `<div class="summary-traits">${slime.traits.map((traitId) => {
    const trait = traits.find(({ id }) => id === traitId);
    if (!trait) {
      throw new Error(`Trait não cadastrada: ${traitId}`);
    }
    return `<span class="summary-trait" title="${escapeHtml(trait.description)}">${escapeHtml(trait.name)}</span>`;
  }).join("")}</div>`;
}

function renderDetailSkills(slime: Slime): string {
  if (slime.skills === null) {
    return '<p class="detail-unknown">A catalogar</p>';
  }
  if (slime.skills.length === 0) {
    return '<p class="detail-unknown">Nenhuma skill registrada</p>';
  }

  return `<ul class="detail-list">${slime.skills.map((skillId) => {
    const skill = skillsById.get(skillId);
    if (!skill) {
      throw new Error(`Skill não cadastrada: ${skillId}`);
    }
    return `<li><strong><a href="#skill/${skill.id}">${escapeHtml(skill.name)}</a></strong><span class="detail-meta">MP ${escapeHtml(formatSkillRange(skill.mpCost))} · CD ${escapeHtml(formatSkillRange(skill.cooldown, " s"))} · Dano ${escapeHtml(formatSkillRange(skill.damage))}</span></li>`;
  }).join("")}</ul>`;
}

function renderDetailItems(slime: Slime): string {
  if (slime.drops === null) {
    return '<p class="detail-unknown">A catalogar</p>';
  }
  if (slime.drops.length === 0) {
    return '<p class="detail-unknown">Nenhum drop registrado</p>';
  }

  const drops = slime.drops.map((itemId) => {
    const item = itemsById.get(itemId);
    if (!item) {
      throw new Error(`Item não cadastrado: ${itemId}`);
    }
    return { itemId, item };
  }).sort((first, second) => first.item.name.localeCompare(second.item.name, "pt-BR"));

  return `<ul class="detail-list detail-drop-list">${drops.map(({ itemId, item }) => {
    const description = item.description ?? "Descrição a catalogar";
    const type = item.type ?? "Tipo a catalogar";
    const imagePath = itemImages[itemId];
    const dropRate = slime.dropRates?.[itemId];
    const dropRateLabel = dropRate === undefined || dropRate === null
      ? "Chance de drop a catalogar"
      : `Chance de drop: ${dropRate}%`;
    return `<li class="detail-drop-entry">
      ${imagePath ? `<img class="detail-drop-image" src="${imagePath}" alt="" loading="lazy" decoding="async">` : ""}
      <div class="detail-drop-info">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="detail-meta">${escapeHtml(type)} · ${escapeHtml(description)}</span>
        <span class="detail-meta detail-drop-rate">${escapeHtml(dropRateLabel)}</span>
      </div>
    </li>`;
  }).join("")}</ul>`;
}

function renderDetailSynthesis(slime: Slime): string {
  const sortRecipes = (recipes: typeof syntheses) => recipes.sort((first, second) => {
    if (first.requiredLevel === null && second.requiredLevel !== null) {
      return 1;
    }
    if (first.requiredLevel !== null && second.requiredLevel === null) {
      return -1;
    }
    return (first.requiredLevel ?? 0) - (second.requiredLevel ?? 0) ||
      (first.resultSlimeId ?? Number.MAX_SAFE_INTEGER) -
        (second.resultSlimeId ?? Number.MAX_SAFE_INTEGER);
  });
  const participationRecipes = sortRecipes(syntheses.filter(
    ({ mainSlimeId, subSlimeId }) => mainSlimeId === slime.id || subSlimeId === slime.id,
  ));
  const resultRecipes = sortRecipes(syntheses.filter(
    ({ mainSlimeId, subSlimeId, resultSlimeId }) =>
      resultSlimeId === slime.id && mainSlimeId !== slime.id && subSlimeId !== slime.id,
  ));

  if (participationRecipes.length > 0 || resultRecipes.length > 0) {
    const renderRecipeGroup = (
      heading: string,
      recipes: typeof syntheses,
      isParticipationGroup: boolean,
    ) => {
      const groupedRecipeIndexes = new Map<string, number[]>();
      recipes.forEach((recipe) => {
        const pair = [recipe.mainSlimeId, recipe.subSlimeId].sort((a, b) => a - b);
        const key = JSON.stringify([
          pair[0],
          pair[1],
          recipe.resultSlimeId,
          recipe.requiredLevel,
          recipe.minimumMainLevel,
        ]);
        const indexes = groupedRecipeIndexes.get(key) ?? [];
        indexes.push(syntheses.indexOf(recipe));
        groupedRecipeIndexes.set(key, indexes);
      });
      if (recipes.length === 0) {
        return "";
      }

      const recipeGroups = [...groupedRecipeIndexes.values()];
      return `
      <section class="detail-synthesis-group">
        <h3 class="detail-synthesis-group-heading">
          <span>${heading}</span>
          <span class="detail-synthesis-group-count">${recipeGroups.length}</span>
        </h3>
        <div class="detail-synthesis-list">${recipeGroups.map((recipeIndexes) => {
          const recipe = syntheses[recipeIndexes[0] ?? -1];
          if (!recipe) {
            throw new Error("Não foi possível encontrar a receita de síntese.");
          }
          const shouldReverse = isParticipationGroup
            ? recipe.subSlimeId === slime.id
            : recipe.mainSlimeId > recipe.subSlimeId;
          return renderDetailSynthesisRecipe(recipeIndexes, shouldReverse);
        }).join("")}</div>
      </section>`;
    };
    return `<p class="synthesis-intro">Combinações conhecidas para ${escapeHtml(slime.name ?? `Slime #${String(slime.id).padStart(3, "0")}`)}.</p>
      ${renderRecipeGroup("Participa como Main ou Sub slime", participationRecipes, true)}
      ${renderRecipeGroup("Obtido como resultado", resultRecipes, false)}`;
  }

  return '<p class="detail-unknown">A catalogar</p>';
}

function renderDetailSynthesisRecipe(
  recipeIndexes: number[],
  reversed: boolean,
): string {
  const recipes = recipeIndexes.map((index) => syntheses[index]);
  const recipe = recipes[0];
  if (!recipe) {
    throw new Error("Não foi possível encontrar a receita de síntese.");
  }
  const mainSlimeId = reversed ? recipe.subSlimeId : recipe.mainSlimeId;
  const subSlimeId = reversed ? recipe.mainSlimeId : recipe.subSlimeId;
  const renderRecipeSlime = (slimeId: number, role: string) => {
    const recipeSlime = slimesById.get(slimeId);
    if (!recipeSlime) {
      throw new Error(`Síntese referencia slime inexistente: #${slimeId}`);
    }
    const name = recipeSlime.name ?? `Slime #${String(slimeId).padStart(3, "0")}`;
    return `<div class="synthesis-part">
      <span class="synthesis-part-role">${role}</span>
      ${renderSlimeAvatar(recipeSlime, "detail-synthesis-avatar")}
      <a class="synthesis-part-name" href="#slime/${slimeId}">${escapeHtml(name)}</a>
      <span class="synthesis-part-id">#${String(slimeId).padStart(3, "0")}</span>
    </div>`;
  };
  const renderRecipeResult = (slimeId: number | null) => {
    if (slimeId === null) {
      return `<div class="synthesis-part">
        <span class="synthesis-part-role">RESULTADO</span>
        <span class="synthesis-result-placeholder" aria-hidden="true">?</span>
        <strong class="synthesis-result-unknown-name">Resultado não descoberto</strong>
      </div>`;
    }
    return renderRecipeSlime(slimeId, "RESULTADO");
  };
  const level = formatRecipeLevel(recipe);
  const renderIngredient = (
    itemId: ItemId | null,
    chance: number | null,
    ingredientStatus: (typeof syntheses)[number]["ingredientStatus"],
    noIngredient = false,
  ) => {
    const item = itemId === null ? null : itemsById.get(itemId);
    if (itemId !== null && !item) {
      throw new Error(`Item não cadastrado na receita: ${itemId}`);
    }
    const chanceLabel = chance == null ? "—%" : `${chance}%`;
    const chanceDescription = chance == null
      ? "Chance não informada para esta ordem"
      : `Chance de sucesso: ${chanceLabel}`;
    const imagePath = itemId === null ? undefined : itemImages[itemId];
    const itemName = item?.name ?? (noIngredient
      ? "No ingredients"
      : getSynthesisIngredientsLabel(null, ingredientStatus));
    return `<div class="synthesis-ingredient-option">
      <div class="synthesis-ingredient-part">
        ${imagePath
          ? `<img class="synthesis-item-avatar" src="${imagePath}" alt="" loading="lazy" decoding="async">`
          : itemId !== null || ingredientStatus === "required-undiscovered"
            ? '<span class="synthesis-item-avatar synthesis-item-placeholder" aria-hidden="true">?</span>'
            : ""}
        <strong class="synthesis-item-name">${escapeHtml(itemName)}</strong>
      </div>
      <div class="synthesis-result-flow">
        <span class="synthesis-chance" aria-label="${escapeHtml(chanceDescription)}">${escapeHtml(chanceLabel)}</span>
        <span class="synthesis-operator synthesis-arrow" aria-label="produz">→</span>
      </div>
    </div>`;
  };
  const ingredientOptions = recipes.flatMap((candidate) => {
    const displayedRecipe = reversed
      ? syntheses.find((entry) =>
          entry.mainSlimeId === mainSlimeId &&
          entry.subSlimeId === subSlimeId &&
          entry.resultSlimeId === candidate.resultSlimeId &&
          entry.requiredLevel === candidate.requiredLevel &&
          entry.minimumMainLevel === candidate.minimumMainLevel &&
          entry.ingredientStatus === candidate.ingredientStatus &&
          JSON.stringify(entry.ingredients) === JSON.stringify(candidate.ingredients),
        )
      : candidate;
    const chance = displayedRecipe?.successChance ?? null;
    const ingredientIds = candidate.ingredients;
    if (ingredientIds === null) {
      return [renderIngredient(null, chance, candidate.ingredientStatus)];
    }
    if (ingredientIds.length === 0) {
      return [renderIngredient(null, chance, candidate.ingredientStatus, true)];
    }
    return ingredientIds.map((itemId) =>
      renderIngredient(itemId, chance, candidate.ingredientStatus),
    );
  }).join("");

  return `<article class="detail-synthesis-recipe" data-recipe-indices="${recipeIndexes.join(",")}" data-reversed="${reversed}">
    <div class="synthesis-flow">
      ${renderRecipeSlime(mainSlimeId, "MAIN SLIME")}
      <button class="synthesis-operator synthesis-reverse" type="button" data-reverse-detail-recipe aria-label="Inverter Main slime e Sub slime" title="Inverter Main slime e Sub slime">⇄</button>
      ${renderRecipeSlime(subSlimeId, "SUB SLIME")}
      <span class="synthesis-operator synthesis-add" aria-hidden="true">+</span>
      <div class="synthesis-ingredient-options">${ingredientOptions}</div>
      ${renderRecipeResult(recipe.resultSlimeId)}
    </div>
    <div class="synthesis-recipe-meta">
      <span class="synthesis-meta-item"><span>LEVEL</span><strong>${escapeHtml(level)}</strong></span>
    </div>
  </article>`;
}

function renderSlimeDetails(slime: Slime): void {
  const types = [slime.type1, slime.type2]
    .filter((type): type is SlimeTypeId => type !== null)
    .map((type) => `<span class="type-tag type-tag-${escapeHtml(type)}"><i></i>${escapeHtml(getTypeName(type))}</span>`)
    .join("");
  const locationsLabel = slime.locations === null
    ? "A catalogar"
    : slime.locations.length === 0
      ? "Nenhuma registrada"
      : `${slime.locations.length} ${slime.locations.length === 1 ? "localização" : "localizações"}`;
  const recipes = syntheses.filter(
    ({ mainSlimeId, subSlimeId, resultSlimeId }) =>
      mainSlimeId === slime.id || subSlimeId === slime.id || resultSlimeId === slime.id,
  );
  const synthesisLabel = recipes.length > 0
    ? `${recipes.length} ${recipes.length === 1 ? "receita" : "receitas"}`
    : "A catalogar";

  detailScreen.innerHTML = `
    <a class="back-link" href="#slimes"><span aria-hidden="true">←</span> Voltar à Slimepedia</a>
    <section class="slime-detail-layout">
      <div class="slime-detail-art">
        ${renderSlimeAvatar(slime, "detail-avatar")}
      </div>
      <div class="slime-detail-info">
        <header class="slime-detail-heading">
          <h1 class="detail-title">${escapeHtml(slime.name ?? "Nome a confirmar")}</h1>
        </header>
        <table class="slime-summary-table">
          <tbody>
            <tr><th scope="row">ID</th><td>#${String(slime.id).padStart(3, "0")}</td></tr>
            <tr><th scope="row">Tipo</th><td><div class="detail-types">${types || '<span class="detail-unknown">A catalogar</span>'}</div></td></tr>
            <tr><th scope="row">Traits</th><td>${renderSummaryTraits(slime)}</td></tr>
            <tr><th scope="row">Localizações</th><td><a class="detail-summary-link" href="#detail-locations" data-detail-scroll>${escapeHtml(locationsLabel)}</a></td></tr>
            <tr><th scope="row">Sínteses</th><td><a class="detail-summary-link" href="#detail-syntheses" data-detail-scroll>${escapeHtml(synthesisLabel)}</a></td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <div class="detail-grid">
      <section class="detail-card detail-stats-card"><h2>Stats</h2><p class="detail-unknown">Stats ainda não catalogados.</p></section>
      <section class="detail-card"><h2>Drops</h2>${renderDetailItems(slime)}</section>
      <section class="detail-card detail-card-wide" id="detail-syntheses"><h2>Sínteses</h2>${renderDetailSynthesis(slime)}</section>
      <section class="detail-card" id="detail-locations"><h2>Localizações</h2>${renderDetailLocations(slime)}</section>
      <section class="detail-card"><h2>Skills</h2>${renderDetailSkills(slime)}</section>
    </div>
  `;
}

function getSlimeLabel(slime: Slime): string {
  return `${slime.name ?? "Nome a confirmar"} · #${String(slime.id).padStart(3, "0")}`;
}

function renderSlimeAvatar(slime: Slime, className = ""): string {
  const typeClass = slime.type1 ? ` type-${escapeHtml(slime.type1)}` : "";
  const imagePath = slimeImages[slime.id];
  const imageClass = imagePath ? " has-image" : "";
  const content = imagePath
    ? `<img src="${imagePath}" alt="" decoding="async">`
    : "<i></i><b></b>";
  return `<span class="slime-avatar${typeClass}${imageClass}${className ? ` ${className}` : ""}" aria-hidden="true">${content}</span>`;
}

function renderSlimePickerOptions(query = "", mainSlimeId: number | null = null): string {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const confirmedSlimes = [...slimes].filter((slime) =>
    slime.name !== null && Number.isInteger(slime.id) && slime.id > 0,
  );
  const matches = confirmedSlimes.filter((slime) =>
    getSlimeLabel(slime).toLocaleLowerCase("pt-BR").includes(normalizedQuery),
  );
  if (matches.length === 0) {
    return '<p class="slime-picker-empty">Nenhum slime encontrado.</p>';
  }
  return matches.map((slime) => {
    const matchingRecipes = mainSlimeId === null
      ? []
      : syntheses.filter((recipe) =>
          recipe.mainSlimeId === mainSlimeId && recipe.subSlimeId === slime.id,
        );
    const hasKnownSynthesis = matchingRecipes.some((recipe) => recipe.resultSlimeId !== null);
    const status = mainSlimeId === null
      ? null
      : hasKnownSynthesis
        ? { icon: "✓", label: "Síntese descoberta", className: "is-known" }
        : matchingRecipes.length > 0
          ? { icon: "?", label: "Síntese possível; resultado ainda não descoberto", className: "is-undiscovered" }
          : { icon: "×", label: "Nenhuma síntese registrada", className: "is-unavailable" };
    return `
      <button class="slime-picker-option" type="button" data-select-slime="${slime.id}">
        ${renderSlimeAvatar(slime, "simulator-avatar")}
        <span class="slime-picker-option-name">${escapeHtml(slime.name ?? "Nome a confirmar")}</span>
        <small class="slime-picker-option-id">#${String(slime.id).padStart(3, "0")}</small>
        ${status
          ? `<span class="slime-picker-synthesis-status ${status.className}" aria-label="${status.label}" title="${status.label}">${status.icon}</span>`
          : ""}
      </button>
    `;
  }).join("");
}

function renderItemPickerOptions(query = ""): string {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const matchingItems = [...items]
    .filter((item) => item.type === "Byproduct")
    .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"))
    .filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  const clearOption = `<button class="item-picker-option item-picker-clear" type="button" data-clear-item>
    <span class="item-picker-image-placeholder" aria-hidden="true">×</span>
    <span class="item-picker-option-name">All ingredients</span>
  </button>`;
  if (matchingItems.length === 0) {
    return `${clearOption}<p class="item-picker-empty">Nenhum ingredient encontrado.</p>`;
  }
  return clearOption + matchingItems.map((item) => {
    const imagePath = itemImages[item.id];
    return `<button class="item-picker-option" type="button" data-select-item="${escapeHtml(item.id)}">
      ${imagePath
        ? `<img src="${imagePath}" alt="" loading="lazy" decoding="async">`
        : '<span class="item-picker-image-placeholder" aria-hidden="true">?</span>'}
      <span class="item-picker-option-name">${escapeHtml(item.name)}</span>
    </button>`;
  }).join("");
}

function getPendingSyntheses(): typeof syntheses {
  return syntheses.filter((recipe) =>
    recipe.resultSlimeId === null ||
    recipe.ingredientStatus === "required-undiscovered" ||
    recipe.minimumMainLevel !== null,
  );
}

function renderPendingSyntheses(): string {
  const pendingRecipes = getPendingSyntheses();
  if (pendingRecipes.length === 0) {
    return '<div class="section-empty"><strong>Nenhuma síntese pendente registrada</strong><p>Este espaço será preenchido quando houver combinações confirmadas que aguardam a descoberta do ingrediente ou o level mínimo necessário.</p></div>';
  }

  return pendingRecipes.map((recipe) => {
    const level = formatRecipeLevel(recipe);
    const itemNames = escapeHtml(getSynthesisIngredientsLabel(recipe.ingredients, recipe.ingredientStatus));
    const result = recipe.resultSlimeId === null
      ? '<span class="recipe-result recipe-result-unknown">Resultado não descoberto</span>'
      : `<span class="recipe-result recipe-result-slime">${renderSlimeAvatar(
        getSlimeForSynthesis(recipe.resultSlimeId),
        "recipe-avatar",
      )}${renderSlimeLink(recipe.resultSlimeId)}</span>`;
    const renderIngredient = (slimeId: number, role: string) => {
      const slime = getSlimeForSynthesis(slimeId);
      return `<span class="recipe-slime">${renderSlimeAvatar(slime, "recipe-avatar")}<span class="recipe-slime-info">${renderSlimeLink(slimeId)}<small>${role}</small></span></span>`;
    };
    return `
      <article class="recipe-card">
        <div class="recipe-combination">
          ${renderIngredient(recipe.mainSlimeId, "Main slime")}
          <span class="recipe-plus" aria-hidden="true">+</span>
          ${renderIngredient(recipe.subSlimeId, "Sub slime")}
          <span class="recipe-arrow" aria-hidden="true">→</span>
          ${result}
        </div>
        <div class="recipe-meta"><span>${escapeHtml(level)}</span><span>${itemNames}</span></div>
      </article>
    `;
  }).join("");
}

function getSlimeForSynthesis(slimeId: number): Slime {
  const slime = slimesById.get(slimeId);
  if (!slime) {
    throw new Error(`Síntese referencia slime inexistente: #${slimeId}`);
  }
  return slime;
}

function renderSynthesisResults(): void {
  const results = sectionScreen.querySelector<HTMLDivElement>("#synthesis-results");
  if (!results) {
    return;
  }

  const mainPicker = sectionScreen.querySelector<HTMLDivElement>("#synthesis-main-picker");
  const subPicker = sectionScreen.querySelector<HTMLDivElement>("#synthesis-sub-picker");
  const mainSlimeId = mainPicker?.dataset.selectedId ? Number(mainPicker.dataset.selectedId) : null;
  const subSlimeId = subPicker?.dataset.selectedId ? Number(subPicker.dataset.selectedId) : null;
  const levelInput = sectionScreen.querySelector<HTMLInputElement>("#synthesis-level");
  const levelValue = levelInput?.value ?? "";
  const level = levelValue ? Number(levelValue) : null;

  const selectedRange = level === null ? null : getSynthesisLevelRange(level);
  const hasSelection = mainSlimeId !== null || subSlimeId !== null || levelValue.length > 0 || selectedSynthesisItem !== null;
  if (levelValue.length > 0 && selectedRange === null) {
    results.innerHTML = `<div class="simulator-empty">Informe um level inteiro igual ou superior a ${SYNTHESIS_LEVEL_MIN}.</div>`;
    return;
  }
  if (!hasSelection) {
    results.innerHTML = '<div class="simulator-empty">Escolha um slime para começar. As combinações conhecidas vão aparecer aqui conforme você preenche o simulador.</div>';
    return;
  }

  const recipes = syntheses.filter((recipe) => {
    const mainEligible = mainSlimeId === null || recipe.mainSlimeId === mainSlimeId;
    const subEligible = subSlimeId === null || recipe.subSlimeId === subSlimeId;
    const recipeRange = recipe.requiredLevel === null ? null : getSynthesisLevelRange(recipe.requiredLevel);
    const levelEligible = recipe.minimumMainLevel !== null ||
      selectedRange === null || recipe.requiredLevel === null ||
      (recipeRange !== null && recipeRange.min === selectedRange.min && recipeRange.max === selectedRange.max);
    const itemsEligible = selectedSynthesisItem === null ||
      recipe.ingredients === null ||
      recipe.ingredients.includes(selectedSynthesisItem);
    return mainEligible && subEligible && levelEligible && itemsEligible;
  });

  if (recipes.length === 0) {
    results.innerHTML = '<div class="simulator-empty">Nenhuma receita conhecida corresponde às escolhas atuais. Você pode alterar qualquer opção para explorar outras combinações.</div>';
    return;
  }

  results.innerHTML = `
    <p class="simulator-result-count">${recipes.length} combinação${recipes.length === 1 ? "" : "ões"} conhecida${recipes.length === 1 ? "" : "s"}${selectedRange ? ` · Lv. ${selectedRange.min}–${selectedRange.max}` : ""}</p>
    <div class="simulator-result-list">
    ${recipes.map((recipe) => {
      const resultSlime = recipe.resultSlimeId === null
        ? null
        : slimesById.get(recipe.resultSlimeId);
      if (recipe.resultSlimeId !== null && !resultSlime) {
        throw new Error(`Síntese referencia slime inexistente: #${recipe.resultSlimeId}`);
      }
      const mainSlime = slimesById.get(recipe.mainSlimeId);
      const subSlime = slimesById.get(recipe.subSlimeId);
      if (!mainSlime || !subSlime) {
        throw new Error(`Síntese "${recipe.id}" referencia slimes inexistentes.`);
      }
      const levelNote = formatRecipeLevel(recipe);
      const mainLevelNote = level === null ? "Level do Main slime não informado" : `Main slime Lv. ${level}`;
      const itemNote = escapeHtml(getSynthesisIngredientsLabel(recipe.ingredients, recipe.ingredientStatus));
      const minimumLevelWarning = recipe.minimumMainLevel !== null && level !== null && level < recipe.minimumMainLevel
        ? `<span class="simulator-result-warning">O Main slime precisa alcançar o level mínimo ${recipe.minimumMainLevel} antes de tentar esta síntese.</span>`
        : "";
      return `<article class="simulator-result">
        ${resultSlime
          ? `<div class="simulator-result-slime">${renderSlimeAvatar(resultSlime, "simulator-avatar")}<div><a href="#slime/${resultSlime.id}">${escapeHtml(resultSlime.name ?? `Slime #${String(resultSlime.id).padStart(3, "0")}`)}</a><span class="simulator-result-number">#${String(resultSlime.id).padStart(3, "0")}</span></div></div>`
          : '<div class="simulator-result-slime simulator-result-unknown"><span class="synthesis-result-placeholder" aria-hidden="true">?</span><strong>Resultado não descoberto</strong></div>'}
        <div class="simulator-result-meta">
          <span><strong>Main slime:</strong> ${escapeHtml(mainSlime.name ?? `Slime #${String(mainSlime.id).padStart(3, "0")}`)} · ${escapeHtml(mainLevelNote)}</span>
          <span><strong>Sub slime:</strong> ${escapeHtml(subSlime.name ?? `Slime #${String(subSlime.id).padStart(3, "0")}`)}</span>
          <span><strong>Ingredients:</strong> ${itemNote} · ${escapeHtml(levelNote)}</span>
          ${minimumLevelWarning}
        </div>
      </article>`;
    }).join("")}
    </div>
    <p class="simulator-footnote">Resultados atualizados com as opções selecionadas. Só são exibidas receitas catalogadas; outras combinações ainda podem ser descobertas.</p>
  `;
}

function renderSynthesisPage(): void {
  selectedSynthesisItem = null;

  sectionScreen.innerHTML = `
    <section class="section-heading">
      <p class="eyebrow"><span class="eyebrow-line"></span> GUIA DA COMUNIDADE</p>
      <h1 class="section-title">Sínteses<span>.</span></h1>
      <p class="section-description">Consulte as receitas conhecidas ou experimente combinações no simulador.</p>
    </section>
    <div class="demo-notice" role="note">
      <span class="notice-icon" aria-hidden="true">i</span>
      <p><strong>Catálogo em construção.</strong> O simulador mostra combinações registradas, mesmo quando o resultado ainda é desconhecido; combinações ausentes do catálogo ainda podem ser possíveis.</p>
    </div>
    <section class="synthesis-simulator" aria-labelledby="simulator-heading">
      <div class="section-subheading">
        <div><p class="eyebrow"><span class="eyebrow-line"></span> MODO DE EXPERIMENTAÇÃO</p><h2 id="simulator-heading">Simulador de síntese</h2></div>
        <span class="mockup-badge">INTERATIVO</span>
      </div>
      <p class="simulator-intro">Escolha o Main slime e o Sub slime. O level informado pertence ao Main slime.</p>
      <div class="simulator-form">
        <div class="simulator-slot">
          <span class="field-label">Main slime</span>
          <div class="simulator-slime-picker" id="synthesis-main-picker" data-selected-id="">
            <button class="slime-picker-trigger" type="button" data-toggle-slime-picker aria-expanded="false"><span class="slime-picker-current"><span class="selection-placeholder">Select Main slime</span></span><span class="select-chevron" aria-hidden="true">⌄</span></button>
            <div class="slime-picker-menu" hidden><label class="sr-only" for="synthesis-main-search">Search Main slime</label><input class="slime-picker-search" id="synthesis-main-search" type="search" placeholder="Search slime..." autocomplete="off" /><div class="slime-picker-options">${renderSlimePickerOptions()}</div></div>
          </div>
        </div>
        <span class="simulator-operator" aria-hidden="true">+</span>
        <div class="simulator-slot">
          <span class="field-label">Sub slime</span>
          <div class="simulator-slime-picker" id="synthesis-sub-picker" data-selected-id="">
            <button class="slime-picker-trigger" type="button" data-toggle-slime-picker aria-expanded="false"><span class="slime-picker-current"><span class="selection-placeholder">Select Sub slime</span></span><span class="select-chevron" aria-hidden="true">⌄</span></button>
            <div class="slime-picker-menu" hidden>
              <label class="sr-only" for="synthesis-sub-search">Search Sub slime</label>
              <input class="slime-picker-search" id="synthesis-sub-search" type="search" placeholder="Search slime..." autocomplete="off" />
              <span class="synthesis-picker-legend"><i class="is-known">✓</i> Descoberta <i class="is-unavailable">×</i> Não catalogada <i class="is-undiscovered">?</i> Resultado desconhecido</span>
              <div class="slime-picker-options">${renderSlimePickerOptions()}</div>
            </div>
          </div>
        </div>
        <span class="simulator-operator simulator-arrow" aria-hidden="true">→</span>
        <label class="field-label level-field">Main slime level<input id="synthesis-level" type="number" min="${SYNTHESIS_LEVEL_MIN}" step="1" placeholder="4 ou mais" /></label>
        <div class="field-label item-slot">Ingredients (optional)
          <div class="simulator-item-picker">
            <button class="item-picker-trigger" type="button" data-toggle-item-picker aria-expanded="false">
              <span class="item-picker-current"><span class="selection-placeholder">All ingredients</span></span>
              <span class="select-chevron" aria-hidden="true">⌄</span>
            </button>
            <div class="slime-picker-menu item-picker-menu" hidden>
              <label class="sr-only" for="synthesis-item-search">Search ingredients</label>
              <input class="slime-picker-search" id="synthesis-item-search" type="search" placeholder="Search ingredient..." autocomplete="off" />
              <div class="item-picker-options">${renderItemPickerOptions()}</div>
            </div>
          </div>
        </div>
        <button class="button-secondary simulator-reset" type="button" data-reset-synthesis>↺ Reset</button>
      </div>
      <div class="simulator-results-wrap"><h3>Resultados possíveis</h3><div id="synthesis-results" aria-live="polite"></div></div>
    </section>
    <section class="known-recipes" aria-labelledby="pending-recipes-heading">
      <div class="section-subheading">
        <div><p class="eyebrow"><span class="eyebrow-line"></span> DESCOBERTAS DA COMUNIDADE</p><h2 id="pending-recipes-heading">Sínteses a descobrir <span class="heading-count">${getPendingSyntheses().length}</span></h2></div>
      </div>
      <div class="recipe-list">${renderPendingSyntheses()}</div>
    </section>
  `;

  const updateSimulator = () => {
    const mainPicker = sectionScreen.querySelector<HTMLDivElement>("#synthesis-main-picker");
    const selectedMainId = mainPicker?.dataset.selectedId ? Number(mainPicker.dataset.selectedId) : null;
    sectionScreen.querySelectorAll<HTMLDivElement>(".simulator-slime-picker").forEach((picker) => {
      const selectedId = Number(picker.dataset.selectedId);
      const slime = slimesById.get(selectedId);
      const current = picker.querySelector<HTMLSpanElement>(".slime-picker-current");
      const trigger = picker.querySelector<HTMLButtonElement>(".slime-picker-trigger");
      if (!current || !trigger) {
        return;
      }
      current.innerHTML = slime
        ? `<span class="slime-picker-selected">${renderSlimeAvatar(slime, "simulator-avatar")}<span>${escapeHtml(slime.name ?? "Nome a confirmar")}<small>#${String(slime.id).padStart(3, "0")}</small></span></span>`
        : `<span class="selection-placeholder">${picker.id === "synthesis-main-picker" ? "Select Main slime" : "Select Sub slime"}</span>`;
      trigger.setAttribute("aria-expanded", String(!picker.querySelector(".slime-picker-menu")?.hasAttribute("hidden")));
    });
    const subPicker = sectionScreen.querySelector<HTMLDivElement>("#synthesis-sub-picker");
    const subOptions = subPicker?.querySelector<HTMLDivElement>(".slime-picker-options");
    const subSearch = subPicker?.querySelector<HTMLInputElement>(".slime-picker-search");
    if (subOptions) {
      subOptions.innerHTML = renderSlimePickerOptions(subSearch?.value ?? "", selectedMainId);
    }
    const itemPicker = sectionScreen.querySelector<HTMLDivElement>(".simulator-item-picker");
    const itemCurrent = itemPicker?.querySelector<HTMLSpanElement>(".item-picker-current");
    const itemTrigger = itemPicker?.querySelector<HTMLButtonElement>(".item-picker-trigger");
    const selectedItem = selectedSynthesisItem === null
      ? null
      : itemsById.get(selectedSynthesisItem);
    if (itemCurrent && itemTrigger) {
      itemCurrent.innerHTML = selectedItem
        ? `<span class="item-picker-selected">${itemImages[selectedItem.id]
          ? `<img src="${itemImages[selectedItem.id]}" alt="" loading="lazy" decoding="async">`
          : '<span class="item-picker-image-placeholder" aria-hidden="true">?</span>'}<span>${escapeHtml(selectedItem.name)}</span></span>`
        : '<span class="selection-placeholder">All ingredients</span>';
      itemTrigger.setAttribute("aria-expanded", String(!itemPicker?.querySelector(".item-picker-menu")?.hasAttribute("hidden")));
    }
    renderSynthesisResults();
  };

  const simulator = sectionScreen.querySelector<HTMLElement>(".synthesis-simulator");
  if (!simulator) {
    throw new Error("Não foi possível inicializar o simulador de síntese.");
  }
  simulator.querySelector<HTMLInputElement>("#synthesis-level")?.addEventListener("input", updateSimulator);
  simulator.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const resetButton = target.closest<HTMLButtonElement>("[data-reset-synthesis]");
    if (resetButton) {
      simulator.querySelectorAll<HTMLDivElement>(".simulator-slime-picker").forEach((picker) => {
        picker.dataset.selectedId = "";
        picker.querySelector<HTMLDivElement>(".slime-picker-menu")?.setAttribute("hidden", "");
        const search = picker.querySelector<HTMLInputElement>(".slime-picker-search");
        if (search) {
          search.value = "";
        }
        const options = picker.querySelector<HTMLDivElement>(".slime-picker-options");
        if (options) {
          options.innerHTML = renderSlimePickerOptions();
        }
      });
      const levelInput = simulator.querySelector<HTMLInputElement>("#synthesis-level");
      if (levelInput) {
        levelInput.value = "";
      }
      selectedSynthesisItem = null;
      const itemSearch = simulator.querySelector<HTMLInputElement>("#synthesis-item-search");
      const itemOptions = simulator.querySelector<HTMLDivElement>(".item-picker-options");
      if (itemSearch) {
        itemSearch.value = "";
      }
      if (itemOptions) {
        itemOptions.innerHTML = renderItemPickerOptions();
      }
      simulator.querySelector<HTMLDivElement>(".item-picker-menu")?.setAttribute("hidden", "");
      updateSimulator();
      return;
    }
    const itemToggle = target.closest<HTMLButtonElement>("[data-toggle-item-picker]");
    if (itemToggle) {
      const menu = itemToggle.closest(".simulator-item-picker")?.querySelector<HTMLDivElement>(".item-picker-menu");
      if (menu) {
        const shouldOpen = menu.hasAttribute("hidden");
        simulator.querySelectorAll<HTMLDivElement>(".slime-picker-menu").forEach((otherMenu) => {
          otherMenu.setAttribute("hidden", "");
          otherMenu.closest(".simulator-slime-picker")?.querySelector<HTMLButtonElement>("[data-toggle-slime-picker]")?.setAttribute("aria-expanded", "false");
          otherMenu.closest(".simulator-item-picker")?.querySelector<HTMLButtonElement>("[data-toggle-item-picker]")?.setAttribute("aria-expanded", "false");
        });
        if (shouldOpen) {
          menu.removeAttribute("hidden");
          itemToggle.setAttribute("aria-expanded", "true");
          menu.querySelector<HTMLInputElement>(".slime-picker-search")?.focus();
        }
      }
      return;
    }
    const itemOption = target.closest<HTMLButtonElement>("[data-select-item]");
    const clearItem = target.closest<HTMLButtonElement>("[data-clear-item]");
    if (clearItem) {
      selectedSynthesisItem = null;
      simulator.querySelector<HTMLDivElement>(".item-picker-menu")?.setAttribute("hidden", "");
      simulator.querySelector<HTMLButtonElement>("[data-toggle-item-picker]")?.setAttribute("aria-expanded", "false");
      simulator.querySelector<HTMLButtonElement>("[data-toggle-item-picker]")?.focus();
      updateSimulator();
      return;
    }
    if (itemOption) {
      const itemId = itemOption.dataset.selectItem;
      const item = items.find((candidate) => candidate.id === itemId);
      if (!item) {
        throw new Error(`Ingredient selecionado não cadastrado: ${itemId ?? ""}`);
      }
      selectedSynthesisItem = item.id;
      simulator.querySelector<HTMLDivElement>(".item-picker-menu")?.setAttribute("hidden", "");
      simulator.querySelector<HTMLButtonElement>("[data-toggle-item-picker]")?.setAttribute("aria-expanded", "false");
      simulator.querySelector<HTMLButtonElement>("[data-toggle-item-picker]")?.focus();
      updateSimulator();
      return;
    }
    const toggleButton = target.closest<HTMLButtonElement>("[data-toggle-slime-picker]");
    if (toggleButton) {
      const picker = toggleButton.closest<HTMLDivElement>(".simulator-slime-picker");
      const menu = picker?.querySelector<HTMLDivElement>(".slime-picker-menu");
      if (picker && menu) {
        const shouldOpen = menu.hasAttribute("hidden");
        simulator.querySelectorAll<HTMLDivElement>(".slime-picker-menu").forEach((otherMenu) => {
          otherMenu.setAttribute("hidden", "");
          otherMenu.closest(".simulator-slime-picker")?.querySelector("button[data-toggle-slime-picker]")?.setAttribute("aria-expanded", "false");
          otherMenu.closest(".simulator-item-picker")?.querySelector("button[data-toggle-item-picker]")?.setAttribute("aria-expanded", "false");
        });
        if (shouldOpen) {
          menu.removeAttribute("hidden");
          toggleButton.setAttribute("aria-expanded", "true");
          picker.querySelector<HTMLInputElement>(".slime-picker-search")?.focus();
        }
      }
      return;
    }
    const slimeOption = target.closest<HTMLButtonElement>("[data-select-slime]");
    if (slimeOption) {
      const picker = slimeOption.closest<HTMLDivElement>(".simulator-slime-picker");
      const slimeId = Number(slimeOption.dataset.selectSlime);
      if (!picker || !slimesById.has(slimeId)) {
        throw new Error(`Slime selecionado não cadastrado: ${slimeOption.dataset.selectSlime}`);
      }
      picker.dataset.selectedId = String(slimeId);
      picker.querySelector<HTMLDivElement>(".slime-picker-menu")?.setAttribute("hidden", "");
      const search = picker.querySelector<HTMLInputElement>(".slime-picker-search");
      if (search) {
        search.value = "";
      }
      const options = picker.querySelector<HTMLDivElement>(".slime-picker-options");
      if (options) {
        options.innerHTML = renderSlimePickerOptions();
      }
      picker.querySelector<HTMLButtonElement>("[data-toggle-slime-picker]")?.focus();
      updateSimulator();
      return;
    }
    if (!target.closest(".simulator-slime-picker, .simulator-item-picker")) {
      simulator.querySelectorAll<HTMLDivElement>(".slime-picker-menu").forEach((menu) => {
        menu.setAttribute("hidden", "");
        menu.closest(".simulator-slime-picker")?.querySelector("button[data-toggle-slime-picker]")?.setAttribute("aria-expanded", "false");
        menu.closest(".simulator-item-picker")?.querySelector("button[data-toggle-item-picker]")?.setAttribute("aria-expanded", "false");
      });
    }
  });
  simulator.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    simulator.querySelectorAll<HTMLDivElement>(".slime-picker-menu").forEach((menu) => {
      menu.setAttribute("hidden", "");
      menu.closest(".simulator-slime-picker")?.querySelector("button[data-toggle-slime-picker]")?.setAttribute("aria-expanded", "false");
      menu.closest(".simulator-item-picker")?.querySelector("button[data-toggle-item-picker]")?.setAttribute("aria-expanded", "false");
    });
  });
  simulator.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches(".slime-picker-search")) {
      return;
    }
    const itemPicker = target.closest<HTMLDivElement>(".simulator-item-picker");
    const itemOptions = itemPicker?.querySelector<HTMLDivElement>(".item-picker-options");
    if (itemOptions) {
      itemOptions.innerHTML = renderItemPickerOptions(target.value);
      return;
    }
    const picker = target.closest<HTMLDivElement>(".simulator-slime-picker");
    const options = picker?.querySelector<HTMLDivElement>(".slime-picker-options");
    if (options) {
      const mainPicker = sectionScreen.querySelector<HTMLDivElement>("#synthesis-main-picker");
      const selectedMainId = mainPicker?.dataset.selectedId ? Number(mainPicker.dataset.selectedId) : null;
      options.innerHTML = renderSlimePickerOptions(
        target.value,
        picker?.id === "synthesis-sub-picker" ? selectedMainId : null,
      );
    }
  });
  updateSimulator();
}

function renderMapLocations(query: string): void {
  const list = sectionScreen.querySelector<HTMLDivElement>("#map-location-list");
  const detail = sectionScreen.querySelector<HTMLDivElement>("#map-location-detail");
  if (!list || !detail) {
    return;
  }

  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredLocations = locations.filter((location) =>
    location.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
  ).sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
  if (filteredLocations.length === 0) {
    selectedMapLocationId = "";
  }
  if (!filteredLocations.some(({ id }) => id === selectedMapLocationId) && filteredLocations[0]) {
    selectedMapLocationId = filteredLocations[0].id;
  }
  list.innerHTML = filteredLocations.length === 0
    ? '<p class="map-no-locations">Nenhum local encontrado.</p>'
    : filteredLocations.map((location) => `
        <button class="map-location-button${location.id === selectedMapLocationId ? " is-selected" : ""}" type="button" data-location-id="${escapeHtml(location.id)}" aria-pressed="${location.id === selectedMapLocationId}">
          <span class="map-pin" aria-hidden="true"></span><span>${escapeHtml(location.name)}</span><span class="map-location-arrow" aria-hidden="true">→</span>
        </button>
      `).join("");

  const location = locations.find(({ id }) => id === selectedMapLocationId);
  if (!location) {
    detail.innerHTML = `<div class="map-detail-placeholder">${filteredLocations.length === 0 ? "Nenhum local corresponde à busca." : "Selecione um local para consultar os registros disponíveis."}</div>`;
    return;
  }
  const foundSlimes = slimes.filter((slime) =>
    slime.locations?.some(({ locationId }) => locationId === location.id),
  );
  detail.innerHTML = `
    <div class="map-detail-heading"><span class="map-pin map-pin-large" aria-hidden="true"></span><div><p class="eyebrow">LOCAL SELECIONADO</p><h3>${escapeHtml(location.name)}</h3></div></div>
    <p class="map-detail-note">${foundSlimes.length} slime${foundSlimes.length === 1 ? "" : "s"} com localização registrada</p>
    ${foundSlimes.length > 0
      ? `<ul class="map-slime-list">${foundSlimes.map((slime) => {
          const entries = slime.locations?.filter(({ locationId }) => locationId === location.id) ?? [];
          const ranges = entries.map(({ levelRange, timeOfDay }) =>
            `${levelRange ? `Lv. ${levelRange.min}–${levelRange.max}` : "Level a confirmar"} · ${timeOfDay === "Both" ? "Dia e noite" : timeOfDay === "Day" ? "Dia" : "Noite"}`,
          ).join(", ");
          return `<li><a href="#slime/${slime.id}">${escapeHtml(slime.name ?? `Slime #${String(slime.id).padStart(3, "0")}`)}</a><span>${escapeHtml(ranges)}</span></li>`;
        }).join("")}</ul>`
      : '<div class="section-empty map-empty"><strong>Nenhum registro associado</strong><p>Os slimes encontrados neste local ainda serão catalogados.</p></div>'}
  `;
}

function getSkillCategoryLabel(category: SkillCategory): string {
  switch (category) {
    case "physical":
      return "Física";
    case "magic":
      return "Mágica";
    case "status":
      return "Status";
  }
}

function renderSkillCategories(categories: Skill["category"]): string {
  if (categories === null || categories.length === 0) {
    return '<span class="type-empty">Categoria a catalogar</span>';
  }
  return `<span class="skill-category-badges">${categories.map((category) =>
    `<span class="skill-category-badge skill-kind-${category}">${escapeHtml(getSkillCategoryLabel(category))}</span>`,
  ).join("")}</span>`;
}

function renderSkillElementalType(type: Skill["type"]): string {
  if (type === null) {
    return '<span class="type-empty">A catalogar</span>';
  }
  return `<span class="type-tag type-tag-${escapeHtml(type)}"><i></i>${escapeHtml(getTypeName(type))}</span>`;
}

function formatSkillRange({ min, max }: SkillRange, suffix = ""): string {
  if (min === null && max === null) {
    return "A catalogar";
  }
  if (min === max) {
    return `${min}${suffix}`;
  }
  return `${min ?? "A catalogar"}–${max ?? "A catalogar"}${suffix}`;
}

const skillSortKeys = ["name", "type", "category", "mpCost", "cooldown", "damage"] as const;
type SkillSortKey = (typeof skillSortKeys)[number];
type SkillSortDirection = "ascending" | "descending";

function isSkillSortKey(value: string): value is SkillSortKey {
  return skillSortKeys.some((key) => key === value);
}

function compareNullable<T>(
  first: T | null,
  second: T | null,
  compare: (first: T, second: T) => number,
  direction: SkillSortDirection,
): number {
  if (first === null || second === null) {
    return first === second ? 0 : first === null ? 1 : -1;
  }
  const result = compare(first, second);
  return direction === "ascending" ? result : -result;
}

function compareSkillRanges(
  first: SkillRange,
  second: SkillRange,
  direction: SkillSortDirection,
): number {
  const firstMin = first.min ?? first.max;
  const secondMin = second.min ?? second.max;
  return compareNullable(firstMin, secondMin, (a, b) => a - b, direction) ||
    compareNullable(first.max, second.max, (a, b) => a - b, direction);
}

function compareSkills(
  first: Skill,
  second: Skill,
  key: SkillSortKey,
  direction: SkillSortDirection,
): number {
  switch (key) {
    case "name":
      return first.name.localeCompare(second.name, "pt-BR", { numeric: true }) *
        (direction === "ascending" ? 1 : -1);
    case "type":
      return compareNullable(
        first.type === null ? null : getTypeName(first.type),
        second.type === null ? null : getTypeName(second.type),
        (a, b) => a.localeCompare(b, "pt-BR"),
        direction,
      );
    case "category": {
      const getCategories = (skill: Skill) => skill.category === null || skill.category.length === 0
        ? null
        : skill.category.map(getSkillCategoryLabel).sort((a, b) => a.localeCompare(b, "pt-BR")).join(", ");
      return compareNullable(
        getCategories(first),
        getCategories(second),
        (a, b) => a.localeCompare(b, "pt-BR"),
        direction,
      );
    }
    case "mpCost":
      return compareSkillRanges(first.mpCost, second.mpCost, direction);
    case "cooldown":
      return compareSkillRanges(first.cooldown, second.cooldown, direction);
    case "damage":
      return compareSkillRanges(first.damage, second.damage, direction);
  }
}

function renderSkillCards(
  query: string,
  typeFilter: string,
  sortKey: SkillSortKey,
  sortDirection: SkillSortDirection,
): void {
  const list = sectionScreen.querySelector<HTMLDivElement>("#skill-list");
  const count = sectionScreen.querySelector<HTMLParagraphElement>("#skill-results-count");
  const emptyState = sectionScreen.querySelector<HTMLDivElement>("#skill-empty-state");
  const table = sectionScreen.querySelector<HTMLTableElement>(".skill-table");
  if (!list || !count || !emptyState || !table) {
    throw new Error("Não foi possível inicializar a lista de skills.");
  }

  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredSkills = skills
    .filter((skill) => {
      if (typeFilter !== "all") {
        const matchesType = typeFilter === "unknown"
          ? skill.type === null
          : skill.type === typeFilter;
        if (!matchesType) {
          return false;
        }
      }
      if (!normalizedQuery) {
        return true;
      }
      const users = slimes.filter((slime) => slime.skills?.includes(skill.id));
      return [skill.name, ...users.map((slime) => slime.name ?? "")]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    })
    .sort((first, second) => compareSkills(first, second, sortKey, sortDirection));

  table.querySelectorAll<HTMLTableCellElement>("thead th").forEach((header) => {
    const button = header.querySelector<HTMLButtonElement>("[data-skill-sort]");
    const headerKey = button?.dataset.skillSort;
    if (!button || !headerKey || !isSkillSortKey(headerKey)) {
      throw new Error("Cabeçalho de ordenação de skills inválido.");
    }
    const isActive = headerKey === sortKey;
    const nextDirection = isActive && sortDirection === "ascending" ? "descending" : "ascending";
    header.setAttribute("aria-sort", isActive ? sortDirection : "none");
    button.setAttribute(
      "aria-label",
      `Ordenar por ${button.dataset.skillSortLabel} em ordem ${nextDirection === "ascending" ? "crescente" : "decrescente"}`,
    );
    const indicator = button.querySelector<HTMLElement>(".skill-sort-indicator");
    if (!indicator) {
      throw new Error("Indicador de ordenação da skill não encontrado.");
    }
    indicator.textContent = isActive ? (sortDirection === "ascending" ? "↑" : "↓") : "↕";
  });

  list.innerHTML = filteredSkills.map((skill) => `
    <tr>
      <td><a class="skill-table-link" href="#skill/${skill.id}">${escapeHtml(skill.name)}</a></td>
      <td>${renderSkillElementalType(skill.type)}</td>
      <td>${renderSkillCategories(skill.category)}</td>
      <td>${escapeHtml(formatSkillRange(skill.mpCost))}</td>
      <td>${escapeHtml(formatSkillRange(skill.cooldown, " s"))}</td>
      <td>${escapeHtml(formatSkillRange(skill.damage))}</td>
    </tr>
  `).join("");

  count.textContent = `Exibindo ${filteredSkills.length} de ${skills.length} skills`;
  emptyState.hidden = filteredSkills.length > 0;
}

function renderSkillsPage(): void {
  sectionScreen.innerHTML = `
    <section class="section-heading">
      <p class="eyebrow"><span class="eyebrow-line"></span> GUIA DA COMUNIDADE</p>
      <h1 class="section-title">Skills<span>.</span></h1>
      <p class="section-description">Consulte as skills catalogadas, seus atributos conhecidos e os slimes associados.</p>
    </section>
    <div class="skill-toolbar">
      <label class="skill-search">
        <span class="sr-only">Buscar skill ou slime</span>
        <input id="skill-search" type="search" placeholder="Buscar por skill ou slime..." autocomplete="off" />
      </label>
      <label class="skill-type-filter">
        <span class="sr-only">Filtrar por tipo de skill</span>
        <select id="skill-type-filter">
          <option value="all">Todos os tipos</option>
          ${slimeTypes.map(({ id, name }) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`).join("")}
          <option value="unknown">Tipo a catalogar</option>
        </select>
      </label>
    </div>
    <p class="skill-results-count" id="skill-results-count" aria-live="polite"></p>
    <div class="skill-table-frame">
      <table class="skill-table">
        <thead>
          <tr>
            <th scope="col" aria-sort="ascending"><button class="skill-sort-button" type="button" data-skill-sort="name" data-skill-sort-label="Nome"><span>Nome</span><span class="skill-sort-indicator" aria-hidden="true">↑</span></button></th>
            <th scope="col" aria-sort="none"><button class="skill-sort-button" type="button" data-skill-sort="type" data-skill-sort-label="Tipo"><span>Tipo</span><span class="skill-sort-indicator" aria-hidden="true">↕</span></button></th>
            <th scope="col" aria-sort="none"><button class="skill-sort-button" type="button" data-skill-sort="category" data-skill-sort-label="Categoria"><span>Categoria</span><span class="skill-sort-indicator" aria-hidden="true">↕</span></button></th>
            <th scope="col" aria-sort="none"><button class="skill-sort-button" type="button" data-skill-sort="mpCost" data-skill-sort-label="MP"><span>MP</span><span class="skill-sort-indicator" aria-hidden="true">↕</span></button></th>
            <th scope="col" aria-sort="none"><button class="skill-sort-button" type="button" data-skill-sort="cooldown" data-skill-sort-label="Recarga"><span>Recarga</span><span class="skill-sort-indicator" aria-hidden="true">↕</span></button></th>
            <th scope="col" aria-sort="none"><button class="skill-sort-button" type="button" data-skill-sort="damage" data-skill-sort-label="Dano"><span>Dano</span><span class="skill-sort-indicator" aria-hidden="true">↕</span></button></th>
          </tr>
        </thead>
        <tbody id="skill-list"></tbody>
      </table>
    </div>
    <div class="section-empty skill-empty" id="skill-empty-state" hidden>
      <strong>Nenhuma skill encontrada</strong>
      <p>Tente buscar por outro nome ou ajustar o filtro.</p>
    </div>
  `;
  const search = sectionScreen.querySelector<HTMLInputElement>("#skill-search");
  const typeFilter = sectionScreen.querySelector<HTMLSelectElement>("#skill-type-filter");
  if (!search || !typeFilter) {
    throw new Error("Não foi possível inicializar os filtros de skills.");
  }
  let sortKey: SkillSortKey = "name";
  let sortDirection: SkillSortDirection = "ascending";
  const updateSkills = () => renderSkillCards(search.value, typeFilter.value, sortKey, sortDirection);
  search.addEventListener("input", updateSkills);
  typeFilter.addEventListener("change", updateSkills);
  sectionScreen.querySelector<HTMLTableElement>(".skill-table")?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const button = target.closest<HTMLButtonElement>("[data-skill-sort]");
    const nextKey = button?.dataset.skillSort;
    if (!nextKey || !isSkillSortKey(nextKey)) {
      return;
    }
    if (sortKey === nextKey) {
      sortDirection = sortDirection === "ascending" ? "descending" : "ascending";
    } else {
      sortKey = nextKey;
      sortDirection = "ascending";
    }
    updateSkills();
  });
  updateSkills();
}

function renderSkillDetails(skill: Skill): void {
  const users = slimes.filter((slime) => slime.skills?.includes(skill.id));
  sectionScreen.innerHTML = `
    <a class="back-link" href="#skills"><span aria-hidden="true">←</span> Voltar às Skills</a>
    <section class="skill-detail-card">
      <header class="skill-detail-heading">
        <div>
          <p class="eyebrow"><span class="eyebrow-line"></span> SKILL CATALOGADA</p>
          <h1 class="section-title">${escapeHtml(skill.name)}<span>.</span></h1>
        </div>
        ${renderSkillCategories(skill.category)}
      </header>
      <dl class="skill-detail-stats">
        <div><dt>Tipo elemental</dt><dd>${renderSkillElementalType(skill.type)}</dd></div>
        <div><dt>MP</dt><dd>${escapeHtml(formatSkillRange(skill.mpCost))}</dd></div>
        <div><dt>Recarga</dt><dd>${escapeHtml(formatSkillRange(skill.cooldown, " s"))}</dd></div>
        <div><dt>Dano</dt><dd>${escapeHtml(formatSkillRange(skill.damage))}</dd></div>
      </dl>
      <section class="skill-detail-users" aria-labelledby="skill-users-heading">
        <h2 id="skill-users-heading">Slimes com esta skill</h2>
        ${users.length > 0
          ? `<ul>${users.map((slime) => `
              <li>
                <a class="skill-user-card" href="#slime/${slime.id}">
                  ${renderSlimeAvatar(slime, "skill-user-avatar")}
                  <span class="skill-user-name">${escapeHtml(slime.name ?? "Nome a confirmar")}</span>
                  <span class="skill-user-id">#${String(slime.id).padStart(3, "0")}</span>
                </a>
              </li>
            `).join("")}</ul>`
          : '<p class="detail-unknown">Nenhum slime com esta skill foi registrado até agora.</p>'}
      </section>
    </section>
  `;
}

function renderMapPage(): void {
  sectionScreen.innerHTML = `
    <section class="section-heading">
      <p class="eyebrow"><span class="eyebrow-line"></span> GUIA DA COMUNIDADE</p>
      <h1 class="section-title">Map<span>.</span></h1>
      <p class="section-description">Explore os locais conhecidos e descubra quais slimes já foram registrados por lá.</p>
    </section>
    <div class="demo-notice" role="note">
      <span class="notice-icon" aria-hidden="true">i</span>
      <p><strong>Mapa em preparação.</strong> Esta prévia organiza os locais e avistamentos registrados. As posições no mapa do jogo serão adicionadas depois.</p>
    </div>
    <section class="map-layout" aria-label="Explorar locais">
      <aside class="map-sidebar">
        <label class="map-search"><span class="sr-only">Buscar local</span><span class="search-icon" aria-hidden="true"></span><input id="map-search" type="search" placeholder="Buscar local..." autocomplete="off" /></label>
        <p class="map-list-label">${locations.length} LOCAIS NO CATÁLOGO</p>
        <div class="map-location-list" id="map-location-list"></div>
      </aside>
      <div class="map-main">
        <div class="map-canvas" role="img" aria-label="Prévia decorativa do mapa; posições reais ainda não disponíveis">
          <div class="map-contour contour-one"></div><div class="map-contour contour-two"></div><div class="map-contour contour-three"></div>
          <span class="map-canvas-label">MAPA DO MUNDO</span><span class="map-canvas-caption">POSIÇÕES A CATALOGAR</span><span class="map-canvas-star" aria-hidden="true">✳</span>
          <div class="map-canvas-message"><span aria-hidden="true">⌖</span><strong>O mapa está sendo preparado</strong><p>Locais selecionáveis e dados de avistamento já estão disponíveis.</p></div>
        </div>
        <section class="map-location-detail" id="map-location-detail" aria-live="polite"></section>
      </div>
    </section>
  `;
  sectionScreen.querySelector<HTMLInputElement>("#map-search")?.addEventListener("input", (event) => {
    renderMapLocations((event.currentTarget as HTMLInputElement).value);
  });
  sectionScreen.querySelector<HTMLDivElement>("#map-location-list")?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const button = target.closest<HTMLButtonElement>("[data-location-id]");
    const locationId = button?.dataset.locationId;
    if (!locationId || !locations.some(({ id }) => id === locationId)) {
      return;
    }
    selectedMapLocationId = locationId;
    renderMapLocations(sectionScreen.querySelector<HTMLInputElement>("#map-search")?.value ?? "");
  });
  renderMapLocations("");
}

function renderRoute(): void {
  const match = window.location.hash.match(/^#slime\/(\d+)$/);
  const skillMatch = window.location.hash.match(/^#skill\/([a-z0-9-]+)$/);
  const hash = window.location.hash;
  const skill = skillMatch
    ? skills.find(({ id }) => id === skillMatch[1])
    : undefined;
  const isSkillsPage = hash === "#skills" || skillMatch !== null;
  const isSynthesisPage = hash === "#sinteses";
  const isMapPage = hash === "#map";
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#slimes"]').classList.toggle("is-active", !isSkillsPage && !isSynthesisPage && !isMapPage);
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#skills"]').classList.toggle("is-active", isSkillsPage);
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#sinteses"]').classList.toggle("is-active", isSynthesisPage);
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#map"]').classList.toggle("is-active", isMapPage);

  if (isSkillsPage || isSynthesisPage || isMapPage) {
    homeContent.hidden = true;
    detailScreen.hidden = true;
    sectionScreen.hidden = false;
    if (isSkillsPage) {
      if (skillMatch && skill) {
        renderSkillDetails(skill);
      } else if (skillMatch) {
        sectionScreen.innerHTML = `
          <a class="back-link" href="#skills"><span aria-hidden="true">←</span> Voltar às Skills</a>
          <section class="detail-card"><h1 class="detail-title">Skill não encontrada</h1><p class="detail-unknown">Não existe uma skill catalogada com este identificador.</p></section>
        `;
      } else {
        renderSkillsPage();
      }
    } else if (isSynthesisPage) {
      renderSynthesisPage();
    } else {
      renderMapPage();
    }
    window.scrollTo(0, 0);
    return;
  }

  sectionScreen.hidden = true;
  if (!match) {
    detailScreen.hidden = true;
    homeContent.hidden = false;
    return;
  }

  const slimeId = Number(match[1]);
  const slime = slimesById.get(slimeId);
  if (!slime) {
    detailScreen.innerHTML = `
      <a class="back-link" href="#slimes"><span aria-hidden="true">←</span> Voltar à Slimepedia</a>
      <section class="detail-card"><h1 class="detail-title">Slime não encontrado</h1><p class="detail-unknown">Não existe registro com o número ${escapeHtml(String(slimeId))}.</p></section>
    `;
  } else {
    renderSlimeDetails(slime);
  }
  homeContent.hidden = true;
  detailScreen.hidden = false;
  window.scrollTo(0, 0);
}

totalCount.textContent = String(slimes.length).padStart(2, "0");

function renderSlimes(): void {
  if (!isSortKey(sortSelect.value)) {
    throw new Error(`Critério de ordenação inválido: ${sortSelect.value}`);
  }

  const filteredSlimes = getSlimeList(slimes, {
    query: searchInput.value,
    type: getSelectedType(typeFilter.value),
    sortBy: sortSelect.value,
  });

  rows.innerHTML = filteredSlimes
    .map(
      (slime) => `
        <tr>
          <td class="number-cell">#${String(slime.id).padStart(3, "0")}</td>
          <td>
            <div class="slime-name">
              ${renderSlimeAvatar(slime)}
              <a class="slime-link" href="#slime/${slime.id}">${escapeHtml(slime.name ?? "Nome a confirmar")}</a>
            </div>
          </td>
          <td>${slime.type1 ? `<span class="type-tag type-tag-${escapeHtml(slime.type1)}"><i></i>${escapeHtml(getTypeName(slime.type1))}</span>` : '<span class="type-empty">A catalogar</span>'}</td>
          <td>${slime.type2 ? `<span class="type-tag type-tag-${escapeHtml(slime.type2)}"><i></i>${escapeHtml(getTypeName(slime.type2))}</span>` : '<span class="type-empty">—</span>'}</td>
          <td class="detail-cell">${renderTraitCell(slime)}</td>
        </tr>
      `,
    )
    .join("");

  emptyState.hidden = filteredSlimes.length > 0;
  rows.closest("table")?.classList.toggle("is-empty", filteredSlimes.length === 0);
  resultCount.textContent = `Exibindo ${filteredSlimes.length} de ${slimes.length} slimes`;
}

searchInput.addEventListener("input", renderSlimes);
typeFilter.addEventListener("change", renderSlimes);
sortSelect.addEventListener("change", renderSlimes);
window.addEventListener("hashchange", renderRoute);
function showHeroSlide(index: number): void {
  activeHeroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    slide.hidden = slideIndex !== activeHeroSlideIndex;
  });
  heroCarouselProgress.style.setProperty("--hero-slide-duration", `${HERO_SLIDE_DURATION_MS}ms`);
  heroCarouselProgress.classList.remove("is-running");
  void heroCarouselProgress.offsetWidth;
  heroCarouselProgress.classList.add("is-running");
}
showHeroSlide(activeHeroSlideIndex);
window.setInterval(() => showHeroSlide(activeHeroSlideIndex + 1), HERO_SLIDE_DURATION_MS);
const closeMobileMenu = () => {
  primaryNavigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
};
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  primaryNavigation.classList.toggle("is-open", !isOpen);
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
});
primaryNavigation.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("a")) {
    closeMobileMenu();
  }
});
document.addEventListener("click", (event) => {
  if (event.target instanceof Element && !event.target.closest(".topbar")) {
    closeMobileMenu();
  }
});
detailScreen.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const reverseButton = target.closest<HTMLButtonElement>("[data-reverse-detail-recipe]");
  if (reverseButton) {
    const article = reverseButton.closest<HTMLElement>(".detail-synthesis-recipe");
    const recipeIndexes = article?.dataset.recipeIndices?.split(",").map(Number) ?? [];
    if (!article || recipeIndexes.length === 0 || recipeIndexes.some((index) => !syntheses[index])) {
      throw new Error("Não foi possível inverter a receita de síntese.");
    }
    article.outerHTML = renderDetailSynthesisRecipe(recipeIndexes, article.dataset.reversed !== "true");
    return;
  }
  const link = target.closest<HTMLAnchorElement>("a[data-detail-scroll]");
  const section = link ? detailScreen.querySelector<HTMLElement>(link.hash) : null;
  if (!link || !section) {
    return;
  }
  event.preventDefault();
  section.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMobileMenu();
    menuToggle.focus();
    return;
  }
  if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    renderSlimes();
    searchInput.blur();
  }
});

renderSlimes();
renderRoute();
