import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom, useGame } from '@fake-goes-party/common';

export function GameOver() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);

  if (!snapshot) return null;
  const { players, scores, winners } = snapshot.context;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Game Over!</Text>
      <Text style={styles.winners}>
        {winners.length === 1 ? `${winners[0]!.name} wins!` : `Winners: ${winners.map(w => w.name).join(', ')}!`}
      </Text>
      <View style={styles.list}>
        <Text style={styles.sectionTitle}>Final Scores</Text>
        {players.map((p, i) => (
          <View key={p.id} style={styles.row}>
            <Text style={myIndices.includes(i) ? styles.nameMe : styles.name}>
              {p.name}{winners.some(w => w.id === p.id) ? ' 🏆' : ''}
            </Text>
            <Text style={styles.score}>{scores[i] ?? 0}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.btn} onPress={() => dispatch({ type: 'PLAY_AGAIN' })}>
        <Text style={styles.btnText}>Play Again</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 16 },
  title: { fontSize: 32, fontWeight: 'bold' },
  winners: { fontSize: 20, color: '#059669', fontWeight: '600', textAlign: 'center' },
  list: { width: '100%', maxWidth: 400, gap: 4 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8 },
  name: { color: '#6b7280' },
  nameMe: { fontWeight: '600', color: '#111827' },
  score: { fontFamily: 'monospace' },
  btn: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
