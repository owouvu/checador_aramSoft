import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DEVICE_GROUP } from '@/constants/device-config';
import { TvColors, TvSpacing } from '@/constants/tv-theme';
import { useRealtimeList } from '@/hooks/use-realtime-list';
import type { MediaItem } from '@/types';

const DEFAULT_IMAGE_MS = 10000;

export function MediaPlayer() {
  const { rows } = useRealtimeList<MediaItem>({
    table: 'media_items',
    deviceGroup: DEVICE_GROUP,
    orderBy: 'order_index',
  });
  const [index, setIndex] = useState(0);
  const current = rows[index % Math.max(rows.length, 1)];

  const player = useVideoPlayer(current?.kind === 'video' ? current.url : null, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    if (!current || rows.length < 2) return;
    if (current.kind === 'video') return; // advances via onPlayToEnd below
    const ms = (current.duration_seconds ?? DEFAULT_IMAGE_MS / 1000) * 1000;
    const id = setTimeout(() => setIndex((i) => (i + 1) % rows.length), ms);
    return () => clearTimeout(id);
  }, [current, rows.length]);

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('playToEnd', () => {
      setIndex((i) => (i + 1) % Math.max(rows.length, 1));
    });
    return () => sub.remove();
  }, [player, rows.length]);

  if (!current) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin contenido multimedia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {current.kind === 'video' ? (
        <VideoView style={styles.media} player={player} contentFit="cover" nativeControls={false} />
      ) : (
        <Image source={{ uri: current.url }} style={styles.media} contentFit="cover" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: TvSpacing.four,
  },
  media: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: TvColors.surfaceAlt,
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
