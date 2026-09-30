import { StyleSheet, Text, View } from 'react-native';

import { DEVICE_GROUP } from '@/constants/device-config';
import { TvColors, TvSpacing } from '@/constants/tv-theme';
import { useRealtimeList } from '@/hooks/use-realtime-list';
import type { DashboardWidget } from '@/types';

const TREND_LABEL: Record<NonNullable<DashboardWidget['trend']>, string> = {
  up: '▲',
  down: '▼',
  flat: '▬',
};

const TREND_COLOR: Record<NonNullable<DashboardWidget['trend']>, string> = {
  up: TvColors.success,
  down: TvColors.danger,
  flat: TvColors.textSecondary,
};

export function DashboardPanel() {
  const { rows } = useRealtimeList<DashboardWidget>({
    table: 'dashboard_widgets',
    deviceGroup: DEVICE_GROUP,
    orderBy: 'label',
  });

  if (rows.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin indicadores configurados</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {rows.map((widget) => (
        <View key={widget.id} style={styles.tile}>
          <Text style={styles.label}>{widget.label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{widget.value.toLocaleString('es-MX')}</Text>
            {widget.unit ? <Text style={styles.unit}>{widget.unit}</Text> : null}
          </View>
          {widget.trend ? (
            <Text style={[styles.trend, { color: TREND_COLOR[widget.trend] }]}>
              {TREND_LABEL[widget.trend]}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TvSpacing.two,
    padding: TvSpacing.four,
    alignContent: 'flex-start',
  },
  tile: {
    minWidth: 220,
    flexGrow: 1,
    backgroundColor: TvColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TvColors.border,
    padding: TvSpacing.three,
  },
  label: {
    color: TvColors.textSecondary,
    fontSize: 16,
    marginBottom: TvSpacing.one,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    color: TvColors.text,
    fontSize: 40,
    fontWeight: '700',
  },
  unit: {
    color: TvColors.textSecondary,
    fontSize: 18,
  },
  trend: {
    marginTop: TvSpacing.one,
    fontSize: 16,
    fontWeight: '700',
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
