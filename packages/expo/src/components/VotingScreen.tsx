import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAtomValue } from 'jotai';
import {
  gameSnapshotAtom,
  myPlayerIndicesAtom,
  isMultiSeatAtom,
  actingPlayerIndexAtom,
  allPlayersOnDeviceAtom,
  gameModeAtom,
  useGame,
} from '@fake-goes-party/common';
import { DevicePassGuard } from './DevicePassGuard';

export function VotingScreen() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const allOnDevice = useAtomValue(allPlayersOnDeviceAtom);
  const mode = useAtomValue(gameModeAtom);
  const actingPlayerIndex = useAtomValue(actingPlayerIndexAtom);
  const [showCanvas, setShowCanvas] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  if (!snapshot) return null;

  const { players, drawOrder, votes: submittedVotes } = snapshot.context;
  const voterIndices = drawOrder ?? [];
  const myVoterIndices = voterIndices.filter(idx => myIndices.includes(idx));
  const pendingVotes = voterIndices.filter(i => submittedVotes[String(i)] === undefined);
  const isQuickVoting = mode === 'local' || (isMultiSeat && allOnDevice);

  if (isQuickVoting) {
    const fakeIdx = snapshot.context.fakeArtistIndex;
    if (quickSubmitted || pendingVotes.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.heading}>{pendingVotes.length === 0 ? 'All votes in!' : 'Waiting for votes...'}</Text>
        </View>
      );
    }
    if (fakeIdx === null || fakeIdx === undefined) return null;
    const nonFakeIdx = players.findIndex((_, i) => i !== fakeIdx);
    const handleQuick = (caught: boolean) => {
      const votedFor = caught ? fakeIdx : nonFakeIdx >= 0 ? nonFakeIdx : fakeIdx;
      for (const vi of voterIndices) dispatch({ type: 'SUBMIT_VOTES', voterIndex: vi, votedForIndex: votedFor });
      setQuickSubmitted(true);
    };
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>Was the Fake Artist caught?</Text>
        <Pressable style={styles.btnGreen} onPress={() => handleQuick(true)}><Text style={styles.btnText}>Fake Artist Caught</Text></Pressable>
        <Pressable style={styles.btnRed} onPress={() => handleQuick(false)}><Text style={styles.btnText}>Fake Artist Got Away</Text></Pressable>
      </View>
    );
  }

  if (currentStep >= myVoterIndices.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>{pendingVotes.length === 0 ? 'All votes in!' : `Waiting for ${pendingVotes.length} more vote(s)...`}</Text>
      </View>
    );
  }

  const voterPlayerIndex = myVoterIndices[currentStep]!;
  const voter = players[voterPlayerIndex]!;
  const candidates = voterIndices.filter(i => i !== voterPlayerIndex).map(i => ({ index: i, player: players[i]! }));

  const handleVote = (votedForIndex: number) => {
    dispatch({ type: 'SUBMIT_VOTES', voterIndex: voterPlayerIndex, votedForIndex });
    setCurrentStep(s => s + 1);
  };

  return (
    <DevicePassGuard playerName={voter.name} key={voterPlayerIndex} canAct isMultiSeat={isMultiSeat}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Who is the Fake Artist?</Text>
        <Text style={styles.subText}>{voter.name}, cast your vote:</Text>
        {candidates.map(({ index, player }) => (
          <Pressable key={index} style={[styles.candidate, index === actingPlayerIndex && styles.candidateHighlight]} onPress={() => handleVote(index)}>
            <Text style={index === actingPlayerIndex ? styles.candidateTextBold : styles.candidateText}>{player.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </DevicePassGuard>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subText: { color: '#6b7280' },
  candidate: { width: '100%', maxWidth: 400, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 14 },
  candidateHighlight: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  candidateText: { fontSize: 15, color: '#374151' },
  candidateTextBold: { fontSize: 15, fontWeight: '600', color: '#1e40af' },
  btnGreen: { width: '100%', maxWidth: 400, backgroundColor: '#dcfce7', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#86efac' },
  btnRed: { width: '100%', maxWidth: 400, backgroundColor: '#fee2e2', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  btnText: { fontWeight: '600', fontSize: 15, color: '#374151' },
});
