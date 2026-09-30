import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DEVICE_GROUP } from '@/constants/device-config';
import { TvColors, TvSpacing } from '@/constants/tv-theme';
import { useRealtimeList } from '@/hooks/use-realtime-list';
import type { Announcement } from '@/types';

const ROTATE_MS = 8000;

function isActive(a: Announcement, now: Date) {
  if (a.starts_at && new Date(a.starts_at) > now) return false;
  if (a.ends_at && new Date(a.ends_at) < now) return false;
  return true;
}

export function AnnouncementBoard() {
  const { rows } = useRealtimeList<Announcement>({
    table: 'announcements',
    deviceGroup: DEVICE_GROUP,
    orderBy: 'created_at',
    ascending: false,
  });
  const active = rows.filter((a) => isActive(a, new Date()));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (active.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % active.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [active.length]);

  if (active.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin avisos por ahora</Text>
      </View>
    );
  }

  const current = active[index % active.length];

  return (
    <View style={styles.container}>
      {current.image_url ? (
        <Image source={{ uri: current.image_url }} style={styles.image} contentFit="cover" />
      ) : null}
      <Text style={styles.title}>{current.title}</Text>
      {current.body ? <Text style={styles.body}>{current.body}</Text> : null}
      {active.length > 1 ? (
        <View style={styles.dots}>
          {active.map((a, i) => (
            <View key={a.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: TvSpacing.four,
  },
  image: {
    flex: 1,
    borderRadius: 16,
    marginBottom: TvSpacing.three,
    backgroundColor: TvColors.surfaceAlt,
  },
  title: {
    color: TvColors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: TvSpacing.one,
  },
  body: {
    color: TvColors.textSecondary,
    fontSize: 18,
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: TvSpacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TvColors.border,
  },
  dotActive: {
    backgroundColor: TvColors.accent,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: TvColors.textSecondary,
    fontSize: 18,
  },
});
