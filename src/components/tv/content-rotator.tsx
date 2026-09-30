import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnnouncementBoard } from '@/components/tv/announcement-board';
import { DashboardPanel } from '@/components/tv/dashboard-panel';
import { MediaPlayer } from '@/components/tv/media-player';

const SECTIONS = [AnnouncementBoard, DashboardPanel, MediaPlayer] as const;
const SECTION_MS = 15000;

export function ContentRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SECTIONS.length), SECTION_MS);
    return () => clearInterval(id);
  }, []);

  const Section = SECTIONS[index];

  return (
    <View style={styles.container}>
      <Section />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
