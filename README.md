# customerio-react-native-utilities
Some utility libs for interacting with the CustomerIO API.

This isn't a proper module for use in your projects, it just shows how simple an integration can be.

## Usage: Client

The easiest way to start using is to create a simple initializer for CIO, like this:

``` 
// cioClient.ts
import CustomerIO from './customerIO/CustomerIO';

const cioClient: CustomerIO = new CustomerIO(CUSTOMER_IO_SITE_API_KEY);

export default cioClient;
```

Then you can import the cioClient and use the methods, which are:
- trackEvent
- trackPushNotification
- addDevice
- deleteDevice

Before using any of those, just make sure to set the customerId like this:
```
cioClient.customerId = 'john@doe.com'
```

## Hooks

There are two hooks to make it easy to setup screen tracking and notification handling.

### useCIONotifications()

This hook sets up the listener for push notifications that were sent by Customer.io. Load this in your root App component.

This hook does two main things:
  - Tracks push notification opens by sending an event back to Customer.io
  - Opens a URL using Linking.openURL if the notification has a url property

This effectively "forwards" the url to React Navigation, which will handle the navigation to the appropriate screen.

### useCIONavigationTracking()

This hook sends a screen tracking event for every screen navigated to in the app. Load this in your top navigation component.