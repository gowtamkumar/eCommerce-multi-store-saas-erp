'use client';

import { useState, useEffect, useCallback } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== 'granted') {
        console.warn('User denied push notification permission');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;

      // Get the VAPID public key from env
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        console.warn('VAPID public key not found');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Failed to subscribe the user:', error);
      setPermission(Notification.permission);
      return null;
    }
  }, [isSupported]);

  const sendSubscriptionToServer = useCallback(async (sub: PushSubscription, backendUrl: string, token?: string) => {
    try {
      await fetch(`${backendUrl}/api/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          token: JSON.stringify(sub),
          platform: 'web',
          userAgent: window.navigator.userAgent
        }),
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }, []);

  return {
    isSupported,
    permission,
    subscription,
    subscribeToPush,
    sendSubscriptionToServer
  };
}
