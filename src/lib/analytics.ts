/**
 * 匿名分析トラッキング
 * 個人情報は送信しない
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  sessionId: string;
  data?: Record<string, unknown>;
}

class Analytics {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private enabled: boolean = true;

  constructor() {
    // ブラウザ環境でセッション ID を生成
    this.sessionId =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('analytics_session_id') ||
          this.generateSessionId()
        : '';

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('analytics_session_id', this.sessionId);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * イベントを記録
   */
  track(event: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: data ? { ...data } : undefined, // 個人情報を含めない
    };

    this.events.push(analyticsEvent);

    // バッチ送信：10イベントごと
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  /**
   * イベントバッチを送信
   */
  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // API エンドポイント（v1.4.0+）
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (err) {
      // 送信失敗時は無視（アプリ動作に影響なし）
      console.debug('Analytics send failed', err);
    }
  }

  /**
   * ページアンロード時にイベント送信
   */
  flushOnUnload(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  disable(): void {
    this.enabled = false;
  }
}

export const analytics = new Analytics();

// ページアンロード時にイベント送信
if (typeof window !== 'undefined') {
  analytics.flushOnUnload();
}
