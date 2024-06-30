import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import debounce from '@/utils/debounce';
import config from '@/config';

const SpotifyContext = createContext();

export const SpotifyProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const { accessToken, customFetch } = useAuth();

  const lastTrackUriRef = useRef(null);
  const deviceIdRef = useRef(null);
  const selectedSongsRef = useRef([]);

  // Spotify Player Initialisation
  useEffect(() => {
    if (accessToken) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Findtune',
          getOAuthToken: (cb) => cb(accessToken),
          volume: 0.5,
        });

        player.addListener('player_state_changed', async (state) => {
          if (!state) return;

          // Update current track information for UI
          const { current_track } = state.track_window;
          setCurrentTrack(current_track);

          // Check if the track has ended
          const currentTrackUri = state.track_window.current_track.uri;
          const trackChanged = lastTrackUriRef.current !== currentTrackUri;

          // // Log current state for debugging
          // console.log('Current song URI: ', currentTrackUri);
          // console.log('Last song URI: ', lastTrackUriRef.current);
          // console.log('Track changed:', trackChanged);
          // console.log('State before track ended:', state);

          const trackEnded =
            state.loading === false &&
            state.paused &&
            state.position === 0 &&
            state.restrictions.disallow_pausing_reasons &&
            state.restrictions.disallow_pausing_reasons.includes(
              'already_paused',
            );

          if (trackEnded) {
            if (selectedSongsRef.current.length === 0) {
              // No more songs to play, set currentTrack to null
              setCurrentTrack(null);
              return;
            }

            // Call the debounced fetch function with the seed tracks
            const seedTracks = selectedSongsRef.current
              .map((song) => song.id)
              .join(',');
            // console.log(
            //   'Track ended. Fetching next recommendation with seeds:',
            //   seedTracks,
            // );
            lastTrackUriRef.current = currentTrackUri;
            await fetchAndPlayRecommendationDebounced(seedTracks);
          } else if (trackChanged) {
            // If the track changed but didn't end (e.g., user skipped to next), update the lastTrackUri
            lastTrackUriRef.current = currentTrackUri;
          }
        });

        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          deviceIdRef.current = device_id;
          setDeviceId(device_id);
        });

        player.connect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const fetchAndPlayRecommendation = async (seedTracks) => {
    if (!seedTracks.trim()) {
      await pause();
      setCurrentTrack(null);
      return;
    }

    try {
      // Use customFetch instead of the global fetch
      const response = await customFetch(
        `${config.API_BASE_URL}/api/recommendations?seed_tracks=${seedTracks}`,
        {
          credentials: 'include',
        },
      );
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const recommendationsData = await response.json();
      if (recommendationsData.tracks.length > 0) {
        const trackUri = recommendationsData.tracks[0].uri;
        play([trackUri]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchAndPlayRecommendationDebounced = debounce((seedTracks) => {
    fetchAndPlayRecommendation(seedTracks);
  }, 1000);

  const updateSelectedSongs = (songs) => {
    setSelectedSongs(songs);
  };

  useEffect(() => {
    selectedSongsRef.current = selectedSongs;
  }, [selectedSongs]);

  const play = async (uris = null) => {
    const tempDeviceId = deviceIdRef.current;
    if (!tempDeviceId) return console.error('Device ID not available.');

    try {
      const body = uris
        ? JSON.stringify({ uris, deviceId: tempDeviceId })
        : JSON.stringify({ deviceId: tempDeviceId });

      const response = await customFetch(`${config.API_BASE_URL}/api/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to execute play command');
      console.log('Playback initiated successfully');
    } catch (error) {
      console.error('Error initiating playback:', error);
    }
  };

  const pause = async () => {
    if (!deviceId) return console.error('Device ID not available.');

    try {
      const response = await customFetch(`${config.API_BASE_URL}/api/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to execute play command');
      console.log('Playback paused successfully');
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const setVolume = async (volume) => {
    if (!deviceId) return console.error('Device ID not available.');

    try {
      await customFetch(`${config.API_BASE_URL}/api/volume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ volume, deviceId }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  return (
    <SpotifyContext.Provider
      value={{
        currentTrack,
        updateSelectedSongs,
        fetchAndPlayRecommendation,
        play,
        pause,
        setVolume,
        deviceId,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => useContext(SpotifyContext);
