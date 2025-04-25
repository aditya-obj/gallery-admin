export default function SearchBar({ onSearch, onTypeChange, onPriceChange }) {
  const types = ['All', 'Electronics', 'Clothing', 'Books', 'Food']; // Example types

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
          onChange={(e) => onTypeChange(e.target.value)}
        >
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">Price Range:</span>
        <input
          type="range"
          min="0"
          max="1000"
          className="w-full accent-blue-500"
          onChange={(e) => onPriceChange(Number(e.target.value))}
        />
        <span className="text-sm">$1000</span>
      </div>
    </div>
  );
}
