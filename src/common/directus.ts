import { Directus, Filter } from "@directus/sdk";
import { TypeMap } from "@directus/sdk/dist/types";
import {
  DbCollection,
  Definition,
  Example,
  Lesson,
  Page,
  Pattern,
  Root,
  Word,
} from "./types";

export interface LearnNarishDirectus extends TypeMap {
  lessons: Lesson;
  pages: Page;
  patterns: Pattern;
  words: Word;
  roots: Root;
  examples: Example;
  definitions: Definition;
}

export function loadDirectus(): Directus<LearnNarishDirectus> {
  return new Directus("https://learnnarish.llblumire.co.uk/data/");
}

export function filterSince<T extends DbCollection>(since: Date): Filter<T> {
  return {
    // @ts-ignore
    _or: [
      {
        date_updated: {
          _gt: since.toISOString(),
        },
      },
      {
        date_created: {
          _gt: since.toISOString(),
        },
      },
    ],
  };
}
