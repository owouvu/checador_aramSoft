import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type Options = {
  table: string;
  deviceGroup: string;
  orderBy: string;
  ascending?: boolean;
  limit?: number;
};

/**
 * Loads a table's rows for this display's device_group and keeps them in
 * sync via Supabase Realtime (insert/update/delete), so content pushed from
 * the cloud shows up without the TV ever polling.
 */
export function useRealtimeList<T extends { id: string }>({
  table,
  deviceGroup,
  orderBy,
  ascending = true,
  limit,
}: Options) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let query = supabase
        .from(table)
        .select('*')
        .eq('device_group', deviceGroup)
        .order(orderBy, { ascending });
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        console.warn(`[useRealtimeList] ${table}:`, error.message);
      } else {
        setRows((data ?? []) as T[]);
      }
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`${table}:${deviceGroup}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `device_group=eq.${deviceGroup}` },
        (payload) => {
          setRows((current) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((row) => row.id !== (payload.old as T).id);
            }
            const next = payload.new as T;
            const withoutNext = current.filter((row) => row.id !== next.id);
            const merged = [...withoutNext, next];
            merged.sort((a: any, b: any) => {
              const cmp = a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0;
              return ascending ? cmp : -cmp;
            });
            return limit ? merged.slice(0, limit) : merged;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [table, deviceGroup, orderBy, ascending, limit]);

  return { rows, loading };
}
