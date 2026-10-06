import type { Slime } from "../data/slimes";
import type { SlimeTypeId } from "../data/types";

export type SortKey = "id" | "name";

export type SlimeListOptions = {
  query: string;
  type: SlimeTypeId | "all";
  sortBy: SortKey;
};

export function getSlimeList(slimes: Slime[], options: SlimeListOptions): Slime[] {
  const normalizedQuery = options.query.trim().toLocaleLowerCase("pt-BR");

  return slimes
    .filter((slime) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        (slime.name?.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ?? false) ||
        String(slime.id).padStart(3, "0").includes(normalizedQuery);
      const matchesType =
        options.type === "all" ||
        slime.type1 === options.type ||
        slime.type2 === options.type;

      return matchesQuery && matchesType;
    })
    .sort((first, second) => {
      if (options.sortBy === "name") {
        const nameComparison = (first.name ?? "").localeCompare(second.name ?? "", "pt-BR");
        return nameComparison || first.id - second.id;
      }

      const firstValue = first[options.sortBy];
      const secondValue = second[options.sortBy];
      return Number(firstValue) - Number(secondValue);
    });
}
