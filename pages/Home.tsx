import React, { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { searchManga } from '../services/mangaService';
import MangaCard from '../components/MangaCard';
import { IManga } from '../types';

const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await searchManga(debouncedQuery);
    setResults(data);
    setLoading(false);
  }, [debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Search Section - Swiss Style Input */}
      <div className="mb-16">
        <div className="relative max-w-2xl">
            <label htmlFor="search" className="block text-sm font-bold uppercase tracking-widest mb-2">
                Search Collection
            </label>
            <div className="flex">
                <input
                    id="search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ENTER TITLE..."
                    className="w-full bg-transparent border-4 border-black p-4 font-bold text-xl placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-swiss-red/20 uppercase"
                />
                <button 
                    className="bg-black text-white px-8 hover:bg-swiss-red transition-colors flex items-center justify-center"
                    onClick={() => fetchData()}
                >
                    <Search size={28} strokeWidth={3} />
                </button>
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-200"></div>
            ))}
        </div>
      ) : (
        <div>
            <div className="flex items-baseline justify-between mb-8 border-b-4 border-black pb-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                    {debouncedQuery ? 'Results' : 'Popular'} <span className="text-swiss-red text-2xl md:text-4xl align-top">({results.length})</span>
                </h2>
            </div>
            
            {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {results.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border-4 border-dashed border-gray-300">
                    <p className="text-2xl font-bold uppercase text-gray-400">No Manga Found</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Home;