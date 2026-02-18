import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Provider, createStore } from 'jotai';
import { gameSnapshotAtom, partyHostAtom } from '@fake-goes-party/common';
import { PhaseRouter } from '../components/PhaseRouter';

jest.mock('@fake-goes-party/common', () => {
  const actual = jest.requireActual('@fake-goes-party/common');
  return {
    ...actual,
    useGame: () => ({
      dispatch: jest.fn(),
      authority: {},
      drawSync: { getStrokes: () => [], onStroke: () => () => {}, pushStroke: jest.fn(), clear: jest.fn() },
    }),
    GameProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    gameSubscriptionsAtom: { read: () => null, init: null },
  };
});

function makeStore(phase: string | null = null) {
  const store = createStore();
  store.set(partyHostAtom, 'localhost:1999');
  if (phase) {
    store.set(gameSnapshotAtom, {
      state: phase as any,
      context: {
        players: [],
        scores: [],
        round: 0,
        drawRound: 1,
        qmIndex: 0,
        fakeArtistIndex: 0,
        category: '',
        title: '',
        cardsRevealed: {},
        drawOrder: [],
        currentDrawerIdx: 0,
        votes: {},
        fakeCaught: null,
        correctGuess: null,
        scoreMessage: '',
        winners: [],
        aiQm: false,
        aiGuessEval: false,
        aiQmLanguage: 'English',
        maxDrawRounds: 2,
        winThreshold: 5,
      },
    });
  }
  return store;
}

describe('PhaseRouter', () => {
  it('shows loading when no phase', () => {
    render(
      <Provider store={makeStore()}>
        <PhaseRouter />
      </Provider>
    );
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders Lobby for lobby phase', () => {
    render(
      <Provider store={makeStore('lobby')}>
        <PhaseRouter />
      </Provider>
    );
    expect(screen.getByText('Fake Goes Party')).toBeTruthy();
  });
});
