// needed for btoa support
import '@react-native-anywhere/polyfill-base64';

/**
 * CustomerIO SDK
 *
 * The React Native SDK provided by customerIO is a series of wrappers on top of native ios/Android code.
 * This leads to a lot of unnecessary complexity and really tough debugging, especially within
 * an Expo environment. I think this is overkill for a notification/event tracking library, so
 * I reimplemented as a basic class and some hooks for integrating within a
 * React Native app. I took a lot of inspiration from the Posthog SDK:
 * https://github.com/PostHog/posthog-js-lite/blob/master/posthog-react-native/src/PostHogProvider.tsx
 *
 * */

export default class CustomerIO {
  customerId: string | null;

  private apiKey: string;

  private host: string;

  constructor(apiKey: string) {
    assert(apiKey, 'CustomerIO tracking api site:key combo required.');

    this.apiKey = apiKey;
    this.host = 'https://track.customer.io/api/v1';
    this.customerId = null;
  }

  /**
   ** TRACKING
   ** */
  async trackEvent({ name, type = 'event', data }: TrackEventProps) {
    assert(this.customerId, 'CustomerIO customerId required.');

    return this.fetchTrackingApi({
      method: 'POST',
      path: `/customers/${this.customerId}/events`,
      payload: {
        name,
        type,
        data,
      } as TrackEventPayload,
    });
  }

  async trackPushNotification({
    deliveryId,
    event,
    deliveryToken,
  }: TrackPushNotificationProps): Promise<Response> {
    const payload: TrackPushNotificationPayload = {
      delivery_id: deliveryId,
      device_id: deliveryToken,
      event,
      // timestamp: convertToSecondsPastEpoch(new Date()),
    };
    return this.fetchTrackingApi({
      method: 'POST',
      path: `/push/events`,
      payload,
    });
  }

  async addDevice({ pushToken }: AddDeviceProps): Promise<Response> {
    assert(this.customerId, 'CustomerIO customerId required.');

    const payload: AddDevicePayload = {
      device: {
        id: pushToken,
        platform: 'ios',
        last_used: convertToSecondsPastEpoch(new Date()),
      },
    };
    return this.fetchTrackingApi({
      method: 'PUT',
      path: `/customers/${this.customerId}/devices`,
      payload,
    });
  }

  async deleteDevice({ pushToken }: DeleteDeviceProps): Promise<Response> {
    assert(this.customerId, 'CustomerIO customerId required.');

    return this.fetchTrackingApi({
      method: 'DELETE',
      path: `/customers/${this.customerId}/devices/${pushToken}`,
    });
  }

  private async fetchTrackingApi({
    path,
    payload,
    method,
  }: FetchTrackingApiProps) {
    const url = `${this.host}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(this.apiKey)}`,
    };
    const body = payload ? JSON.stringify(payload) : undefined;
    const response = await fetch(url, { method, headers, body });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response.json();
  }
}

interface FetchTrackingApiProps {
  path: string;
  payload?: CioApiPayload;
  method: 'PUT' | 'DELETE' | 'POST' | 'GET';
}

function assert(truthyValue: any, message: string): void {
  if (!truthyValue) {
    throw new Error(message);
  }
}

function convertToSecondsPastEpoch(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

interface TrackPushNotificationProps {
  deliveryId: string;
  deliveryToken: string;
  event: 'delivered' | 'opened' | 'converted';
}

interface TrackPushNotificationPayload {
  delivery_id: string; // the CIO-Delivery-ID
  event: 'delivered' | 'opened' | 'converted';
  device_id: string; // the CIO-Delivery-Token
  timestamp?: number; // seconds past epoch
}

// https://www.customer.io/docs/api/#operation/add_device
interface AddDevicePayload {
  device: {
    id: string; // this is the push token. great naming CIO.
    platform: 'ios' | 'android';
    last_used?: number;
    attributes?: {
      device_os?: string;
      device_model?: string;
      app_version?: string;
      cio_sdk_version?: string;
      device_locale?: string;
      push_enabled?: 'true' | 'false';
    };
  };
}

interface TrackEventPayload {
  name: string;
  type: 'event' | 'page' | 'screen';
  data?: any;
  timestamp?: number;
  id?: string;
}

interface TrackEventProps {
  name: string;
  type?: 'event' | 'page' | 'screen';
  data?: any;
}

type CioApiPayload =
  | AddDevicePayload
  | TrackEventPayload
  | TrackPushNotificationPayload;

interface AddDeviceProps {
  pushToken: string;
}

interface DeleteDeviceProps {
  pushToken: string;
}
