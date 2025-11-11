export interface EventEntity {
  id?: number;
  title: string;
  description: string;
  date: string; // ISO string (yyyy-mm-dd)
  location: string;
  type: string;
}
