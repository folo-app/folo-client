import { useCallback, useEffect, useState } from 'react';

type QueryOptions<T> = {
  queryFn: () => Promise<T>;
  initialData: T;
  deps?: ReadonlyArray<unknown>;
  enabled?: boolean;
};

export type QueryResult<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
};

export type MutationResult<TData, TVariables> = {
  mutate: (variables: TVariables) => Promise<TData>;
  pending: boolean;
  error: string | null;
  data: TData | null;
  reset: () => void;
};

export function useQuery<T>({
  queryFn,
  initialData,
  deps = [],
  enabled = true,
}: QueryOptions<T>): QueryResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;

    if (!enabled) {
      setData(initialData);
      setLoading(false);
      setError(null);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    setError(null);

    queryFn()
      .then((result) => {
        if (!alive) {
          return;
        }

        setData(result);
        setError(null);
      })
      .catch((reason) => {
        if (!alive) {
          return;
        }

        setData(initialData);
        setError(reason instanceof Error ? reason.message : '데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [enabled, initialData, queryFn, refreshKey, ...deps]);

  return {
    data,
    loading,
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}

export function useMutation<TData, TVariables>({
  mutationFn,
}: MutationOptions<TData, TVariables>): MutationResult<TData, TVariables> {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setPending(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : '요청을 처리하지 못했습니다.');
        throw reason;
      } finally {
        setPending(false);
      }
    },
    [mutationFn],
  );

  return {
    mutate,
    pending,
    error,
    data,
    reset: () => {
      setPending(false);
      setError(null);
      setData(null);
    },
  };
}
