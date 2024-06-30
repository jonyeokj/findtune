import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import config from '@/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/refresh-token`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        setTimeout(refreshToken, (data.expiresIn - 300) * 1000); // Schedule next refresh 5 minutes before expiry
        console.log('refreshed token!');
      } else {
        throw new Error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
    }
  }, []);

  const fetchAccessToken = async () => {
    try {
      setIsLoading(true); // Set loading to true before fetching
      const response = await fetch(`${config.API_BASE_URL}/access-token`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        setTimeout(refreshToken, (data.expiresIn - 300) * 1000); // Refresh 5 minutes before expiry
      } else {
        throw new Error('Failed to fetch access token');
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };

  const customFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      await refreshToken(); // Attempt to refresh the token

      // Retry the original request with the new token
      const newResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`, // accessToken should be updated by refreshToken()
        },
      });

      return newResponse;
    }

    return response;
  };

  useEffect(() => {
    fetchAccessToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        accessToken,
        customFetch,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
