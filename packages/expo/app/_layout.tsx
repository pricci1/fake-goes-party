import { Stack } from 'expo-router';
import { Provider, createStore } from 'jotai';
import { partyHostAtom, GameProvider } from '@fake-goes-party/common';
import Constants from 'expo-constants';

const store = createStore();
const partyHost =
  Constants.expoConfig?.extra?.partyKitHost ||
  process.env.EXPO_PUBLIC_PARTYKIT_HOST ||
  'localhost:1999';
store.set(partyHostAtom, partyHost);

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GameProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GameProvider>
    </Provider>
  );
}
