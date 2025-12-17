import NotificationAdmin from "@/components/component/notification-admin";

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
        <p className="text-gray-600">Create and manage popup notifications for your customers</p>
      </div>
      <NotificationAdmin />
    </div>
  )
}