import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider, createStore } from 'jotai';
import { gameModeAtom, partyHostAtom } from '@fake-goes-party/common';
import { Lobby } from '../components/Lobby';

// Minimal mock for GameProvider / useGame
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

function makeStore() {
  const store = createStore();
  store.set(gameModeAtom, 'local');
  store.set(partyHostAtom, 'localhost:1999');
  return store;
}

describe('Lobby', () => {
  it('renders the title', () => {
    render(
      <Provider store={makeStore()}>
        <Lobby />
      </Provider>
    );
    expect(screen.getByText('Fake Goes Party')).toBeTruthy();
  });

  it('renders the Start Game button', () => {
    render(
      <Provider store={makeStore()}>
        <Lobby />
      </Provider>
    );
    expect(screen.getByText('Start Game')).toBeTruthy();
  });

  it('renders the Add button', () => {
    render(
      <Provider store={makeStore()}>
        <Lobby />
      </Provider>
    );
    expect(screen.getByText('Add')).toBeTruthy();
  });
});
