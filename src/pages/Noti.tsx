import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { API_URL } from "@/api/config";
import { Bell, CheckCircle, UserPlus, Trash2, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/notifications`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      });
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PUT" });

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );

    setUnreadCount((prev) => prev - 1);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "emi":
        return <IndianRupee className="text-green-600" />;
      case "new_customer":
        return <UserPlus className="text-blue-600" />;
      case "deleted_customer":
        return <Trash2 className="text-red-600" />;
      case "loan":
        return <CheckCircle className="text-purple-600" />;
      default:
        return <Bell />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6 max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell /> Notifications
          </h1>

          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white px-3 py-1 rounded-full">
              {unreadCount} New
            </Badge>
          )}
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`flex items-start gap-4 p-4 rounded-xl border shadow-sm transition ${
                item.read ? "bg-white" : "bg-muted/40 border-primary/30"
              }`}
            >
              <div className="p-2 rounded-full bg-muted text-primary">
                {renderIcon(item.type)}
              </div>

              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.time}
                </p>
              </div>

              {!item.read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsRead(item._id)}
                >
                  Mark Read
                </Button>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-center text-muted-foreground mt-10">
              No notifications yet.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
