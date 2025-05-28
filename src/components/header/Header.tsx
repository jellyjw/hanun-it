import { ThemeToggle } from "./ThemeToggle";


interface HeaderProps {
  handleRefreshRSS: () => void;
}

export function Header({ handleRefreshRSS }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          한눈IT
        </h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleRefreshRSS}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            RSS 새로고침
          </button>
        </div>
      </div>
    </header>
  );
}
