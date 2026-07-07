import { DiaryEntry } from './types';

const SAMPLE_TEXTS = [
  '朝日とともに起床。新しい一日が始まった。今日は天気が良さそうなので、外でのタスクをこなそう。\n\n午前中は集中力が高かったので、重要なプロジェクトを進められた。スムーズに進んでいる。\n\n夜は瞑想をして、明日へ向けて心を整える。',
  '今日は挑戦的な一日だった。朝のミーティングで新しい提案をしてみた。反応は上々だった。\n\n習慣も全てこなしてスッキリ。運動で体も整った。読書で知識も増やせた。\n\n夜は友人と食事。良い時間を過ごせた。',
  '天気の悪い日。こういう日こそ室内での作業に集中できる。AI学習に力を入れてみた。\n\n習慣も6つ全てクリア。特に読書は新しい本を開始した。内容が興味深い。\n\n夜遅くまで作業が続いたが、良い進捗が出た。',
  '休日だったので、のんびり過ごした。朝は瞑想とストレッチから。体をリセット。\n\n午後は読書に時間を使う。新しいジャンルの本を読んでみた。視点が広がる。\n\nランニングは軽く。夜は早めに就寝して心身の休息を優先。',
  '月曜日。新しい週の始まり。気分もリセットされている。朝のルーティンを丁寧に。\n\n仕事も順調。午後は習慣のトレーニングに力を入れた。筋肉も心も鍛えられた気がする。\n\nAI学習は実装まで進めた。成長を感じられる。',
  '繁忙期を迎えた。作業量が多いが、習慣は崩さない。朝のプッシュアップから始まる。\n\nスクワット、プランク、ランニング、読書、AI学習。6つ全て完了。\n\n疲れは感じるが、充実感も大きい。この積み重ねが力になるはず。',
  '今日のハイライト：朝食後に読書、昼にランニング、夜にAI学習。\n\n習慣のおかげで、毎日が充実している実感がある。身体の変化も実感。\n\n明日も同じペースで続けよう。365日継続が目標。',
];

const SAMPLE_ACTIVITIES = ['プロジェクト進捗', 'ミーティング', '設計', 'コーディング', 'テスト', 'ドキュメント作成', 'リサーチ'];

export function generateDemoData(): DiaryEntry[] {
  const today = new Date();
  const entries: DiaryEntry[] = [];

  // 過去14日分のデータを生成
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 習慣の達成パターンをランダムに（80%の確率で記録）
    if (Math.random() < 0.8) {
      const habitCompletionRate = Math.random();
      const entry: DiaryEntry = {
        id: `demo-${dateStr}`,
        date: dateStr,
        text: SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)],
        mood: Math.floor(Math.random() * 10) + 1, // 1-10
        energy: Math.floor(Math.random() * 10) + 1, // 1-10
        activity: SAMPLE_ACTIVITIES[Math.floor(Math.random() * SAMPLE_ACTIVITIES.length)],
        workTime: Math.floor(Math.random() * 480) + 60, // 1-8時間
        tasks: {
          pushups: habitCompletionRate > 0.1,
          squats: habitCompletionRate > 0.15,
          plank: habitCompletionRate > 0.2,
          run: habitCompletionRate > 0.25,
          reading: habitCompletionRate > 0.3,
          ai_learning: habitCompletionRate > 0.35,
        },
        imageGenerated: false,
        createdAt: new Date(date).toISOString(),
        updatedAt: new Date(date).toISOString(),
      };
      entries.push(entry);
    }
  }

  return entries;
}

export function initializeDemoData(): void {
  // デモモードで初回アクセス時のみ実行
  if (typeof window === 'undefined') return;

  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (!DEMO_MODE) return;

  const STORAGE_KEY = 'diary_entries_demo';
  const INIT_FLAG = 'demo_data_initialized';

  // 既に初期化済みならスキップ
  if (localStorage.getItem(INIT_FLAG)) return;

  // デモデータを生成して保存
  const demoData = generateDemoData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
  localStorage.setItem(INIT_FLAG, 'true');

  console.log('✅ Demo data initialized:', demoData.length, 'entries');
}
