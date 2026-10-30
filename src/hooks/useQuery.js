/* ============================================================
   TradeLink — useQuery & useMutation Hooks
   Lightweight, robust data-fetching hooks that auto-invalidate
   on mockDb change events and cross-tab storage updates.
   ============================================================ */
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Normalizes query keys into string representation for comparison.
 */
function serializeKey(key) {
  if (Array.isArray(key)) {
    return JSON.stringify(key);
  }
  return String(key);
}

/**
 * useQuery
 * @param {Array|string} queryKey - Unique cache key array, e.g. ['products', { category: 'cat-1' }]
 * @param {Function} queryFn - Async function returning data
 * @param {Object} options - { enabled, initialData, onSuccess, onError, refetchInterval }
 */
export function useQuery(queryKey, queryFn, options = {}) {
  const {
    enabled = true,
    initialData = null,
    onSuccess,
    onError,
    refetchInterval,
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(enabled && initialData === null);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const queryKeyStr = serializeKey(queryKey);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const isMountedRef = useRef(true);

  const executeFetch = useCallback(async (silent = false) => {
    if (!enabled) return;
    if (!silent) {
      setIsFetching(true);
      if (data === null) {
        setIsLoading(true);
      }
    } else {
      setIsFetching(true);
    }
    setIsError(false);
    setError(null);

    try {
      const result = await queryFnRef.current();
      if (!isMountedRef.current) return;
      setData(result);
      setIsLoading(false);
      setIsFetching(false);
      if (onSuccessRef.current) onSuccessRef.current(result);
      return result;
    } catch (err) {
      if (!isMountedRef.current) return;
      setIsError(true);
      setError(err);
      setIsLoading(false);
      setIsFetching(false);
      if (onErrorRef.current) onErrorRef.current(err);
    }
  }, [enabled, queryKeyStr]);

  // Primary fetch on key change or enabled toggle
  useEffect(() => {
    isMountedRef.current = true;
    if (enabled) {
      executeFetch(false);
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [queryKeyStr, enabled]);

  // Subscribe to mockDb changes for reactive UI updates
  useEffect(() => {
    const handleDbChange = (e) => {
      if (!enabled) return;
      const entity = e?.detail?.entity;
      // If query key includes entity or broad match, refetch silently
      if (entity && queryKeyStr.toLowerCase().includes(entity.toLowerCase())) {
        executeFetch(true);
      } else if (
        queryKeyStr.toLowerCase().includes('inventory') ||
        queryKeyStr.toLowerCase().includes('report') ||
        queryKeyStr.toLowerCase().includes('overview')
      ) {
        executeFetch(true);
      }
    };

    window.addEventListener('mockdb:change', handleDbChange);
    return () => {
      window.removeEventListener('mockdb:change', handleDbChange);
    };
  }, [queryKeyStr, enabled, executeFetch]);

  // Optional polling interval
  useEffect(() => {
    if (!enabled || !refetchInterval || refetchInterval <= 0) return;
    const timer = setInterval(() => {
      executeFetch(true);
    }, refetchInterval);
    return () => clearInterval(timer);
  }, [enabled, refetchInterval, executeFetch]);

  const refetch = useCallback(() => executeFetch(false), [executeFetch]);

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

/**
 * useMutation
 * @param {Function} mutationFn - Async mutation function
 * @param {Object} options - { onSuccess, onError, onSettled }
 */
export function useMutation(mutationFn, options = {}) {
  const { onSuccess, onError, onSettled } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutateAsync = useCallback(
    async (variables) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsLoading(false);
        if (onSuccess) onSuccess(result, variables);
        if (onSettled) onSettled(result, null, variables);
        return result;
      } catch (err) {
        setIsError(true);
        setError(err);
        setIsLoading(false);
        if (onError) onError(err, variables);
        if (onSettled) onSettled(undefined, err, variables);
        throw err;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    (variables) => {
      mutateAsync(variables).catch(() => {});
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error,
    data,
    reset,
  };
}

