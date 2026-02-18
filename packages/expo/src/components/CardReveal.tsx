import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { gameSnapshotAtom, myPlayerIndicesAtom, isMultiSeatAtom, useGame } from '@fake-goes-party/common';
import { DevicePassGuard } from './DevicePassGuard';

export function CardReveal() {
  const { dispatch } = useGame();
  const snapshot = useAtomValue(gameSnapshotAtom);
  const myIndices = useAtomValue(myPlayerIndicesAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);

  if (!snapshot) return null;
  const { players, qmIndex, fakeArtistIndex, category, title, cardsRevealed } = snapshot.context;

  if (currentStep >= myIndices.length) {
    const artistIndices = players.map((_, i) => i).filter(i => i !== qmIndex);
    const allReady = artistIndices.every(i => cardsRevealed[String(i)]);
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>{allReady ? 'All cards revealed!' : 'Waiting for others...'}</Text>
        <Text style={styles.subText}>{allReady ? 'Moving to next phase.' : 'All artists must reveal their cards.'}</Text>
      </View>
    );
  }

  const playerIndex = myIndices[currentStep]!;
  const player = players[playerIndex]!;
  const isQM = playerIndex === qmIndex;
  const isFake = playerIndex === fakeArtistIndex;
  const role = isQM ? 'Question Master' : isFake ? 'Fake Artist' : 'Artist';
  const detail = isQM ? `${category} | ${title}` : isFake ? category : `${category} | ${title}`;

  const handleNext = () => {
    if (!isQM) dispatch({ type: 'CARDS_REVEALED', playerIndex });
    setCardVisible(false);
    setCurrentStep(s => s + 1);
  };

  return (
    <DevicePassGuard playerName={player.name} key={currentStep} canAct isMultiSeat={isMultiSeat}>
      <View style={styles.center}>
        <Text style={styles.heading}>Your card, {player.name}:</Text>
        {!cardVisible ? (
          <Pressable style={styles.btn} onPress={() => setCardVisible(true)}>
            <Text style={styles.btnText}>Tap to reveal</Text>
          </Pressable>
        ) : (
          <>
            <View style={[styles.card, isFake ? styles.cardFake : isQM ? styles.cardQM : styles.cardArtist]}>
              <Text style={[styles.role, isFake ? styles.colorFake : isQM ? styles.colorQM : styles.colorArtist]}>{role}</Text>
              <Text style={styles.detail}>{detail}</Text>
            </View>
            <Pressable style={styles.btn} onPress={handleNext}>
              <Text style={styles.btnText}>Got it — Next player</Text>
            </Pressable>
          </>
        )}
      </View>
    </DevicePassGuard>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  card: { borderRadius: 12, borderWidth: 2, padding: 24, alignItems: 'center', gap: 8, width: '100%', maxWidth: 300 },
  cardFake: { borderColor: '#fca5a5', backgroundColor: '#fff1f2' },
  cardQM: { borderColor: '#93c5fd', backgroundColor: '#eff6ff' },
  cardArtist: { borderColor: '#6ee7b7', backgroundColor: '#ecfdf5' },
  role: { fontSize: 18, fontWeight: 'bold' },
  colorFake: { color: '#b91c1c' },
  colorQM: { color: '#1d4ed8' },
  colorArtist: { color: '#059669' },
  detail: { fontSize: 15, color: '#374151', textAlign: 'center' },
  btn: { backgroundColor: '#1e40af', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  subText: { color: '#6b7280' },
});
