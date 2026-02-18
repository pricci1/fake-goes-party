import { useAtomValue } from 'jotai';
import { gameModeAtom } from '@fake-goes-party/common';
import { ModeSelection } from '../src/components/ModeSelection';
import { PhaseRouter } from '../src/components/PhaseRouter';

export default function HomeScreen() {
  const mode = useAtomValue(gameModeAtom);

  if (!mode) {
    return <ModeSelection />;
  }

  return <PhaseRouter />;
}
