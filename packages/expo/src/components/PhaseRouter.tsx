import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAtomValue } from 'jotai';
import { currentPhaseAtom, aiQmAtom, isSpectatorAtom } from '@fake-goes-party/common';
import { Lobby } from './Lobby';
import { CategorySelection } from './CategorySelection';
import { CardReveal } from './CardReveal';
import { ColorSelection } from './ColorSelection';
import { DrawingCanvas } from './DrawingCanvas';
import { VotingScreen } from './VotingScreen';
import { FakeArtistGuess } from './FakeArtistGuess';
import { Scoring } from './Scoring';
import { GameOver } from './GameOver';
import { RoundResult } from './RoundResult';
import { SpectatorView } from './SpectatorView';

function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

export function PhaseRouter() {
  const phase = useAtomValue(currentPhaseAtom);
  const isSpectator = useAtomValue(isSpectatorAtom);

  if (isSpectator) {
    return <SpectatorRouter phase={phase} />;
  }

  switch (phase) {
    case 'lobby':
      return <Lobby />;
    case 'setupQM':
    case 'categorySelection':
      return <CategorySelection />;
    case 'cardDistribution':
      return <CardReveal />;
    case 'colorSelection':
      return <ColorSelection />;
    case 'drawingPhase':
      return <DrawingCanvas />;
    case 'voting':
      return <VotingScreen />;
    case 'scoreFakeWins':
    case 'evaluateGuess':
    case 'aiEvaluateGuess':
    case 'scoring':
      return <Scoring />;
    case 'fakeArtistGuess':
      return <FakeArtistGuess />;
    case 'checkDrawing':
    case 'evaluateVotes':
    case 'checkWinner':
      return <RoundResult />;
    case 'gameOver':
      return <GameOver />;
    default:
      return <Loading />;
  }
}

function SpectatorRouter({ phase }: { phase: string | null }) {
  const aiQm = useAtomValue(aiQmAtom);
  switch (phase) {
    case 'lobby':
      return <SpectatorView message="Waiting for the game to start…" />;
    case 'setupQM':
    case 'categorySelection':
      return <SpectatorView message={aiQm ? 'The AI is choosing a category…' : 'The Question Master is picking a category…'} />;
    case 'cardDistribution':
    case 'colorSelection':
      return <SpectatorView message="Players are getting ready…" />;
    case 'drawingPhase':
      return <SpectatorView showCanvas message="Drawing in progress" />;
    case 'voting':
      return <SpectatorView showCanvas message="Players are voting on the fake artist…" />;
    case 'fakeArtistGuess':
      return <SpectatorView showCanvas message="The fake artist is guessing the word…" />;
    case 'scoreFakeWins':
    case 'evaluateGuess':
    case 'aiEvaluateGuess':
    case 'scoring':
      return <Scoring />;
    case 'checkDrawing':
    case 'evaluateVotes':
    case 'checkWinner':
      return <RoundResult />;
    case 'gameOver':
      return <GameOver />;
    default:
      return <SpectatorView message="Loading…" />;
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
