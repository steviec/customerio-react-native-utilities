import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

import cioClient from './cioClient';

/**
 * useCIONotifications
 *
 * This hook sets up the listener for push notifications that were
 * sent by Customer.io. This hook does two main things:
 *  - Tracks push notification opens by sending an event back to Customer.io
 *  - Opens a URL using Linking.openURL if the notification has a url property
 *
 * This effectively "forwards" the url to React Navigation,
 * which will handle the navigation to the appropriate screen.
 *
 * TODO: figure out how to send a "delivered" event if a notification arrives
 * while the app is backgrounded.
 */
export default function useCIONotifications(): void {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const payload =
      lastNotificationResponse?.notification.request.trigger?.payload;
    if (payload) {
      if (payload['CIO-Delivery-Token']) {
        cioClient
          .trackPushNotification({
            event: 'opened',
            deliveryToken: payload['CIO-Delivery-Token'],
            deliveryId: payload['CIO-Delivery-ID'],
          })
          .catch(err => {
            console.log('Error sending trackPushNotification to CIO', err);
          });
      }
      if (payload.url) {
        Linking.openURL(payload.url);
      }
    }
  }, [lastNotificationResponse]);
}
