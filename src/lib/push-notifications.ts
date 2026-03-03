// Push notification utilities for InstantRyde
import { supabase } from "@/integrations/supabase/client";

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Get current notification permission status
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }
  return Notification.requestPermission();
};

// Convert VAPID key from base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
};

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  try {
    const pm = (registration as any).pushManager;
    if (!pm) return null;
    const subscription = await pm.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log('Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
};

// Save push subscription to database
export const savePushSubscription = async (
  userId: string,
  subscription: PushSubscription,
  role: string
): Promise<boolean> => {
  try {
    const subscriptionJson = subscription.toJSON();
    
    const subscriptionData = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscriptionJson.keys?.p256dh || '',
      auth: subscriptionJson.keys?.auth || '',
      role: role,
    };
    
    // Upsert to database - delete existing and insert new
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', subscription.endpoint);
    
    if (deleteError) {
      console.warn('Error deleting old subscription:', deleteError);
    }
    
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .insert(subscriptionData);
    
    if (insertError) {
      console.error('Error saving push subscription:', insertError);
      return false;
    }
    
    console.log('Push subscription saved to database');
    return true;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (
  registration: ServiceWorkerRegistration
): Promise<boolean> => {
  try {
    const pm = (registration as any).pushManager;
    if (!pm) return false;
    const subscription = await pm.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
};

// Check if already subscribed
export const getExistingSubscription = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const pm = (registration as any).pushManager;
    if (!pm) return null;
    return await pm.getSubscription();
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

// Show local notification (for testing or offline scenarios)
export const showLocalNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-icons/icon-512.png',
      badge: '/pwa-icons/icon-512.png',
      ...options,
    });
  }
};

// Initialize push notifications
export const initializePushNotifications = async (
  userId: string,
  role: string,
  vapidPublicKey?: string
): Promise<boolean> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      return false;
    }

    // If VAPID key is provided, subscribe to push
    if (vapidPublicKey) {
      const subscription = await subscribeToPush(registration, vapidPublicKey);
      if (subscription) {
        await savePushSubscription(userId, subscription, role);
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return false;
  }
};
