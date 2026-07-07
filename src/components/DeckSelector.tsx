'use client';

interface DeckSelectorProps {
  months: Array<{ year: number; month: number }>;
  selectedMonth: { year: number; month: number };
  onSelect: (month: { year: number; month: number }) => void;
}

export function DeckSelector({ months, selectedMonth, onSelect }: DeckSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
      {months.map((month) => {
        const isSelected =
          month.year === selectedMonth.year && month.month === selectedMonth.month;
        const monthName = new Date(month.year, month.month, 1).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
        });

        return (
          <button
            key={`${month.year}-${month.month}`}
            onClick={() => onSelect(month)}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${
              isSelected
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {monthName}
          </button>
        );
      })}
    </div>
  );
}
