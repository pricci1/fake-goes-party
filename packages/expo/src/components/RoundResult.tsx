import { View, Text, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { gameSnapshotAtom } from '@fake-goes-party/common';

export function RoundResult() {
  const snapshot = useAtomValue(gameSnapshotAtom);
  if (!snapshot) return null;

  const { fakeArtistIndex, players, fakeCaught } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? '???';

  return (
    <View style={styles.center}>
      {fakeCaught === false && (
        <>
          <Text style={styles.heading}>The Fake Artist got away!</Text>
          <Text style={styles.sub}>It was {fakeName}!</Text>
          <Text style={styles.note}>The Fake Artist and QM each score 2 points.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#b91c1c' },
  sub: { fontSize: 18, color: '#374151' },
  note: { color: '#6b7280', textAlign: 'center' },
});
