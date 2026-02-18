import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAtomValue } from 'jotai';
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom, aiQmAtom, currentPhaseAtom, useGame } from '@fake-goes-party/common';

export function Scoring() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const aiQm = useAtomValue(aiQmAtom);
  const phase = useAtomValue(currentPhaseAtom);

  if (!snapshot) return null;

  if (phase === 'aiEvaluateGuess') {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Evaluating Guess...</Text>
        <ActivityIndicator size="large" style={{ marginTop: 8 }} />
      </View>
    );
  }

  const { players, scores, fakeArtistIndex, fakeCaught, correctGuess, category, title } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? '???';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Round Over</Text>
      <Text style={styles.sub}>Fake Artist: <Text style={styles.bold}>{fakeName}</Text></Text>
      <Text style={styles.sub}>Category: <Text style={styles.bold}>{category}</Text> — Title: <Text style={styles.bold}>{title}</Text></Text>
      <View style={styles.list}>
        {players.map((p, i) => (
          <View key={p.id} style={styles.row}>
            <Text style={myIndices.includes(i) ? styles.nameMe : styles.name}>{p.name}</Text>
            <Text style={styles.score}>{scores[i] ?? 0}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.btn} onPress={() => dispatch({ type: 'CONTINUE' })}>
        <Text style={styles.btnText}>Next Round</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 16 },
  heading: { fontSize: 24, fontWeight: 'bold' },
  sub: { color: '#374151', textAlign: 'center' },
  bold: { fontWeight: '700' },
  list: { width: '100%', maxWidth: 400, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8 },
  name: { color: '#6b7280' },
  nameMe: { fontWeight: '600', color: '#111827' },
  score: { fontFamily: 'monospace', color: '#374151' },
  btn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
