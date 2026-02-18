import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  playerName: string;
  children: React.ReactNode;
  canAct: boolean;
  isMultiSeat: boolean;
}

export function DevicePassGuard({ playerName, children, canAct, isMultiSeat }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [playerName]);

  const shouldGate = isMultiSeat && canAct;

  if (!shouldGate || ready) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pass the device to</Text>
      <Text style={styles.name}>{playerName}</Text>
      <Pressable style={styles.btn} onPress={() => setReady(true)}>
        <Text style={styles.btnText}>I'm {playerName} — Ready!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  heading: { fontSize: 22, fontWeight: 'bold' },
  name: { fontSize: 36, fontWeight: 'bold' },
  btn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
