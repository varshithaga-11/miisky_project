import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  fetchNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  AppNotification,
} from "../api/notifications";

export interface HeaderNotification {
  id: number;
  title: string;
  description: string;
  date: string;
  is_read: boolean;
}

function mapToHeader(n: AppNotification): HeaderNotification {
  return {
    id: n.id,
    title: n.title,
    description: n.body,
    date: n.created_at,
    is_read: n.is_read,
  };
}

interface NotificationContextType {
  notifications: HeaderNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { items, unreadCount: serverUnread } = await fetchNotificationsApi();
      const mapped = items.map(mapToHeader);
      setNotifications(mapped);
      setUnreadCount(serverUnread);
      setError(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "response" in err
            ? String(
                (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
                  "Failed to fetch notifications"
              )
            : "Failed to fetch notifications";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await markNotificationReadApi(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        await fetchNotifications();
      }
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};
