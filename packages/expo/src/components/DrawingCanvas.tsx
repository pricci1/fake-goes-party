import { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAtomValue } from 'jotai';
import {
  gameSnapshotAtom,
  strokesAtom,
  canActAtom,
  actingPlayerNameAtom,
  isMultiSeatAtom,
  actingPlayerIndexAtom,
  useGame,
  useDrawing,
} from '@fake-goes-party/common';
import { getArtistColor, getPlayerLegend } from '@fake-goes-party/common';
import type { Stroke } from '@fake-goes-party/shared';
import { DevicePassGuard } from './DevicePassGuard';

function pointsToPath(points: { x: number; y: number }[], w: number, h: number): string {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  return `M${first!.x * w},${first!.y * h} ` + rest.map(p => `L${p.x * w},${p.y * h}`).join(' ');
}

function StrokeLayer({ strokes, inProgress, inProgressColor, width, height }: {
  strokes: Stroke[];
  inProgress?: { x: number; y: number }[];
  inProgressColor?: string;
  width: number;
  height: number;
}) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {strokes.map(s => (
        <Path key={s.id} d={pointsToPath(s.points, width, height)} stroke={s.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
      {inProgress && inProgress.length > 1 && (
        <Path d={pointsToPath(inProgress, width, height)} stroke={inProgressColor ?? '#000'} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </Svg>
  );
}

interface CanvasProps {
  playerIndex: number;
  color: string;
  drawRound: 1 | 2;
  canDraw: boolean;
  playerName: string;
  category: string;
}

function DrawingCanvasInner({ playerIndex, color, drawRound, canDraw, playerName, category }: CanvasProps) {
  const strokes = useAtomValue(strokesAtom);
  const snapshot = useAtomValue(gameSnapshotAtom);
  const drawing = useDrawing({ playerIndex, color, drawRound, enabled: canDraw });
  const sizeRef = useRef({ width: 300, height: 300 });

  const playerLegend = snapshot?.context
    ? getPlayerLegend(snapshot.context.players, snapshot.context.qmIndex)
    : [];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canDraw,
      onMoveShouldSetPanResponder: () => canDraw,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const { width, height } = sizeRef.current;
        drawing.handlePointerDown(locationX / width, locationY / height);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const { width, height } = sizeRef.current;
        drawing.handlePointerMove(locationX / width, locationY / height);
      },
      onPanResponderRelease: () => drawing.handlePointerUp(),
      onPanResponderTerminate: () => drawing.handlePointerUp(),
    })
  ).current;

  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    sizeRef.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
  }, []);

  return (
    <View style={styles.fullScreen}>
      <View style={styles.header}>
        <Text style={styles.heading}>{playerName} is up</Text>
        <Text style={styles.subText}>Round {drawRound} of 2 — Draw one continuous line</Text>
        <Text style={styles.subText}>Category: <Text style={styles.bold}>{category}</Text></Text>
      </View>
      <View
        style={[styles.canvas, canDraw ? styles.canvasActive : styles.canvasInactive]}
        onLayout={onLayout}
        {...(canDraw ? panResponder.panHandlers : {})}
      >
        <StrokeLayer
          strokes={strokes}
          inProgress={drawing.inProgressPoints}
          inProgressColor={color}
          width={sizeRef.current.width}
          height={sizeRef.current.height}
        />
      </View>
      <View style={styles.legend}>
        {playerLegend.map(p => (
          <View key={p.name} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: p.color }]} />
            <Text style={styles.legendText}>{p.name}</Text>
          </View>
        ))}
      </View>
      {drawing.strokeDone && (
        <Text style={styles.success}>Stroke submitted! Pass the device to the next player.</Text>
      )}
    </View>
  );
}

export function DrawingCanvas() {
  const snapshot = useAtomValue(gameSnapshotAtom);
  const canAct = useAtomValue(canActAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const actingPlayerIndex = useAtomValue(actingPlayerIndexAtom);
  const ctx = snapshot?.context;
  if (!snapshot || !ctx) return null;

  const currentDrawerPlayerIndex = actingPlayerIndex ?? 0;
  const color = getArtistColor(currentDrawerPlayerIndex, ctx.qmIndex ?? -1, ctx.players.length);
  const drawRound = (ctx.drawRound ?? 1) as 1 | 2;
  const currentDrawer = ctx.players[currentDrawerPlayerIndex];

  const canvas = (
    <DrawingCanvasInner
      key={`${ctx.currentDrawerIdx}-${drawRound}`}
      playerIndex={currentDrawerPlayerIndex}
      color={color}
      drawRound={drawRound}
      playerName={actingPlayerName ?? currentDrawer?.name ?? 'Player'}
      canDraw={canAct}
      category={ctx.category}
    />
  );

  if (!canAct) return canvas;

  return (
    <DevicePassGuard
      playerName={actingPlayerName ?? currentDrawer?.name ?? 'Player'}
      canAct={canAct}
      isMultiSeat={isMultiSeat}
      key={`${ctx.currentDrawerIdx}-${drawRound}`}
    >
      {canvas}
    </DevicePassGuard>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, padding: 16, gap: 8 },
  header: { alignItems: 'center', gap: 4 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  subText: { color: '#6b7280', fontSize: 13 },
  bold: { fontWeight: '700', color: '#374151' },
  canvas: { flex: 1, borderRadius: 8, backgroundColor: '#fff', position: 'relative', overflow: 'hidden' },
  canvasActive: { borderWidth: 3, borderColor: '#34d399' },
  canvasInactive: { borderWidth: 2, borderColor: '#d1d5db', opacity: 0.8 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#6b7280' },
  success: { color: '#16a34a', fontWeight: '500', textAlign: 'center' },
});
