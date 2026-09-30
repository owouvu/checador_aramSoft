import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TvColors, TvSpacing } from '@/constants/tv-theme';

export function HeaderBar({ title }: { title: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.clockBlock}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TvSpacing.four,
    paddingVertical: TvSpacing.three,
    borderBottomWidth: 1,
    borderBottomColor: TvColors.border,
  },
  title: {
    color: TvColors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  clockBlock: {
    alignItems: 'flex-end',
  },
  time: {
    color: TvColors.text,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  date: {
    color: TvColors.textSecondary,
    fontSize: 16,
    textTransform: 'capitalize',
  },
});
