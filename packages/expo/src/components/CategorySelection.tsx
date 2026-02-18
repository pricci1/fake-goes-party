import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  gameSnapshotAtom,
  canActAtom,
  actingPlayerNameAtom,
  isMultiSeatAtom,
  aiQmAtom,
  gameModeAtom,
  aiQmLanguageAtom,
  suggestingAtom,
  aiSuggestAtom,
  useGame,
} from '@fake-goes-party/common';
import { DevicePassGuard } from './DevicePassGuard';

export function CategorySelection() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const aiQm = useAtomValue(aiQmAtom);
  const canAct = useAtomValue(canActAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const gameMode = useAtomValue(gameModeAtom);
  const suggesting = useAtomValue(suggestingAtom);
  const aiSuggest = useSetAtom(aiSuggestAtom);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');

  if (!snapshot) return null;
  const qmIndex = snapshot.context.qmIndex;
  const qmName = snapshot.context.players[qmIndex]?.name ?? 'QM';
  const playerCount = snapshot.context.players.length;

  if (aiQm) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>AI Question Master</Text>
        <ActivityIndicator size="large" style={{ marginTop: 8 }} />
        <Text style={styles.subText}>Choosing a category and title...</Text>
      </View>
    );
  }

  const handleSuggest = async () => {
    const result = await aiSuggest({ playerCount, language: 'English' });
    if (result) { setCategory(result.category); setTitle(result.title); }
  };

  const submit = () => {
    if (!category.trim() || !title.trim()) return;
    const artistIndices = Array.from({ length: playerCount }, (_, i) => i).filter(i => i !== qmIndex);
    const fakeArtistIndex = artistIndices[Math.floor(Math.random() * artistIndices.length)] ?? 0;
    dispatch({ type: 'SET_CATEGORY', category: category.trim(), title: title.trim(), fakeArtistIndex });
  };

  if (!canAct) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Waiting for {actingPlayerName ?? qmName}</Text>
        <Text style={styles.subText}>The Question Master is choosing the category.</Text>
      </View>
    );
  }

  return (
    <DevicePassGuard playerName={actingPlayerName ?? qmName} canAct={canAct} isMultiSeat={isMultiSeat}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{qmName} is the Question Master</Text>
        <Text style={styles.subText}>Pick a category and secret title to draw.</Text>
        <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category (e.g. Animals)" />
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Secret title (e.g. Cat)" />
        {gameMode === 'remote' && (
          <Pressable style={[styles.btnOutline, suggesting && styles.disabled]} onPress={handleSuggest} disabled={suggesting}>
            <Text style={styles.btnOutlineText}>{suggesting ? 'Generating...' : 'AI Suggest'}</Text>
          </Pressable>
        )}
        <Pressable style={[styles.btn, (!category.trim() || !title.trim()) && styles.disabled]} onPress={submit} disabled={!category.trim() || !title.trim()}>
          <Text style={styles.btnText}>Confirm</Text>
        </Pressable>
      </ScrollView>
    </DevicePassGuard>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subText: { color: '#6b7280', textAlign: 'center' },
  input: { width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  btn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, width: '100%', maxWidth: 400, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  btnOutline: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '100%', maxWidth: 400, alignItems: 'center' },
  btnOutlineText: { color: '#2563eb', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
