export type FieldType = 'text' | 'textarea' | 'number' | 'image' | 'gallery' | 'boolean' | 'select' | 'relation' | 'multirelation' | 'date';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  relation?: { entity: string; labelField: string };
  default?: string | number | boolean;
  tab?: string;
}

export const ICON_OPTIONS = ['users', 'smile', 'cert', 'hands', 'expert', 'badge', 'seat', 'chart', 'calendar'].map((v) => ({ value: v, label: v }));
