import { Image } from 'expo-image';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { DEVICE_GROUP } from '@/constants/device-config';
import { TvColors, TvSpacing } from '@/constants/tv-theme';
import { useRealtimeList } from '@/hooks/use-realtime-list';
import type { AttendanceEvent } from '@/types';

const MAX_VISIBLE = 8;

const EVENT_LABEL: Record<AttendanceEvent['event_type'], string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  inicio_descanso: 'Inicio de descanso',
  fin_descanso: 'Fin de descanso',
};

const EVENT_COLOR: Record<AttendanceEvent['event_type'], string> = {
  entrada: TvColors.success,
  salida: TvColors.danger,
  inicio_descanso: TvColors.warning,
  fin_descanso: TvColors.accent,
};

export function CheckadorFeed() {
  const { rows } = useRealtimeList<AttendanceEvent>({
    table: 'attendance_events',
    deviceGroup: DEVICE_GROUP,
    orderBy: 'seq',
    ascending: false,
    limit: MAX_VISIBLE,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Checador en vivo</Text>
      {rows.length === 0 ? (
        <Text style={styles.empty}>Sin registros recientes</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventRow event={item} />}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

function EventRow({ event }: { event: AttendanceEvent }) {
  const time = new Date(event.occurred_at).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <View style={styles.row}>
      {event.employee_photo_url ? (
        <Image source={{ uri: event.employee_photo_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{event.employee_name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={1}>
          {event.employee_name}
        </Text>
        <Text style={[styles.eventType, { color: EVENT_COLOR[event.event_type] }]}>
          {EVENT_LABEL[event.event_type]} · {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    backgroundColor: TvColors.surface,
    borderLeftWidth: 1,
    borderLeftColor: TvColors.border,
    padding: TvSpacing.three,
  },
  heading: {
    color: TvColors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: TvSpacing.two,
  },
  empty: {
    color: TvColors.textSecondary,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: TvSpacing.one,
    borderBottomWidth: 1,
    borderBottomColor: TvColors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    backgroundColor: TvColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: TvColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
  },
  name: {
    color: TvColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  eventType: {
    fontSize: 13,
    fontWeight: '600',
  },
});
