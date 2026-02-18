import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Provider, createStore } from 'jotai';
import { partyHostAtom } from '@fake-goes-party/common';
import { ModeSelection } from '../components/ModeSelection';

function makeStore() {
  const store = createStore();
  store.set(partyHostAtom, 'localhost:1999');
  return store;
}

describe('ModeSelection', () => {
  it('renders the game title', () => {
    render(
      <Provider store={makeStore()}>
        <ModeSelection />
      </Provider>
    );
    expect(screen.getByText('Fake Goes Party')).toBeTruthy();
  });

  it('renders local mode button', () => {
    render(
      <Provider store={makeStore()}>
        <ModeSelection />
      </Provider>
    );
    expect(screen.getByText('Play Locally (Pass Device)')).toBeTruthy();
  });

  it('renders create room button', () => {
    render(
      <Provider store={makeStore()}>
        <ModeSelection />
      </Provider>
    );
    expect(screen.getByText('Create Online Room')).toBeTruthy();
  });

  it('renders join room button', () => {
    render(
      <Provider store={makeStore()}>
        <ModeSelection />
      </Provider>
    );
    expect(screen.getByText('Join Online Room')).toBeTruthy();
  });
});
