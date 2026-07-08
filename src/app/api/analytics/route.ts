import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AnalyticsEvent {
  type: string;
  timestamp: number;
  path?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const events: AnalyticsEvent[] = await request.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid events array' },
        { status: 400 }
      );
    }

    // イベントのログ（本番環境では外部サービスに送信）
    const logEntry = {
      batchId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventCount: events.length,
      firstEvent: events[0]?.type,
      sessionIds: [...new Set(events.map((e) => e.sessionId))],
    };

    console.log('[Analytics] Batch received:', logEntry);

    // イベント統計
    const eventTypes = {} as Record<string, number>;
    events.forEach((event) => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });
    console.log('[Analytics] Event types:', eventTypes);

    // 本番環境では以下を実装：
    // - BigQuery / Mixpanel / Amplitude へのシップ
    // - Gist へのログ保存
    // - Slack 通知

    return NextResponse.json(
      {
        success: true,
        processed: events.length,
        batchId: logEntry.batchId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // ヘルスチェック
  return NextResponse.json({ status: 'ok', version: '1.4.0' });
}
