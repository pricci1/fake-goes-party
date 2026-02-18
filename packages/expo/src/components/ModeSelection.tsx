import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  gameModeAtom,
  roomIdAtom,
  previousRemoteRoomIdsAtom,
  savedLocalGameAtom,
  localRestoreAtom,
  clearLocalGameSaveAtom,
} from '@fake-goes-party/common';
import { generateRoomId, getRoomIdFromUrl, setRoomIdInUrl } from '../utils/roomId';

export function ModeSelection() {
  const setMode = useSetAtom(gameModeAtom);
  const setRoomId = useSetAtom(roomIdAtom);
  const previousRoomIds = useAtomValue(previousRemoteRoomIdsAtom);
  const savedLocalGame = useAtomValue(savedLocalGameAtom);
  const setLocalRestore = useSetAtom(localRestoreAtom);
  const clearLocalSave = useSetAtom(clearLocalGameSaveAtom);

  useEffect(() => {
    const roomId = getRoomIdFromUrl();
    if (roomId) {
      setRoomId(roomId);
      setMode('remote');
    }
  }, [setMode, setRoomId]);

  const handleLocalMode = () => {
    setLocalRestore(null);
    clearLocalSave();
    setMode('local');
  };

  const handleResumeLocal = () => {
    if (!savedLocalGame) return;
    setLocalRestore({ snapshot: savedLocalGame.snapshot, strokes: savedLocalGame.strokes });
    setMode('local');
  };

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    setRoomId(roomId);
    setRoomIdInUrl(roomId);
    setMode('remote');
  };

  const handleJoinRoom = () => {
    const roomId = getRoomIdFromUrl();
    if (!roomId) {
      Alert.alert('No room', 'No room ID found in URL. Use a link from the host.');
      return;
    }
    setRoomId(roomId);
    setMode('remote');
  };

  const handleJoinPreviousRoom = (roomId: string) => {
    setRoomId(roomId);
    setRoomIdInUrl(roomId);
    setMode('remote');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fake Goes Party</Text>

      <View style={styles.buttonGroup}>
        <Pressable style={[styles.button, styles.buttonBlue]} onPress={handleLocalMode}>
          <Text style={styles.buttonText}>Play Locally (Pass Device)</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonGreen]} onPress={handleCreateRoom}>
          <Text style={styles.buttonText}>Create Online Room</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonPurple]} onPress={handleJoinRoom}>
          <Text style={styles.buttonText}>Join Online Room</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        <Text style={styles.bold}>Local Mode:</Text> Share one device, offline.{'\n'}
        <Text style={styles.bold}>Remote Mode:</Text> Online room, multiple devices.
      </Text>

      {savedLocalGame && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Local Game</Text>
          <Pressable style={[styles.button, styles.buttonOutlineBlue]} onPress={handleResumeLocal}>
            <Text style={styles.buttonOutlineText}>Resume Local Game</Text>
            <Text style={styles.subText}>
              {savedLocalGame.snapshot.context.players.map((p) => p.name).join(', ')} — {savedLocalGame.snapshot.state}
            </Text>
          </Pressable>
        </View>
      )}

      {previousRoomIds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Rooms</Text>
          {previousRoomIds.map((roomId) => (
            <Pressable
              key={roomId}
              style={[styles.button, styles.buttonOutline]}
              onPress={() => handleJoinPreviousRoom(roomId)}
            >
              <Text style={styles.buttonOutlineText} numberOfLines={1}>{roomId}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  buttonGroup: { width: '100%', maxWidth: 400, gap: 12 },
  button: { borderRadius: 8, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' },
  buttonBlue: { backgroundColor: '#2563eb' },
  buttonGreen: { backgroundColor: '#16a34a' },
  buttonPurple: { backgroundColor: '#7c3aed' },
  buttonOutline: { borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  buttonOutlineBlue: { borderWidth: 1, borderColor: '#93c5fd', backgroundColor: '#eff6ff' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonOutlineText: { color: '#374151', fontWeight: '600' },
  subText: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  hint: { color: '#6b7280', textAlign: 'center', maxWidth: 400 },
  bold: { fontWeight: '600', color: '#374151' },
  section: { width: '100%', maxWidth: 400, gap: 8 },
  sectionTitle: { fontWeight: '700', color: '#374151', fontSize: 14 },
});
