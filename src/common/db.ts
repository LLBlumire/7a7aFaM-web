import {
  IDBPDatabase,
  IndexKey,
  IndexNames,
  openDB,
  StoreKey,
  StoreNames,
} from "idb";
import { loadDirectus, filterSince } from "./directus";
import {
  Definition,
  Example,
  LearnNarishDb,
  Page,
  Pattern,
  Root,
  Word,
  WordData,
} from "./types";
import { narishSort } from "./utils";

type GetKey<
  Name extends StoreNames<LearnNarishDb>,
  I extends IndexNames<LearnNarishDb, Name>
> =
  | {
      storeKey: StoreKey<LearnNarishDb, Name>;
      indexKey?: undefined;
      index?: undefined;
    }
  | {
      indexKey: IndexKey<LearnNarishDb, Name, I>;
      index: I;
      storeKey?: undefined;
    };

class DBTable<Name extends StoreNames<LearnNarishDb>> {
  forStore: Name;
  public constructor(forStore) {
    this.forStore = forStore;
  }
  public async get<I extends IndexNames<LearnNarishDb, Name>>(
    db: IDBPDatabase<LearnNarishDb>,
    key: GetKey<Name, I>
  ): Promise<DBResult<LearnNarishDb[Name]["value"]>> {
    let local = key.indexKey
      ? db.getFromIndex(this.forStore, key.index, key.indexKey)
      : db.get(this.forStore, key.storeKey);
    let remote = this.sync(db).then(() =>
      key.indexKey
        ? db.getFromIndex(this.forStore, key.index, key.indexKey)
        : db.get(this.forStore, key.storeKey)
    );
    return {
      local: await local,
      remote,
    };
  }
  public async getAll(
    db: IDBPDatabase<LearnNarishDb>,
    index?: IndexNames<LearnNarishDb, Name>
  ): Promise<DBResult<LearnNarishDb[Name]["value"][]>> {
    let local = index
      ? db.getAllFromIndex(this.forStore, index)
      : db.getAll(this.forStore);
    let remote = this.sync(db).then(() =>
      index
        ? db.getAllFromIndex(this.forStore, index)
        : db.getAll(this.forStore)
    );
    return {
      local: await local,
      remote,
    };
  }
  public async sync(db: IDBPDatabase<LearnNarishDb>): Promise<void> {
    const since = (await this.getLastSync(db)) ?? new Date(-62135596800000);
    let directus;
    let page = 1;
    let directusData = [];
    do {
      directus = await loadDirectus()
        .items(this.forStore)
        .readMany({
          filter: filterSince(since),
          meta: "filter_count",
          page,
        });
      directusData = [...directusData, ...directus.data];
      page += 1;
    } while (directusData.length < directus.meta.filter_count);
    const tx = db.transaction(this.forStore, "readwrite");
    const store = tx.objectStore(this.forStore);
    for (const data of directusData) {
      await store.put({ ...data });
    }
    await this.setLastSync(db);
    return await tx.done;
  }
  async getLastSync(db: IDBPDatabase<LearnNarishDb>): Promise<Date> {
    const lastUpdatedDb = db
      .transaction("lastUpdated")
      .objectStore("lastUpdated");
    return lastUpdatedDb.get(this.forStore);
  }
  async setLastSync(db: IDBPDatabase<LearnNarishDb>): Promise<string> {
    const lastUpdatedDb = db
      .transaction("lastUpdated", "readwrite")
      .objectStore("lastUpdated");
    return lastUpdatedDb.put(new Date(), this.forStore);
  }
}

export interface DBResult<T> {
  local: T;
  remote: Promise<T>;
}

async function loadDb(): Promise<IDBPDatabase<LearnNarishDb>> {
  let db = await openDB<LearnNarishDb>("learnnarish", 1, {
    upgrade(db) {
      const lessonStore = db.createObjectStore("lessons", {
        keyPath: "id",
      });
      lessonStore.createIndex("by-number", "number");
      const pageStore = db.createObjectStore("pages", {
        keyPath: "id",
      });
      pageStore.createIndex("by-display_order", "display_order");
      db.createObjectStore("words", {
        keyPath: "id",
      });
      db.createObjectStore("roots", {
        keyPath: "id",
      });
      db.createObjectStore("examples", {
        keyPath: "id",
      });
      db.createObjectStore("definitions", {
        keyPath: "id",
      });
      const patternStore = db.createObjectStore("patterns", {
        keyPath: "id",
      });
      patternStore.createIndex("by-number", "number");
      db.createObjectStore("lastUpdated");
    },
  });
  return db;
}

export const DB_LESSONS = loadDb().then((db) =>
  new DBTable<"lessons">("lessons").getAll(db, "by-number")
);
export const DB_PATTERNS = loadDb().then((db) =>
  new DBTable<"patterns">("patterns").getAll(db, "by-number")
);
export const DB_PAGES = loadDb().then((db) =>
  new DBTable<"pages">("pages").getAll(db)
);
export const DB_WORDS = loadDb().then((db) =>
  new DBTable<"words">("words").getAll(db)
);
export const DB_EXAMPLES = loadDb().then((db) =>
  new DBTable<"examples">("examples").getAll(db)
);
export const DB_ROOTS = loadDb().then((db) =>
  new DBTable<"roots">("roots").getAll(db)
);
export const DB_DEFINITIONS = loadDb().then((db) =>
  new DBTable<"definitions">("definitions").getAll(db)
);

export const DB_PAGES_ORDERED = DB_PAGES.then((res) => {
  function process(pages: Page[]): Page[] {
    const orderablePages = pages.filter((page) => page.display_order !== null);
    const orderedPages = orderablePages.sort(
      (left, right) => left.display_order - right.display_order
    );
    return orderedPages;
  }
  return {
    local: process(res.local),
    remote: res.remote.then((remote) => process(remote)),
  };
});

export const PAGES_LINK_MAP = DB_PAGES.then((res) => {
  function process(pages: Page[]): Map<string, Page> {
    return pages.reduce(
      (map, page) => map.set(page.link ?? "", page),
      new Map<string, Page>()
    );
  }
  return {
    local: process(res.local),
    remote: res.remote.then((remote) => process(remote)),
  };
});

export const WORD_DATA = Promise.all([
  DB_WORDS,
  DB_PATTERNS,
  DB_ROOTS,
  DB_DEFINITIONS,
  DB_EXAMPLES,
]).then(([words, patterns, roots, definitions, examples]) => {
  function process(
    words: Word[],
    patterns: Pattern[],
    roots: Root[],
    definitions: Definition[],
    examples: Example[]
  ): WordData[] {
    return words.map((word) => {
      const root = roots.find((root) => root.id == word.root);
      const pattern = word.pattern
        ? patterns.find((pattern) => pattern.id == word.pattern)
        : undefined;
      const wordDefinitions = definitions.filter((definition) =>
        word.definitions.includes(definition.id)
      );
      return {
        id: word.id,
        word: word.word,
        pos: word.pos,
        root: root
          ? {
              id: root.id,
              bone_one: root.bone_one,
              bone_two: root.bone_two,
            }
          : undefined,
        pattern: pattern
          ? {
              name: pattern.name,
              number: pattern.number,
            }
          : undefined,
        definitions: wordDefinitions.map((definition) => {
          const definitionExamples = examples.filter((example) =>
            definition.examples.includes(example.id)
          );
          return {
            definition: definition.definition,
            examples: definitionExamples.map((example) => {
              return {
                narish: example.narish,
                english: example.english,
              };
            }),
          };
        }),
      };
    });
  }
  return {
    local: process(
      words.local,
      patterns.local,
      roots.local,
      definitions.local,
      examples.local
    ),
    remote: Promise.all([
      words.remote,
      patterns.remote,
      roots.remote,
      definitions.remote,
      examples.remote,
    ]).then(([words, patterns, roots, definitions, examples]) =>
      process(words, patterns, roots, definitions, examples)
    ),
  };
});

export const SORTED_WORDS = WORD_DATA.then((wordData) => {
  function process(wordData: WordData[]): WordData[] {
    return wordData.sort(narishSort);
  }
  return {
    local: process(wordData.local),
    remote: wordData.remote.then((remote) => process(remote)),
  };
});

export const WORD_DATA_ID_MAP = WORD_DATA.then((wordData) => {
  function process(wordData: WordData[]): Map<number, WordData> {
    return wordData.reduce(
      (map, wordData) => map.set(wordData.id, wordData),
      new Map<number, WordData>()
    );
  }
  return {
    local: process(wordData.local),
    remote: wordData.remote.then((remote) => process(remote)),
  };
});
