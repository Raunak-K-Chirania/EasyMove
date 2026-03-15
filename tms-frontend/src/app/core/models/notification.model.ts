export interface AppNotification {
  id?: number;
  userId?: number;
  title: string;
  message: string;
  isRead?: boolean;
  type?: string;
  relatedRequestId?: number;
  createdAt?: string;
}
