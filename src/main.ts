import { slimes, type Slime } from "./data/slimes";
import { items, type ItemId } from "./data/items";
import { locations } from "./data/locations";
import { skills } from "./data/skills";
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

function renderList(items: string[]): string {
  if (items.length === 0) {
    return '<span class="type-empty">—</span>';
  }

  return `<ul class="detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderKnownList(items: string[] | null | undefined): string {
  return items === null || items === undefined
    ? '<span class="type-empty">A catalogar</span>'
    : renderList(items);
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

  return renderKnownList(slime.traits.map((traitId) => {
    const name = traitNames.get(traitId);
    if (!name) {
      throw new Error(`Trait não cadastrada: ${traitId}`);
    }
    return name;
  }));
}

const slimesById = new Map(slimes.map((slime) => [slime.id, slime]));
const itemsById = new Map(items.map((item) => [item.id, item]));
const locationsById = new Map(locations.map((location) => [location.id, location]));
const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
const typeNames = new Map(slimeTypes.map(({ id, name }) => [id, name]));
const traitNames = new Map(traits.map(({ id, name }) => [id, name]));

app.innerHTML = `
  <div class="site-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Slimepedia, página inicial">
        <span class="brand-mark" aria-hidden="true"><span></span></span>
        <span class="brand-name">slimepedia<span>.</span></span>
      </a>
      <nav class="topnav" aria-label="Navegação principal">
        <a class="topnav-link" href="#slimes">Slimepedia</a>
        <a class="topnav-link" href="#sinteses">Sínteses</a>
        <a class="topnav-link" href="#map">Map</a>
        <a class="topnav-link" href="#sobre">Sobre o projeto</a>
      </nav>
      <span class="game-label"><span class="status-dot"></span> WORLD OF SLIMES</span>
    </header>

    <main id="home-content">
      <section class="intro" id="sobre">
        <div class="intro-copy">
          <p class="eyebrow"><span class="eyebrow-line"></span> GUIA DA COMUNIDADE</p>
          <h1>Conheça cada<br /><span>slime.</span></h1>
          <p class="intro-description">Seu guia para descobrir, comparar e encontrar os slimes de World of Slimes.</p>
          <a class="explore-link" href="#slimes">Explorar a Slimepedia <span aria-hidden="true">↓</span></a>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="hero-spark spark-one">✳</div>
          <div class="hero-spark spark-two">✦</div>
          <div class="hero-spark spark-three">·</div>
          <div class="hero-slime"><i></i><b></b><span></span></div>
          <div class="hero-caption">TODO GRANDE TIME COMEÇA COM UMA DESCOBERTA.</div>
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
              <option value="all">Todos os tipos</option>
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
let selectedMapLocationId: string = locations[0]?.id ?? "";
let selectedSynthesisItem: ItemId | null = null;

const SYNTHESIS_LEVEL_MIN = 7;
const SYNTHESIS_LEVEL_MAX = 21;
const SYNTHESIS_LEVELS_PER_RANGE = 3;

function getSynthesisLevelRange(level: number): { min: number; max: number } | null {
  if (!Number.isInteger(level) || level < SYNTHESIS_LEVEL_MIN || level > SYNTHESIS_LEVEL_MAX) {
    return null;
  }
  const rangeMin = SYNTHESIS_LEVEL_MIN +
    Math.floor((level - SYNTHESIS_LEVEL_MIN) / SYNTHESIS_LEVELS_PER_RANGE) * SYNTHESIS_LEVELS_PER_RANGE;
  return {
    min: rangeMin,
    max: Math.min(rangeMin + SYNTHESIS_LEVELS_PER_RANGE - 1, SYNTHESIS_LEVEL_MAX),
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

function renderDetailTraits(slime: Slime): string {
  if (slime.traits === null || slime.traits === undefined) {
    return `<p class="detail-unknown">${escapeHtml(getTraitStatusText(slime))}</p>`;
  }
  if (slime.traits.length === 0) {
    return `<p class="detail-unknown">${escapeHtml(getTraitStatusText(slime))}</p>`;
  }

  return `<ul class="detail-list">${slime.traits.map((traitId) => {
    const trait = traits.find(({ id }) => id === traitId);
    if (!trait) {
      throw new Error(`Trait não cadastrada: ${traitId}`);
    }
    return `<li><strong>${escapeHtml(trait.name)}</strong><span class="detail-meta">${escapeHtml(trait.description)}</span></li>`;
  }).join("")}</ul>`;
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
    const formatRange = ({ min, max }: { min: number | null; max: number | null }) => {
      if (min === null && max === null) {
        return "—";
      }
      return `${min ?? "—"}–${max ?? "—"}`;
    };
    const mp = formatRange(skill.mpCost);
    const cooldown = formatRange(skill.cooldown);
    const damage = formatRange(skill.damage);
    return `<li><strong>${escapeHtml(skill.name)}</strong><span class="detail-meta">MP ${escapeHtml(mp)} · CD ${escapeHtml(cooldown)} · Dano ${escapeHtml(damage)}</span></li>`;
  }).join("")}</ul>`;
}

function renderDetailItems(slime: Slime): string {
  if (slime.drops === null) {
    return '<p class="detail-unknown">A catalogar</p>';
  }
  if (slime.drops.length === 0) {
    return '<p class="detail-unknown">Nenhum drop registrado</p>';
  }

  return `<ul class="detail-list">${slime.drops.map((itemId) => {
    const item = itemsById.get(itemId);
    if (!item) {
      throw new Error(`Item não cadastrado: ${itemId}`);
    }
    const description = item.description ?? "Descrição a catalogar";
    const type = item.type ?? "Tipo a catalogar";
    return `<li><strong>${escapeHtml(item.name)}</strong><span class="detail-meta">${escapeHtml(type)} · ${escapeHtml(description)}</span></li>`;
  }).join("")}</ul>`;
}

function renderDetailSynthesis(slime: Slime): string {
  const recipes = syntheses.filter(
    ({ mainSlimeId, subSlimeId, resultSlimeId }) =>
      mainSlimeId === slime.id || subSlimeId === slime.id || resultSlimeId === slime.id,
  );

  if (recipes.length > 0) {
    return `<ul class="detail-list">${recipes.map((recipe) => {
      const level = formatSynthesisLevel(recipe.requiredLevel);
      const ingredients = recipe.ingredients === null
        ? "Ingredients not confirmed"
        : recipe.ingredients.length === 0
          ? "No ingredients"
          : recipe.ingredients.map((itemId) => {
              const item = itemsById.get(itemId);
              if (!item) {
                throw new Error(`Item não cadastrado na receita "${recipe.id}": ${itemId}`);
              }
              return item.name;
            }).map(escapeHtml).join(", ");
      return `<li>${renderSlimeLink(recipe.mainSlimeId)} <span class="detail-meta">Main slime · ${level}</span> + ${renderSlimeLink(recipe.subSlimeId)} <span class="detail-meta">Sub slime · ${escapeHtml(ingredients)} → ${renderSlimeLink(recipe.resultSlimeId)}</span></li>`;
    }).join("")}</ul>`;
  }

  if (slime.synthesis === "unavailable") {
    return '<p class="detail-unknown">Não pode ser obtido por síntese</p>';
  }
  if (slime.synthesis === "unknown") {
    return '<p class="detail-unknown">Informação não verificada</p>';
  }
  return '<p class="detail-unknown">A catalogar</p>';
}

function renderSlimeDetails(slime: Slime): void {
  const types = [slime.type1, slime.type2]
    .filter((type): type is SlimeTypeId => type !== null)
    .map((type) => `<span class="type-tag type-tag-${escapeHtml(type)}"><i></i>${escapeHtml(getTypeName(type))}</span>`)
    .join("");

  detailScreen.innerHTML = `
    <a class="back-link" href="#slimes"><span aria-hidden="true">←</span> Voltar à Slimepedia</a>
    <section class="slime-detail-header">
      <span class="slime-avatar detail-avatar${slime.type1 ? ` type-${escapeHtml(slime.type1)}` : ""}" aria-hidden="true"><i></i><b></b></span>
      <div>
        <p class="eyebrow"><span class="eyebrow-line"></span> SLIME #${String(slime.id).padStart(3, "0")}</p>
        <h1 class="detail-title">${escapeHtml(slime.name ?? "Nome a confirmar")}</h1>
        <div class="detail-types">${types || '<span class="detail-unknown">Tipos a catalogar</span>'}</div>
      </div>
    </section>
    <div class="detail-grid">
      <section class="detail-card"><h2>Localizações</h2>${renderDetailLocations(slime)}</section>
      <section class="detail-card"><h2>Traits</h2>${renderDetailTraits(slime)}</section>
      <section class="detail-card"><h2>Skills</h2>${renderDetailSkills(slime)}</section>
      <section class="detail-card"><h2>Drops</h2>${renderDetailItems(slime)}</section>
      <section class="detail-card detail-card-wide"><h2>Sínteses</h2>${renderDetailSynthesis(slime)}</section>
    </div>
  `;
}

function getSlimeLabel(slime: Slime): string {
  return `${slime.name ?? "Nome a confirmar"} · #${String(slime.id).padStart(3, "0")}`;
}

function renderSlimeAvatar(slime: Slime, className = ""): string {
  const typeClass = slime.type1 ? ` type-${escapeHtml(slime.type1)}` : "";
  return `<span class="slime-avatar${typeClass}${className ? ` ${className}` : ""}" aria-hidden="true"><i></i><b></b></span>`;
}

function renderSlimePickerOptions(query = ""): string {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const matches = slimes.filter((slime) =>
    getSlimeLabel(slime).toLocaleLowerCase("pt-BR").includes(normalizedQuery),
  );
  if (matches.length === 0) {
    return '<p class="slime-picker-empty">Nenhum slime encontrado.</p>';
  }
  return matches.map((slime) => `
    <button class="slime-picker-option" type="button" data-select-slime="${slime.id}">
      ${renderSlimeAvatar(slime, "simulator-avatar")}
      <span>${escapeHtml(slime.name ?? "Nome a confirmar")}<small>#${String(slime.id).padStart(3, "0")}</small></span>
    </button>
  `).join("");
}

function renderKnownSyntheses(): string {
  if (syntheses.length === 0) {
    return '<div class="section-empty"><strong>Nenhuma síntese catalogada ainda</strong><p>As receitas confirmadas aparecerão aqui.</p></div>';
  }

  return syntheses.map((recipe) => {
    const level = formatSynthesisLevel(recipe.requiredLevel);
    const itemNames = recipe.ingredients === null
      ? "Ingredients not confirmed"
      : recipe.ingredients.length === 0
        ? "No ingredients"
        : recipe.ingredients.map((itemId) => {
            const item = itemsById.get(itemId);
            if (!item) {
              throw new Error(`Item não cadastrado na receita "${recipe.id}": ${itemId}`);
            }
            return escapeHtml(item.name);
          }).join(", ");
    return `
      <article class="recipe-card">
        <div class="recipe-combination">
          <span class="recipe-slime">${renderSlimeLink(recipe.mainSlimeId)} <small>Main slime</small></span>
          <span class="recipe-plus" aria-hidden="true">+</span>
          <span class="recipe-slime">${renderSlimeLink(recipe.subSlimeId)} <small>Sub slime</small></span>
          <span class="recipe-arrow" aria-hidden="true">→</span>
          <span class="recipe-result">${renderSlimeLink(recipe.resultSlimeId)}</span>
        </div>
        <div class="recipe-meta"><span>${escapeHtml(level)}</span><span>${itemNames}</span></div>
      </article>
    `;
  }).join("");
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
  const itemSelect = sectionScreen.querySelector<HTMLSelectElement>("#synthesis-item");
  selectedSynthesisItem = (itemSelect?.value as ItemId | undefined) || null;
  const hasSelection = mainSlimeId !== null || subSlimeId !== null || levelValue.length > 0 || selectedSynthesisItem !== null;
  if (levelValue.length > 0 && selectedRange === null) {
    results.innerHTML = `<div class="simulator-empty">Informe o level do Main slime entre ${SYNTHESIS_LEVEL_MIN} e ${SYNTHESIS_LEVEL_MAX}.</div>`;
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
    const levelEligible = selectedRange === null || recipe.requiredLevel === null ||
      (recipeRange !== null && recipeRange.min === selectedRange.min && recipeRange.max === selectedRange.max);
    const itemsEligible = selectedSynthesisItem === null ||
      recipe.ingredients === null ||
      (recipe.ingredients.length === 1 && recipe.ingredients[0] === selectedSynthesisItem);
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
      const resultSlime = slimesById.get(recipe.resultSlimeId);
      if (!resultSlime) {
        throw new Error(`Síntese referencia slime inexistente: #${recipe.resultSlimeId}`);
      }
      const mainSlime = slimesById.get(recipe.mainSlimeId);
      const subSlime = slimesById.get(recipe.subSlimeId);
      if (!mainSlime || !subSlime) {
        throw new Error(`Síntese "${recipe.id}" referencia slimes inexistentes.`);
      }
      const levelNote = formatSynthesisLevel(recipe.requiredLevel);
      const mainLevelNote = level === null ? "Level do Main slime não informado" : `Main slime Lv. ${level}`;
      const itemNote = recipe.ingredients === null
        ? "Ingredients not confirmed"
        : recipe.ingredients.length === 0
          ? "No ingredients"
          : recipe.ingredients.map((itemId) => {
              const item = itemsById.get(itemId);
              if (!item) {
                throw new Error(`Item não cadastrado na receita "${recipe.id}": ${itemId}`);
              }
              return escapeHtml(item.name);
            }).join(", ");
      return `<article class="simulator-result">
        <div class="simulator-result-slime">${renderSlimeAvatar(resultSlime, "simulator-avatar")}<div><a href="#slime/${resultSlime.id}">${escapeHtml(resultSlime.name ?? `Slime #${String(resultSlime.id).padStart(3, "0")}`)}</a><span class="simulator-result-number">#${String(resultSlime.id).padStart(3, "0")}</span></div></div>
        <div class="simulator-result-meta">
          <span><strong>Main slime:</strong> ${escapeHtml(mainSlime.name ?? `Slime #${String(mainSlime.id).padStart(3, "0")}`)} · ${escapeHtml(mainLevelNote)}</span>
          <span><strong>Sub slime:</strong> ${escapeHtml(subSlime.name ?? `Slime #${String(subSlime.id).padStart(3, "0")}`)} · level abaixo do Main slime</span>
          <span><strong>Ingredients:</strong> ${itemNote} · ${escapeHtml(levelNote)}</span>
        </div>
      </article>`;
    }).join("")}
    </div>
    <p class="simulator-footnote">Resultados atualizados com as opções selecionadas. Só são exibidas receitas catalogadas; outras combinações ainda podem ser descobertas.</p>
  `;
}

function renderSynthesisPage(): void {
  selectedSynthesisItem = null;
  const itemOptions = items.map((item) =>
    item.type === "Byproduct"
      ? `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`
      : "",
  ).join("");

  sectionScreen.innerHTML = `
    <section class="section-heading">
      <p class="eyebrow"><span class="eyebrow-line"></span> GUIA DA COMUNIDADE</p>
      <h1 class="section-title">Sínteses<span>.</span></h1>
      <p class="section-description">Consulte as receitas conhecidas ou experimente combinações no simulador.</p>
    </section>
    <div class="demo-notice" role="note">
      <span class="notice-icon" aria-hidden="true">i</span>
      <p><strong>Catálogo em construção.</strong> O simulador mostra apenas resultados presentes nas receitas registradas; resultados ausentes não significam que a combinação seja impossível.</p>
    </div>
    <section class="synthesis-simulator" aria-labelledby="simulator-heading">
      <div class="section-subheading">
        <div><p class="eyebrow"><span class="eyebrow-line"></span> MODO DE EXPERIMENTAÇÃO</p><h2 id="simulator-heading">Simulador de síntese</h2></div>
        <span class="mockup-badge">INTERATIVO</span>
      </div>
      <p class="simulator-intro">Escolha o Main slime e o Sub slime. O level informado pertence ao Main slime; o Sub slime precisa estar em um level menor.</p>
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
            <div class="slime-picker-menu" hidden><label class="sr-only" for="synthesis-sub-search">Search Sub slime</label><input class="slime-picker-search" id="synthesis-sub-search" type="search" placeholder="Search slime..." autocomplete="off" /><div class="slime-picker-options">${renderSlimePickerOptions()}</div></div>
          </div>
        </div>
        <span class="simulator-operator simulator-arrow" aria-hidden="true">→</span>
        <label class="field-label level-field">Main slime level<input id="synthesis-level" type="number" min="${SYNTHESIS_LEVEL_MIN}" max="${SYNTHESIS_LEVEL_MAX}" step="1" placeholder="7–21" /></label>
        <label class="field-label item-slot" for="synthesis-item">Ingredients (optional)<select id="synthesis-item"><option value="">No ingredients</option>${itemOptions}</select></label>
        <button class="button-secondary simulator-reset" type="button" data-reset-synthesis>↺ Reset</button>
      </div>
      <div class="simulator-results-wrap"><h3>Resultados possíveis</h3><div id="synthesis-results" aria-live="polite"></div></div>
    </section>
    <section class="known-recipes" aria-labelledby="known-recipes-heading">
      <div class="section-subheading">
        <div><p class="eyebrow"><span class="eyebrow-line"></span> RECEITAS REGISTRADAS</p><h2 id="known-recipes-heading">Sínteses conhecidas <span class="heading-count">${syntheses.length}</span></h2></div>
      </div>
      <div class="recipe-list">${renderKnownSyntheses()}</div>
    </section>
  `;

  const updateSimulator = () => {
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
    renderSynthesisResults();
  };

  const simulator = sectionScreen.querySelector<HTMLElement>(".synthesis-simulator");
  if (!simulator) {
    throw new Error("Não foi possível inicializar o simulador de síntese.");
  }
  simulator.querySelector<HTMLInputElement>("#synthesis-level")?.addEventListener("input", updateSimulator);
  simulator.querySelector<HTMLSelectElement>("#synthesis-item")?.addEventListener("change", () => {
    updateSimulator();
  });
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
      const itemSelect = simulator.querySelector<HTMLSelectElement>("#synthesis-item");
      if (levelInput) {
        levelInput.value = "";
      }
      if (itemSelect) {
        itemSelect.value = "";
      }
      selectedSynthesisItem = null;
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
    if (!target.closest(".simulator-slime-picker")) {
      simulator.querySelectorAll<HTMLDivElement>(".slime-picker-menu").forEach((menu) => {
        menu.setAttribute("hidden", "");
        menu.closest(".simulator-slime-picker")?.querySelector("button[data-toggle-slime-picker]")?.setAttribute("aria-expanded", "false");
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
    });
  });
  simulator.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches(".slime-picker-search")) {
      return;
    }
    const picker = target.closest<HTMLDivElement>(".simulator-slime-picker");
    const options = picker?.querySelector<HTMLDivElement>(".slime-picker-options");
    if (options) {
      options.innerHTML = renderSlimePickerOptions(target.value);
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
  const hash = window.location.hash;
  const isSynthesisPage = hash === "#sinteses";
  const isMapPage = hash === "#map";
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#slimes"]').classList.toggle("is-active", !isSynthesisPage && !isMapPage);
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#sinteses"]').classList.toggle("is-active", isSynthesisPage);
  getRequiredElement<HTMLAnchorElement>('.topnav-link[href="#map"]').classList.toggle("is-active", isMapPage);

  if (isSynthesisPage || isMapPage) {
    homeContent.hidden = true;
    detailScreen.hidden = true;
    sectionScreen.hidden = false;
    if (isSynthesisPage) {
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
              <span class="slime-avatar${slime.type1 ? ` type-${escapeHtml(slime.type1)}` : ""}" aria-hidden="true">
                <i></i><b></b>
              </span>
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
document.addEventListener("keydown", (event) => {
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
