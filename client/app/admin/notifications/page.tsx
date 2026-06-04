'use client';

import NotificationConsole from '@/features/notifications/components/NotificationConsole';

export default function MerchantNotificationsPage() {
  return (
    <NotificationConsole
      isSystem={false}
      title="Store Notifications"
      description="Keep track of your store events, subscription activities, and system logs."
      bellBlockTitle="Alert Hub"
      emptyStateTitle="No alerts found"
      emptyStateDescription="You are all caught up! When new system notifications arrive, they will show up here."
      loaderText="Loading alerts..."
    />
  );
}
