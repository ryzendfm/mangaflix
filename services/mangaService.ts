import { IManga, IChapter } from '../types';

const BASE_URL = 'https://api.mangadex.org';

// Robust fetch with multiple proxy fallbacks to handle CORS and network restrictions
const fetchJson = async (url: string) => {
  // Strategy: Try Direct -> AllOrigins -> CorsProxy -> CodeTabs
  // We use multiple proxies because public proxies can be unstable or rate-limited.
  const attempts = [
    { type: 'Direct', gen: (u: string) => u },
    { type: 'AllOrigins', gen: (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` },
    { type: 'CorsProxy', gen: (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}` },
    { type: 'CodeTabs', gen: (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}` }
  ];

  let lastError: any;

  for (const attempt of attempts) {
    try {
      const targetUrl = attempt.gen(url);
      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        // If 404, the resource genuinely doesn't exist, so we shouldn't retry proxies for it
        if (response.status === 404) throw new Error('404 Not Found');
        throw new Error(`Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.message === '404 Not Found') throw error;
      console.warn(`[MangaService] ${attempt.type} failed for ${url}:`, error);
      lastError = error;
      // Continue to next attempt
    }
  }

  throw lastError || new Error('All fetch attempts failed.');
};

export const searchManga = async (query: string): Promise<IManga[]> => {
  try {
    const url = new URL(`${BASE_URL}/manga`);
    url.searchParams.append('limit', '12');
    url.searchParams.append('includes[]', 'cover_art'); 
    url.searchParams.append('hasAvailableChapters', 'true');
    url.searchParams.append('contentRating[]', 'safe');
    url.searchParams.append('contentRating[]', 'suggestive');
    url.searchParams.append('contentRating[]', 'erotica');

    // Handle "popular" or empty query by sorting by popularity
    // We treat empty query or 'popular' as a request for top followed manga
    if (query && query.trim().toLowerCase() !== 'popular') {
      url.searchParams.append('title', query);
      url.searchParams.append('order[relevance]', 'desc');
    } else {
      // Default to popular/followed if generic query or empty
      url.searchParams.append('order[followedCount]', 'desc'); 
    }

    const data = await fetchJson(url.toString());
    if (!data || !data.data) return [];

    return data.data.map((manga: any) => {
      const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
      const fileName = coverRel?.attributes?.fileName;
      
      const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown Title';
      const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0] || '';

      return {
        id: manga.id,
        title: title,
        description: description,
        status: manga.attributes.status,
        coverFileName: fileName,
        originalLanguage: manga.attributes.originalLanguage,
        year: manga.attributes.year
      };
    });
  } catch (error) {
    console.error("Error searching manga:", error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
};

export const getMangaDetails = async (id: string): Promise<IManga | null> => {
  try {
    const url = new URL(`${BASE_URL}/manga/${id}`);
    url.searchParams.append('includes[]', 'cover_art');
    url.searchParams.append('includes[]', 'author');
    url.searchParams.append('includes[]', 'artist');

    const json = await fetchJson(url.toString());
    if (!json || !json.data) return null;
    const manga = json.data;

    const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
    const fileName = coverRel?.attributes?.fileName;
    
    const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown Title';
    const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0] || '';

    return {
      id: manga.id,
      title: title,
      description: description,
      status: manga.attributes.status,
      year: manga.attributes.year,
      coverFileName: fileName,
      originalLanguage: manga.attributes.originalLanguage
    } as IManga;
  } catch (error) {
    console.error("Error getting manga details:", error);
    return null;
  }
};

export const getMangaChapters = async (mangaId: string): Promise<IChapter[]> => {
  try {
    let allChapters: any[] = [];
    let offset = 0;
    const limit = 500;
    let hasMore = true;

    // Fetch loop to get ALL chapters (handling pagination)
    while (hasMore) {
        const url = new URL(`${BASE_URL}/manga/${mangaId}/feed`);
        url.searchParams.append('translatedLanguage[]', 'en');
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());
        url.searchParams.append('order[volume]', 'desc');
        url.searchParams.append('order[chapter]', 'desc');
        url.searchParams.append('includes[]', 'scanlation_group');
        url.searchParams.append('contentRating[]', 'safe');
        url.searchParams.append('contentRating[]', 'suggestive');
        url.searchParams.append('contentRating[]', 'erotica');

        const json = await fetchJson(url.toString());
        
        if (!json || !json.data || json.data.length === 0) {
            hasMore = false;
            break;
        }

        allChapters = [...allChapters, ...json.data];
        
        const total = json.total || 0;
        offset += limit;
        if (offset >= total) {
            hasMore = false;
        }
    }

    // Deduplication Logic:
    // Filter out duplicates. We prioritize the first occurrence because the API call is sorted by chapter desc.
    const uniqueChaptersMap = new Map();

    allChapters.forEach((ch: any) => {
        // Skip external chapters (usually denoted by externalUrl attribute not being null, or specific relationship)
        if(ch.attributes.externalUrl) return;

        const chapNum = ch.attributes.chapter;
        
        // Key: Use chapter number. If null (oneshot), use ID or a special 'oneshot' key if we want to dedup oneshots (usually by title).
        // Using 'oneshot' as key would hide multiple oneshots. 
        // Best approach for null chapter: use title or ID.
        let key = chapNum;
        if (key === null) {
             key = `oneshot-${ch.id}`;
        }

        if (!uniqueChaptersMap.has(key)) {
            uniqueChaptersMap.set(key, {
                id: ch.id,
                volume: ch.attributes.volume,
                chapter: ch.attributes.chapter,
                title: ch.attributes.title,
                translatedLanguage: ch.attributes.translatedLanguage,
                publishAt: ch.attributes.publishAt,
            });
        }
    });

    return Array.from(uniqueChaptersMap.values()) as IChapter[];

  } catch (error) {
    console.error("Error getting chapters:", error);
    return [];
  }
};

export const getChapterPages = async (chapterId: string): Promise<string[]> => {
  try {
    // This call gets the metadata including the hash and filenames
    const json = await fetchJson(`${BASE_URL}/at-home/server/${chapterId}`);
    
    if (!json || !json.baseUrl || !json.chapter || !json.chapter.hash || !json.chapter.data) {
        console.error("Invalid chapter data received:", json);
        return [];
    }

    const baseUrl = json.baseUrl;
    const hash = json.chapter.hash;
    
    // Construct the direct image URLs
    // Note: The images themselves are usually hosted on a CDN that allows CORS,
    // so we return the direct URLs. The Reader component puts these in <img src="...">
    return json.chapter.data.map((filename: string) => {
        return `${baseUrl}/data/${hash}/${filename}`;
    });
  } catch (error) {
    console.error("Error getting chapter pages:", error);
    return [];
  }
};

export const getChapterMangaId = async (chapterId: string): Promise<string | null> => {
  try {
    const json = await fetchJson(`${BASE_URL}/chapter/${chapterId}`);
    if (!json || !json.data) return null;
    const rel = json.data.relationships.find((r: any) => r.type === 'manga');
    return rel?.id || null;
  } catch (error) {
    console.error("Error getting chapter manga relation:", error);
    return null;
  }
};

export const getCoverUrl = (mangaId: string, fileName: string) => {
  if (!fileName) return 'https://placehold.co/300x450/111/fff?text=No+Cover'; 
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
};

export const getFullCoverUrl = (mangaId: string, fileName: string) => {
  if (!fileName) return 'https://placehold.co/500x800/111/fff?text=No+Cover';
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
};