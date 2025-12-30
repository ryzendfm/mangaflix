import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapterPages, getChapterMangaId, getMangaChapters } from '../services/mangaService';
import { IChapter } from '../types';
import { ArrowLeft, ArrowUp, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Reader: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mangaId, setMangaId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState<IChapter | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Fetch Pages and Setup Navigation
  useEffect(() => {
    const initReader = async () => {
        if(!chapterId) return;
        setLoading(true);
        window.scrollTo(0, 0); // Reset scroll on chapter change

        try {
            // 1. Get Pages
            const urls = await getChapterPages(chapterId);
            setPages(urls);

            // 2. Setup Navigation (Next/Prev)
            const mId = await getChapterMangaId(chapterId);
            setMangaId(mId);

            if (mId) {
                const chapters = await getMangaChapters(mId);
                // Chapters are typically sorted Descending (Latest first) by the API/Service
                // e.g., [Ch 10, Ch 9, ... Ch 2, Ch 1]
                const currentIndex = chapters.findIndex(c => c.id === chapterId);
                
                if (currentIndex !== -1) {
                    setCurrentChapter(chapters[currentIndex]);

                    // Next Chapter (Story-wise) is usually a higher number, which is at a LOWER index in a descending list
                    if (currentIndex > 0) {
                        setNextChapterId(chapters[currentIndex - 1].id);
                    } else {
                        setNextChapterId(null);
                    }

                    // Previous Chapter (Story-wise) is usually a lower number, which is at a HIGHER index in a descending list
                    if (currentIndex < chapters.length - 1) {
                        setPrevChapterId(chapters[currentIndex + 1].id);
                    } else {
                        setPrevChapterId(null);
                    }
                }
            }
        } catch (error) {
            console.error("Error initializing reader:", error);
        } finally {
            setLoading(false);
        }
    };
    initReader();
  }, [chapterId]);

  // Update Reading Progress Bar & Toggle Header
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (currentScrollY / totalHeight) * 100;
        setScrollProgress(progress);

        // Auto-hide header on scroll down, show on scroll up
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setShowHeader(false);
        } else {
            setShowHeader(true);
        }
        lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-swiss-black text-white">
            <Loader2 size={48} className="animate-spin mb-4 text-swiss-red" />
            <span className="text-xl font-black uppercase tracking-widest">Loading Chapter...</span>
        </div>
    );
  }

  return (
    <div className="bg-[#111] min-h-screen text-white relative">
        {/* Reading Progress Bar (Fixed at absolute top) */}
        <div className="fixed top-0 left-0 h-1 bg-swiss-red z-[60] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

        {/* Header Bar */}
        <div className={`fixed top-0 left-0 w-full bg-black/90 backdrop-blur border-b border-white/10 z-50 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                    <button 
                        onClick={() => navigate(-1)}
                        className="hover:text-swiss-red transition-colors p-1"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    {currentChapter && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                Reading Vol.{currentChapter.volume || '?'} Ch.{currentChapter.chapter}
                            </span>
                            <span className="text-sm font-bold uppercase truncate leading-none text-white">
                                {currentChapter.title || 'No Title'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-xs font-mono text-gray-500 hidden sm:block">
                   SWISSMANGA
                </div>
            </div>
        </div>

        {/* Scroll Top Button */}
        <div className={`fixed bottom-4 right-4 z-40 transition-opacity duration-300 ${scrollProgress > 10 ? 'opacity-100' : 'opacity-0'}`}>
             <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-black/80 hover:bg-swiss-red backdrop-blur text-white p-3 border border-white/20 transition-all rounded-none shadow-lg"
            >
                <ArrowUp size={24} />
            </button>
        </div>

        {/* Pages Container (Added padding-top to account for header) */}
        <div className="max-w-4xl mx-auto py-8 px-0 sm:px-4 pt-20" ref={topRef}>
            {pages.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {pages.map((url, index) => (
                        <div key={index} className="relative w-full">
                            <img 
                                src={url} 
                                alt={`Page ${index + 1}`} 
                                className="w-full h-auto block"
                                loading="eager"
                                referrerPolicy="no-referrer"
                            />
                            {/* Page Number Indicator */}
                            {/* <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1 font-mono pointer-events-none">
                                {index + 1} / {pages.length}
                            </div> */} 
                            {/* Removed overlay page number for cleaner reading, optional to keep */}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-[80vh] flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold uppercase text-gray-500">No pages found.</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-swiss-red underline">Go Back</button>
                </div>
            )}
        </div>

        {/* Navigation Footer */}
        <div className="max-w-4xl mx-auto py-20 text-center px-4">
             {currentChapter && (
                 <div className="mb-12 border-b-2 border-white/10 pb-8">
                     <span className="block text-swiss-red font-bold tracking-[0.2em] uppercase text-sm mb-2">Finished Reading</span>
                     <h2 className="text-3xl md:text-4xl font-black uppercase mb-2">
                        {currentChapter.chapter ? `Chapter ${currentChapter.chapter}` : 'Oneshot'}
                     </h2>
                     {currentChapter.title && (
                        <p className="text-xl text-gray-400 font-medium uppercase tracking-wide">
                            {currentChapter.title}
                        </p>
                     )}
                 </div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Previous Button - Left Side */}
                {prevChapterId ? (
                    <button 
                        onClick={() => navigate(`/read/${prevChapterId}`)}
                        className="group border-2 border-white/20 hover:border-white bg-transparent hover:bg-white hover:text-black p-6 flex items-center justify-center gap-4 transition-all"
                    >
                        <ChevronLeft size={24} />
                        <span className="font-bold uppercase tracking-widest text-lg">Previous</span>
                    </button>
                ) : (
                    <button 
                        disabled 
                        className="border-2 border-white/5 text-white/20 p-6 flex items-center justify-center gap-4 cursor-not-allowed uppercase font-bold tracking-widest"
                    >
                        Start of Series
                    </button>
                )}
                
                {/* Next Button - Right Side (Primary Action) */}
                {nextChapterId ? (
                    <button 
                         onClick={() => navigate(`/read/${nextChapterId}`)}
                         className="group bg-swiss-red text-white hover:bg-white hover:text-swiss-red p-6 flex items-center justify-center gap-4 transition-all"
                    >
                        <span className="font-bold uppercase tracking-widest text-lg">Next Chapter</span>
                        <ChevronRight size={24} />
                    </button>
                ) : (
                     <button 
                        onClick={() => mangaId ? navigate(`/manga/${mangaId}`) : navigate('/')}
                        className="group bg-white text-black hover:bg-gray-200 p-6 flex items-center justify-center gap-4 transition-all"
                    >
                        <span className="font-bold uppercase tracking-widest text-lg">Return to Manga</span>
                    </button>
                )}
             </div>

             {/* Backup Return Link if Next button exists */}
             {nextChapterId && (
                 <button 
                    onClick={() => mangaId ? navigate(`/manga/${mangaId}`) : navigate('/')}
                    className="text-gray-500 hover:text-white underline text-sm font-bold uppercase tracking-widest mt-4"
                 >
                    Return to Manga Details
                 </button>
             )}
        </div>
    </div>
  );
};

export default Reader;