import SubscriberList from '@/features/system-platform/components/SubscriberList';

export default function SubscribersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscribers</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage newsletter subscribers.</p>
      </div>

      <SubscriberList />
    </div>
  );
}
