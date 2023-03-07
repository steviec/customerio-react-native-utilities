import { useEffect } from 'react';
import { NavigationState, useNavigationState } from '@react-navigation/native';

import cioClient from './cioClient';

/**
 * useCIOScreenTracking
 *
 * This hook will send screen tracking events to every screen
 * navigated to in the app. It must be used within a component that
 * has a parent ReactNavigation component, otherwise the
 * useNavigationState hook will throw an error.
 *
 * Make sure to set the CustomerIO customerId before using this hook.
 */
export default function useCIOScreenTracking(): void {
  // this could be dangerous; it will change every time the
  // navigation state changes. It would be better to use
  // state.routes and only key off that selector, but I need
  // the state.index as well to know which is the active route.
  const navigationState = useNavigationState(state => state);

  // I couldn't see a simple React Navigation method to find the
  // currently active screen, so I'm traversing the state through any
  // nested navigators until I find the route lowest in the tree.
  function getActiveScreen(
    state: NavigationState,
  ): NavigationState['routes'][number] {
    const route = state.routes[state.index];
    if (!route.state) {
      return route;
    }

    return getActiveScreen(route.state);
  }

  useEffect(() => {
    async function trackRoute() {
      const screen = getActiveScreen(navigationState);

      if (screen) {
        // TODO: we'll likely want to send anonymous events for
        // people before they've registered
        if (cioClient.customerId) {
          // TODO: we'll need to have some sort of queueing system
          // in the future so we don't send too many tracking events
          await cioClient.trackEvent({
            name: screen.name,
            type: 'screen',
            data: screen.params,
          });
        }
      }
    }

    if (navigationState) {
      trackRoute();
    }
  }, [navigationState]);
}
