'use client';

interface PaginationBulletsProps {
  total: number;
  current: number;
  onChange: (page: number) => void;
}

export default function PaginationBullets({ total, current, onChange }: PaginationBulletsProps) {
  return (
    <div className="flex justify-center items-center gap-3">
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`transition-all duration-300 rounded-full transform hover:scale-110 ${
            page === current
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 w-10 h-4 shadow-lg shadow-cyan-500/50'
              : 'bg-gray-600 hover:bg-gray-500 w-4 h-4 hover:shadow-md'
          }`}
          aria-label={`Go to page ${page}`}
        />
      ))}
    </div>
  );
}
