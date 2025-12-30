import React from 'react';
import { Link } from 'react-router-dom';
import { IManga } from '../types';
import { getCoverUrl } from '../services/mangaService';

interface MangaCardProps {
  manga: IManga;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga }) => {
  return (
    <Link to={`/manga/${manga.id}`} className="group block h-full">
      <div className="relative border-4 border-transparent group-hover:border-black transition-all duration-200 p-2 h-full flex flex-col">
        {/* Image Container with strict Aspect Ratio */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 mb-4">
          <img
            src={getCoverUrl(manga.id, manga.coverFileName || '')}
            alt={manga.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
            {manga.status || 'Unknown'}
          </div>
        </div>

        {/* Typography */}
        <div className="flex flex-col flex-grow justify-between">
            <h3 className="font-bold text-lg leading-tight uppercase line-clamp-2 group-hover:text-swiss-red">
                {manga.title}
            </h3>
            <div className="mt-2 border-t-2 border-gray-200 pt-2 flex justify-between items-center opacity-60 group-hover:opacity-100 group-hover:border-black transition-opacity">
                <span className="text-xs font-bold uppercase tracking-wider">
                    {manga.originalLanguage?.toUpperCase()}
                </span>
                <span className="text-xs font-bold">
                    →
                </span>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;
