'use client';

import NotificationConsole from '@/features/notifications/components/NotificationConsole';

export default function SuperAdminNotificationsPage() {
  return (
    <NotificationConsole
      isSystem={true}
      title="Platform Alert Console"
      description="Monitor and respond to critical global events, system creations, and diagnostic telemetry."
      bellBlockTitle="Global Broadcasts"
      emptyStateTitle="No platform logs"
      emptyStateDescription="Platform network diagnostic channels are quiet. Any health alerts or registrations will appear here."
      loaderText="Syncing alert arrays..."
    />
  );
}
