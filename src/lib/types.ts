export interface Tasks {
  pushups: boolean;
  squats: boolean;
  plank: boolean;
  run: boolean;
  reading?: boolean;
  ai_learning?: boolean;
}

export interface ForestNoteJSON {
  version: string;
  date: string;
  title: string;
  theme: string;
  summary: string;
  scores: {
    mental: number;
    body: number;
    work: number;
    relationship: number;
    money: number;
    habit: number;
    dream: number;
  };
  mental: string;
  body: string;
  work: string;
  relationship: string;
  money: string;
  habit: string;
  dream: string;
  keywords: string[];
  items: string[];
  locations: string[];
  activities: string[];
  emotions: string[];
  today_best: string;
  lesson: string;
  tomorrow: string;
  ai_comment: string;
}

export interface CardJSON {
  card_id: string;
  card_type: string;
  date: string;
  title: string;
  card_name: string;
  rarity: string;
  attribute: string;
  hp: number;
  atk: number;
  energy: number;
  skill: {
    name: string;
    type: string;
    effect: string;
  };
  flavor_text: string;
  image_prompt: string;
  image_url: string;
  forest_note: Record<string, unknown>;
}

export interface DiaryEntry {
  id?: string; // Supabase ID
  date: string; // YYYY-MM-DD
  text: string;
  imagePath?: string | null; // user_id/YYYY-MM-DD.png
  mood: number; // 0-10
  energy: number; // 0-10
  activity: string;
  workTime: number; // minutes
  tasks: Tasks;
  imageGenerated?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // 7項目ライフログ（スコア）
  mental?: number;
  body?: number;
  work?: number;
  relationship?: number;
  money?: number;
  habit?: number;
  dream?: number;
  // 7項目ライフログ（テキスト本文） - 仕様書 Chapter1
  mentalText?: string;
  bodyText?: string;
  workText?: string;
  relationshipText?: string;
  moneyText?: string;
  habitText?: string;
  dreamText?: string;
  // キーワード・リスト - 仕様書 Chapter1
  keywords?: string[];
  items?: string[];
  locations?: string[];
  activities?: string[];
  emotions?: string[];
  todayBest?: string;
  lesson?: string;
  tomorrow?: string;
  aiComment?: string;
  // Forest Note & Card Data - 仕様書 Chapter1
  forestNoteJson?: ForestNoteJSON;
  imagePrompt?: string;
  imageUrl?: string;
  cardId?: string;
  cardJson?: CardJSON;
  cardImageUrl?: string;
  // Generation Status Flags
  forestGenerated?: boolean;
  cardGenerated?: boolean;
}

export interface DiaryData {
  entries: DiaryEntry[];
}
