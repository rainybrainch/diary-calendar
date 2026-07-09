export interface ParsedForestNote {
  date: string;
  text: string;
  mood?: number;
  energy?: number;
  // 7-item life log text descriptions
  mentalText?: string;
  bodyText?: string;
  workText?: string;
  relationshipText?: string;
  moneyText?: string;
  habitText?: string;
  dreamText?: string;
  tasks: {
    pushups: boolean;
    squats: boolean;
    plank: boolean;
    run: boolean;
    reading?: boolean;
    ai_learning?: boolean;
  };
}

export function parseForestNoteText(rawText: string): ParsedForestNote | null {
  // FOREST_NOTE_START と FOREST_NOTE_END を抽出
  const startMarker = '=== FOREST_NOTE_START ===';
  const endMarker = '=== FOREST_NOTE_END ===';

  const startIndex = rawText.indexOf(startMarker);
  const endIndex = rawText.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Forest Note形式が見つかりません。\n「=== FOREST_NOTE_START ===」と「=== FOREST_NOTE_END ===」を含める必要があります。');
  }

  const content = rawText.substring(startIndex + startMarker.length, endIndex).trim();

  try {
    const result: ParsedForestNote = {
      date: '',
      text: '',
      mood: undefined,
      energy: undefined,
      tasks: {
        pushups: false,
        squats: false,
        plank: false,
        run: false,
        reading: false,
        ai_learning: false,
      },
    };

    // 行ごとに解析
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('DATE:')) {
        result.date = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('MENTAL:')) {
        result.mentalText = trimmed.substring(7).trim();
      } else if (trimmed.startsWith('BODY:')) {
        result.bodyText = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('WORK:')) {
        result.workText = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('RELATION:')) {
        result.relationshipText = trimmed.substring(9).trim();
      } else if (trimmed.startsWith('MONEY:')) {
        result.moneyText = trimmed.substring(6).trim();
      } else if (trimmed.startsWith('HABIT:')) {
        // 習慣チェック処理
        const habitLines = lines.slice(lines.indexOf(line) + 1);
        for (const habitLine of habitLines) {
          const hTrimmed = habitLine.trim();
          if (!hTrimmed || hTrimmed.startsWith('DREAM:') || hTrimmed.startsWith('SUMMARY:')) {
            break;
          }

          if (hTrimmed.startsWith('PushUp:')) {
            result.tasks.pushups = hTrimmed.toLowerCase().includes('true') || hTrimmed.toLowerCase().includes('yes');
          } else if (hTrimmed.startsWith('Squat:')) {
            result.tasks.squats = hTrimmed.toLowerCase().includes('true') || hTrimmed.toLowerCase().includes('yes');
          } else if (hTrimmed.startsWith('Plank:')) {
            result.tasks.plank = hTrimmed.toLowerCase().includes('true') || hTrimmed.toLowerCase().includes('yes');
          } else if (hTrimmed.startsWith('Run:')) {
            result.tasks.run = hTrimmed.toLowerCase().includes('true') || hTrimmed.toLowerCase().includes('yes');
          } else if (hTrimmed.startsWith('Reading:')) {
            result.tasks.reading = hTrimmed.toLowerCase().includes('true') || hTrimmed.toLowerCase().includes('yes');
          } else if (hTrimmed.startsWith('AI:')) {
            result.tasks.ai_learning = hTrimmed.toLowerCase().includes('true') || hTrimmed.toLowerCase().includes('yes');
          }
        }
      } else if (trimmed.startsWith('DREAM:')) {
        result.dreamText = trimmed.substring(6).trim();
      } else if (trimmed.startsWith('SUMMARY:')) {
        result.text = trimmed.substring(8).trim();
      }
    }

    if (!result.date) {
      throw new Error('DATE フィールドが見つかりません');
    }

    // 日付形式を検証
    if (!result.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('日付形式が正しくありません。YYYY-MM-DD 形式で入力してください。');
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes('DATE')) {
      throw error;
    }
    throw new Error(`解析エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}
