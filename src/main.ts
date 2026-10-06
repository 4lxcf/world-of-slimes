import { slimes, type Slime } from "./data/slimes";
import { items } from "./data/items";
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
        <a class="topnav-link is-active" href="#slimes">Slimes</a>
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
          <div class="hero-caption"><span>01</span> TODO GRANDE TIME COMEÇA COM UMA DESCOBERTA.</div>
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
    const time = timeOfDay === "Both" ? "Day · Night" : timeOfDay;
    return `<li><strong>${escapeHtml(location.name)}</strong><span class="detail-meta">${level} · ${escapeHtml(time)}</span></li>`;
  }).join("")}</ul>`;
}

function renderDetailTraits(slime: Slime): string {
  if (slime.traits === null) {
    return '<p class="detail-unknown">A catalogar</p>';
  }
  if (slime.traits.length === 0) {
    return '<p class="detail-unknown">Nenhuma Trait registrada</p>';
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
    const mp = skill.mpCost === null ? "—" : String(skill.mpCost);
    const cooldown = skill.cooldown === null ? "—" : String(skill.cooldown);
    const damage = skill.damage === null ? "—" : String(skill.damage);
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
    ({ slimeIds, resultSlimeId }) => slimeIds.includes(slime.id) || resultSlimeId === slime.id,
  );

  if (recipes.length > 0) {
    return `<ul class="detail-list">${recipes.map((recipe) => {
      const [first, second] = [...recipe.slimeIds].sort((a, b) => a - b);
      const level = recipe.requiredLevel === null ? "Level não informado" : `Level ${recipe.requiredLevel}`;
      const requiredItems = recipe.requiredItems === null
        ? "Itens necessários não informados"
        : recipe.requiredItems.length === 0
          ? "Sem item adicional"
          : recipe.requiredItems.map((itemId) => {
              const item = itemsById.get(itemId);
              if (!item) {
                throw new Error(`Item não cadastrado na receita "${recipe.id}": ${itemId}`);
              }
              return item.name;
            }).map(escapeHtml).join(", ");
      return `<li>${renderSlimeLink(first)} + ${renderSlimeLink(second)} <span class="detail-meta">${level} · ${escapeHtml(requiredItems)} → ${renderSlimeLink(recipe.resultSlimeId)}</span></li>`;
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

function renderRoute(): void {
  const match = window.location.hash.match(/^#slime\/(\d+)$/);
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
          <td class="detail-cell">${renderKnownList(slime.traits?.map((traitId) => {
            const name = traitNames.get(traitId);
            if (!name) {
              throw new Error(`Trait não cadastrada: ${traitId}`);
            }
            return name;
          }))}</td>
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
