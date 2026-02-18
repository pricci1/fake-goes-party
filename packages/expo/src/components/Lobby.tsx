import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  playersAtom,
  aiQmAtom,
  aiQmLanguageAtom,
  aiGuessEvalAtom,
  maxDrawRoundsAtom,
  winThresholdAtom,
  registerPlayerIdAtom,
  myPlayerIndicesAtom,
  isMultiSeatAtom,
  gameModeAtom,
  roomIdAtom,
  isSpectatorAtom,
  useGame,
} from '@fake-goes-party/common';
import { MIN_PLAYERS } from '@fake-goes-party/shared';

export function Lobby() {
  const { dispatch } = useGame();
  const players = useAtomValue(playersAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const mode = useAtomValue(gameModeAtom);
  const roomId = useAtomValue(roomIdAtom);
  const aiQm = useAtomValue(aiQmAtom);
  const aiQmLanguage = useAtomValue(aiQmLanguageAtom);
  const aiGuessEval = useAtomValue(aiGuessEvalAtom);
  const maxDrawRounds = useAtomValue(maxDrawRoundsAtom);
  const winThreshold = useAtomValue(winThresholdAtom);
  const registerPlayerId = useSetAtom(registerPlayerIdAtom);
  const setSpectator = useSetAtom(isSpectatorAtom);
  const [name, setName] = useState('');

  const addPlayer = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const playerId = crypto.randomUUID();
    dispatch({ type: 'ADD_PLAYER', player: { id: playerId, name: trimmed } });
    registerPlayerId(playerId);
    setName('');
  };

  const startGame = () => {
    if (players.length < MIN_PLAYERS) {
      Alert.alert('Not enough players', `Need at least ${MIN_PLAYERS} players`);
      return;
    }
    dispatch({ type: 'START_GAME' });
  };

  const canStart = players.length >= MIN_PLAYERS;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fake Goes Party</Text>

      {mode === 'remote' && roomId && (
        <View style={styles.card}>
          <Text style={styles.label}>Room Code:</Text>
          <Text style={styles.mono}>{roomId}</Text>
          <Pressable style={styles.btnBlue} onPress={() => setSpectator(true)}>
            <Text style={styles.btnText}>Join as Spectator</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          onSubmitEditing={addPlayer}
          placeholder="Player name"
          returnKeyType="done"
        />
        <Pressable style={[styles.btnBlue, !name.trim() && styles.disabled]} onPress={addPlayer} disabled={!name.trim()}>
          <Text style={styles.btnText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {players.map((p, i) => (
          <View key={p.id} style={[styles.playerRow, myIndices.includes(i) && styles.playerRowMe]}>
            <Text style={myIndices.includes(i) ? styles.playerNameMe : styles.playerName}>
              {p.name}
              {myIndices.includes(i) ? (isMultiSeat ? '  [This device]' : '  [You]') : ''}
            </Text>
            <Pressable onPress={() => dispatch({ type: 'REMOVE_PLAYER', playerIndex: i })}>
              <Text style={styles.removeBtn}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>{players.length} / {MIN_PLAYERS} players minimum</Text>

      <View style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Draw rounds</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => dispatch({ type: 'SET_MAX_DRAW_ROUNDS', value: Math.max(1, maxDrawRounds - 1) })} disabled={maxDrawRounds <= 1}>
              <Text style={styles.stepBtnText}>-</Text>
            </Pressable>
            <Text style={styles.stepValue}>{maxDrawRounds}</Text>
            <Pressable style={styles.stepBtn} onPress={() => dispatch({ type: 'SET_MAX_DRAW_ROUNDS', value: Math.min(5, maxDrawRounds + 1) })} disabled={maxDrawRounds >= 5}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Points to win</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => dispatch({ type: 'SET_WIN_THRESHOLD', value: Math.max(1, winThreshold - 1) })} disabled={winThreshold <= 1}>
              <Text style={styles.stepBtnText}>-</Text>
            </Pressable>
            <Text style={styles.stepValue}>{winThreshold}</Text>
            <Pressable style={styles.stepBtn} onPress={() => dispatch({ type: 'SET_WIN_THRESHOLD', value: Math.min(20, winThreshold + 1) })} disabled={winThreshold >= 20}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable style={[styles.btnGreen, !canStart && styles.disabled]} onPress={startGame} disabled={!canStart}>
        <Text style={styles.btnText}>Start Game</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#eff6ff', borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe', padding: 16, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151' },
  mono: { fontFamily: 'monospace', fontSize: 12, color: '#1e40af', flexWrap: 'wrap' },
  row: { flexDirection: 'row', gap: 8, width: '100%', maxWidth: 400 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  list: { width: '100%', maxWidth: 400, gap: 8 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  playerRowMe: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  playerName: { fontSize: 14, color: '#374151' },
  playerNameMe: { fontSize: 14, fontWeight: '600', color: '#1e3a8a' },
  removeBtn: { color: '#ef4444', fontSize: 13 },
  hint: { color: '#6b7280', fontSize: 13 },
  settingsGroup: { width: '100%', maxWidth: 400, gap: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 14, color: '#374151' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 28, height: 28, borderRadius: 4, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 16, color: '#374151' },
  stepValue: { width: 24, textAlign: 'center', fontSize: 14, fontWeight: '500' },
  btnBlue: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnGreen: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', width: '100%', maxWidth: 400 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
});
