export type Announcement = {
  id: string;
  device_group: string;
  title: string;
  body: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type MediaItem = {
  id: string;
  device_group: string;
  kind: 'image' | 'video';
  url: string;
  duration_seconds: number | null;
  order_index: number;
  created_at: string;
};

export type DashboardWidget = {
  id: string;
  device_group: string;
  label: string;
  value: number;
  unit: string | null;
  trend: 'up' | 'down' | 'flat' | null;
  updated_at: string;
};

export type AttendanceEvent = {
  id: string;
  seq: number;
  device_group: string;
  employee_id: string;
  employee_name: string;
  employee_photo_url: string | null;
  event_type: 'entrada' | 'inicio_descanso' | 'fin_descanso' | 'salida';
  occurred_at: string;
};
