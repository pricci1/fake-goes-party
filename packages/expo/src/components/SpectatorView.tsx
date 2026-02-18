import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSetAtom } from 'jotai';
import { isSpectatorAtom } from '@fake-goes-party/common';

interface Props {
  message: string;
  showCanvas?: boolean;
}

export function SpectatorView({ message, showCanvas }: Props) {
  const setSpectator = useSetAtom(isSpectatorAtom);
  return (
    <View style={styles.center}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Spectator</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={() => setSpectator(false)}>
        <Text style={styles.link}>Leave spectator mode</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  badge: { backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText: { color: '#4b5563', fontWeight: '500', fontSize: 13 },
  message: { fontSize: 18, color: '#6b7280', textAlign: 'center' },
  link: { color: '#9ca3af', textDecorationLine: 'underline', marginTop: 16 },
});
