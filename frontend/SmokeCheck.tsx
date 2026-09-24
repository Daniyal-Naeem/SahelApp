import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';

export default function SmokeCheck() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.card}>
        <Text style={styles.title}>Sahal RN OK</Text>
        <Text style={styles.sub}>0.82.1 · Android integration check</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center'},
  card: {padding: 24, borderRadius: 16, backgroundColor: '#1e293b'},
  title: {color: '#f8fafc', fontSize: 24, fontWeight: '700', textAlign: 'center'},
  sub: {color: '#94a3b8', marginTop: 8, textAlign: 'center'},
});
