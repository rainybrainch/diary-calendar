export interface Tasks {
  pushups: boolean;
  squats: boolean;
  plank: boolean;
  run: boolean;
  reading?: boolean;
  ai_learning?: boolean;
}

export interface DiaryEntry {
  id?: string; // Supabase ID
  date: string; // YYYY-MM-DD
  text: string;
  imagePath?: string; // user_id/YYYY-MM-DD.png
  mood: number; // 0-10
  energy: number; // 0-10
  activity: string;
  workTime: number; // minutes
  tasks: Tasks;
  imageGenerated: boolean;
  createdAt?: string;
  updatedAt?: string;
  // 7項目ライフログ（将来用）
  mental?: string;
  body?: string;
  work?: string;
  relationship?: string;
  money?: string;
  habit?: string;
  dream?: string;
}

export interface DiaryData {
  entries: DiaryEntry[];
}
