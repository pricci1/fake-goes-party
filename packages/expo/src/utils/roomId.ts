import { generateRoomId } from '@fake-goes-party/common';
import * as Linking from 'expo-linking';

export { generateRoomId };

export function getRoomIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('room');
  } catch {
    return null;
  }
}

export function setRoomIdInUrl(roomId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
  } catch {
    // ignore on native
  }
}
