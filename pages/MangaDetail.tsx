import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMangaDetails, getMangaChapters, getFullCoverUrl } from '../services/mangaService';
import { IManga, IChapter } from '../types';
import { BookOpen, Globe, Calendar, Info } from 'lucide-react';

const MangaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<IManga | null>(null);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      const [mangaData, chapterData] = await Promise.all([
        getMangaDetails(id),
        getMangaChapters(id)
      ]);
      setManga(mangaData);
      setChapters(chapterData);
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="text-4xl font-black uppercase animate-pulse">Loading Data...</div>
        </div>
    );
  }

  if (!manga) {
    return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="text-4xl font-black uppercase text-swiss-red">Manga Not Found</div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
        
        {/* Cover Art - Sticky on Desktop */}
        <div className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-24">
                <div className="relative aspect-[2/3] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <img
                        src={getFullCoverUrl(manga.id, manga.coverFileName || '')}
                        alt={manga.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider border-b-2 border-gray-100 py-2">
                        <Globe size={18} />
                        <span>{manga.originalLanguage || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider border-b-2 border-gray-100 py-2">
                        <Info size={18} />
                        <span className={manga.status === 'completed' ? 'text-green-600' : 'text-blue-600'}>
                            {manga.status || 'Ongoing'}
                        </span>
                    </div>
                    {manga.year && (
                        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider border-b-2 border-gray-100 py-2">
                            <Calendar size={18} />
                            <span>{manga.year}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Info & Chapters */}
        <div className="md:col-span-8 lg:col-span-9">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8 text-swiss-black">
                {manga.title}
            </h1>
            
            <p className="text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-3xl border-l-4 border-swiss-red pl-6">
                {manga.description || "No description available."}
            </p>

            {/* Chapter List */}
            <div className="bg-gray-50 border-4 border-black p-0">
                <div className="bg-black text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase tracking-wider">Chapters</h2>
                    <span className="font-mono bg-swiss-red px-2 py-1 text-xs">{chapters.length}</span>
                </div>
                
                <div className="divide-y-2 divide-gray-200 max-h-[800px] overflow-y-auto custom-scrollbar">
                    {chapters.length > 0 ? (
                        chapters.map((chapter) => (
                            <Link 
                                key={chapter.id} 
                                to={`/read/${chapter.id}`}
                                className="block p-4 hover:bg-swiss-red/10 transition-colors group flex items-center justify-between"
                            >
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black font-mono">
                                            Vol.{chapter.volume || '?'} Ch.{chapter.chapter}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide group-hover:text-swiss-red">
                                        {chapter.title || 'No Title'}
                                    </span>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="inline-flex items-center gap-2 font-bold uppercase text-xs bg-black text-white px-3 py-1">
                                        Read <BookOpen size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center font-bold uppercase opacity-50">
                            No English chapters found.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;