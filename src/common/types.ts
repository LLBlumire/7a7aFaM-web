import { DBSchema } from "idb";

export interface LearnNarishDb extends DBSchema {
  lessons: {
    key: number;
    value: Lesson;
    indexes: {
      "by-number": number;
    };
  };
  patterns: {
    key: number;
    value: Pattern;
    indexes: {
      "by-number": number;
    };
  };
  pages: {
    key: number;
    value: Page;
    indexes: {
      "by-display_order": number;
    };
  };
  words: {
    key: number;
    value: Word;
  };
  roots: {
    key: number;
    value: Root;
  };
  examples: {
    key: number;
    value: Example;
  };
  definitions: {
    key: number;
    value: Definition;
  };
  lastUpdated: {
    key: string;
    value: Date;
  };
}

export interface Lesson extends DbCollection {
  title?: string;
  number?: number;
  lesson?: string;
  narish_title?: string;
}

export interface Pattern extends DbCollection {
  name?: string;
  example: number;
  number: number;
  pattern: string;
}

export interface Page extends DbCollection {
  title?: string;
  link?: string;
  content?: string;
  display_order?: number;
}

export interface Word extends DbCollection {
  root?: number;
  word?: string;
  pattern?: number;
  pos?: string;
  definitions: number[];
}

export interface Root extends DbCollection {
  bone_one?: string;
  bone_two?: string;
  words?: number[];
}

export interface Example extends DbCollection {
  narish?: string;
  english?: string;
  definition?: number;
}

export interface Definition extends DbCollection {
  definition?: string;
  word?: number;
  examples?: number[];
}

export interface DbCollection {
  id?: number;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
}

export interface WordData {
  id: number;
  word: string;
  pos: string;
  root?: {
    id: number;
    bone_one: string;
    bone_two: string;
  };
  pattern?: {
    name: string;
    number: number;
  };
  definitions: {
    definition: string;
    examples: {
      english: string;
      narish?: string;
    }[];
  }[];
}
