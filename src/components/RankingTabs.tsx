'use client';

type PeriodType = 'today' | 'week' | 'month' | 'continuous';

interface RankingTabsProps {
  selectedPeriod: PeriodType;
  onSelect: (period: PeriodType) => void;
}

export function RankingTabs({ selectedPeriod, onSelect }: RankingTabsProps) {
  const tabs: Array<{ id: PeriodType; label: string; emoji: string }> = [
    { id: 'today', label: '今日', emoji: '📅' },
    { id: 'week', label: '今週', emoji: '📊' },
    { id: 'month', label: '今月', emoji: '📈' },
    { id: 'continuous', label: '連続', emoji: '🔥' },
  ];

  return (
    <div className="flex gap-2 mb-6 border-b border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`px-6 py-3 font-bold transition-all ${
            selectedPeriod === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.emoji} {tab.label}
        </button>
      ))}
    </div>
  );
}
