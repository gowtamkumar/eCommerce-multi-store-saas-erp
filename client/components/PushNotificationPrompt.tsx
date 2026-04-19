'use client';

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PushNotificationPrompt() {
  const { isSupported, permission, subscribeToPush, sendSubscriptionToServer } = usePushNotifications();
  const { data: session } = useSession();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Determine the backend URL dynamically or from env
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3900';

    if (isSupported && permission === 'default') {
      // Small delay before showing the prompt
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    if (isSupported && permission === 'granted') {
      // Sync subscription if user is logged in
      const syncSub = async () => {
        const sub = await subscribeToPush();
        if (sub) {
          await sendSubscriptionToServer(sub, backendUrl, session?.user?.accessToken);
        }
      };
      // For now we sync once if granted
      syncSub();
    }
  }, [isSupported, permission, subscribeToPush, sendSubscriptionToServer, session]);

  if (!showPrompt) return null;

  const handleSubscribe = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3900';
    const sub = await subscribeToPush();
    if (sub) {
      await sendSubscriptionToServer(sub, backendUrl, session?.user?.accessToken);
      setShowPrompt(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-sm flex gap-4 animate-in slide-in-from-bottom-5">
      <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enable Notifications</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
          Get real-time updates on your orders and exclusive flash sale alerts directly on your device.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Allow
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
      <button onClick={() => setShowPrompt(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
