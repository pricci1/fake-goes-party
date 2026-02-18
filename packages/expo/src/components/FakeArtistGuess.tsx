import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { gameSnapshotAtom, canActAtom, actingPlayerNameAtom, isMultiSeatAtom, useGame } from '@fake-goes-party/common';
import { DevicePassGuard } from './DevicePassGuard';

export function FakeArtistGuess() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const canAct = useAtomValue(canActAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const [guess, setGuess] = useState('');

  if (!snapshot) return null;
  const { fakeArtistIndex, players, category } = snapshot.context;
  const fakeName = players[fakeArtistIndex ?? 0]?.name ?? '???';

  const content = (
    <View style={styles.center}>
      <Text style={styles.heading}>You were caught, {fakeName}!</Text>
      <Text style={styles.hint}>But you can still win — guess the title!</Text>
      <Text style={styles.category}>Category: <Text style={styles.bold}>{category}</Text></Text>
      <View style={styles.row}>
        <TextInput style={styles.input} value={guess} onChangeText={setGuess} placeholder="What was the title?" onSubmitEditing={() => guess.trim() && dispatch({ type: 'GUESS_TITLE', guess: guess.trim() })} />
        <Pressable style={[styles.btn, !guess.trim() && styles.disabled]} onPress={() => dispatch({ type: 'GUESS_TITLE', guess: guess.trim() })} disabled={!guess.trim()}>
          <Text style={styles.btnText}>Guess</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!canAct) return content;
  return (
    <DevicePassGuard playerName={actingPlayerName ?? fakeName} canAct={canAct} isMultiSeat={isMultiSeat}>
      {content}
    </DevicePassGuard>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#92400e', textAlign: 'center' },
  hint: { color: '#78350f', textAlign: 'center' },
  category: { fontSize: 16, color: '#374151' },
  bold: { fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, width: '100%', maxWidth: 400 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  btn: { backgroundColor: '#d97706', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
