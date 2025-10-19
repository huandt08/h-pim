import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../types';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = false, onSuccess, onError } = options;

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Specialized hook for paginated data
export function usePaginatedApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T[]>>,
  options: UseApiOptions<T[]> = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = false, onSuccess, onError } = options;

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.success && response.data) {
        setData(response.data);
        
        if (response.meta) {
          setPagination({
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            per_page: response.meta.per_page || 20,
            total: response.meta.total || 0,
          });
        }
        
        onSuccess?.(response.data);
        return { success: true, data: response.data, meta: response.meta };
      } else {
        const errorMessage = response.message || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData([]);
    setPagination({
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    pagination,
    loading,
    error,
    execute,
    reset,
  };
}

// Hook for mutations (create, update, delete)
export function useMutation<T, P = any>(
  mutationFunction: (params: P) => Promise<ApiResponse<T>>,
  options: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: any, params: P) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mutationFunction(params);
      
      if (response.success && response.data) {
        onSuccess?.(response.data, params);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage, params);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(err, params);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [mutationFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}

export default useApi;