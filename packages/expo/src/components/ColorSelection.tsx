import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom, useGame } from '@fake-goes-party/common';
import { AVAILABLE_COLORS } from '@fake-goes-party/shared';

export function ColorSelection() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);

  if (!snapshot) return null;
  const { players, qmIndex } = snapshot.context;
  const artists = players.filter((_, i) => i !== qmIndex);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Drawing Colors</Text>
      {artists.map((player, i) => {
        const playerIndex = players.findIndex(p => p.id === player.id);
        const isMe = playerIndex >= 0 && myIndices.includes(playerIndex);
        return (
          <View key={player.id} style={[styles.row, isMe && styles.rowMe]}>
            <View style={[styles.dot, { backgroundColor: AVAILABLE_COLORS[i % AVAILABLE_COLORS.length] }]} />
            <Text style={isMe ? styles.nameMe : styles.name}>{player.name}{isMe ? (isMultiSeat ? '  [This device]' : '  [You]') : ''}</Text>
          </View>
        );
      })}
      <Pressable style={styles.btn} onPress={() => dispatch({ type: 'COLORS_CHOSEN' })}>
        <Text style={styles.btnText}>Start Drawing</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 12 },
  heading: { fontSize: 24, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, width: '100%', maxWidth: 400 },
  rowMe: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' },
  name: { fontSize: 14, color: '#374151' },
  nameMe: { fontSize: 14, fontWeight: '600', color: '#1e3a8a' },
  btn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
