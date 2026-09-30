import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { CheckadorFeed } from '@/components/tv/checador-feed';
import { ContentRotator } from '@/components/tv/content-rotator';
import { HeaderBar } from '@/components/tv/header-bar';
import { TvColors } from '@/constants/tv-theme';

export default function TvDisplayScreen() {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <HeaderBar title="Aurelio · Pantalla" />
      <View style={styles.body}>
        <ContentRotator />
        <CheckadorFeed />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TvColors.background,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
});
