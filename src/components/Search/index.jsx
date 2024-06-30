/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from '@/utils/debounce';
import './styles.css';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalState } from '@/contexts/AppContext';
import OverflowText from '@/components/OverflowText';
import Empty from '@/components/Empty';
import Modal from '@/components/Modal';
import Loader from '@/components/Loader';
import config from '@/config';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { customFetch } = useAuth();
  const { selectedSongs, setSelectedSongs } = useGlobalState();
  const resultsContainerRef = useRef(null);

  const handleSelectSong = (song) => {
    if (selectedSongs.length >= 5) {
      setModalContent('You can only select up to 5 songs.');
      setIsModalOpen(true);
      return;
    }
    if (selectedSongs.some((selectedSong) => selectedSong.id === song.id)) {
      setModalContent('This song has already been added.');
      setIsModalOpen(true);
      return;
    }
    setSelectedSongs((prevSongs) => [...prevSongs, song]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  const fetchSearchResults = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await customFetch(
        `${config.API_BASE_URL}/search?query=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          credentials: 'include',
        },
      );
      const data = await response.json();
      setResults(data.tracks.items);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      fetchSearchResults(searchQuery);
    }, 300),
    [fetchSearchResults],
  );

  // Effect to trigger the search operation
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    const container = resultsContainerRef.current;
    const handleWheel = (event) => {
      if (event.deltaY !== 0) {
        const scrollAmount = event.deltaY * 5;
        container.scrollLeft += scrollAmount;
        event.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel);
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className='search-container'>
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Search for Spotify songs...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className='search-results-container' ref={resultsContainerRef}>
        {isLoading ? (
          <Loader />
        ) : results.length === 0 ? (
          <Empty
            content={
              hasSearched
                ? 'No results found.'
                : 'Your search results appear here.'
            }
          />
        ) : (
          <div className='search-results'>
            {results.map((song) => {
              const imageUrl = song.album.images[0]?.url;
              const artistNames = song.artists
                .map((artist) => artist.name)
                .join(', ');

              return (
                <div
                  key={song.id}
                  className='search-item'
                  onClick={() => handleSelectSong(song)}
                >
                  <img
                    src={imageUrl}
                    alt={song.name}
                    style={{ width: '100px', height: '100px' }}
                  />
                  <OverflowText text={song.name} />
                  <OverflowText text={artistNames} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isModalOpen && <Modal content={modalContent} onClose={closeModal} />}
    </div>
  );
};

export default Search;
