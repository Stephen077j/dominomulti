console.log('[INDEX] module loading start');
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { create, all } from 'mathjs';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NeonButton from '@/components/NeonButton';
import StarField from '@/components/StarField';
import { useCalcHistory } from '@/context/CalcHistoryContext';
import { useLicense } from '@/context/LicenseContext';
import { useColors } from '@/hooks/useColors';

const math = create(all);
const PAD = 8;
const GAP = 4;
const KEY_H = 46;

type AngleMode = 'DEG' | 'RAD' | 'GRAD';
type KeyVar = 'default' | 'operator' | 'function' | 'special' | 'equals' | 'danger';

interface CalcKey {
  label: string; label2?: string;
  action: string; action2?: string;
  variant: KeyVar;
}

const KEYS: CalcKey[][] = [
  [
    { label: '2nd', action: 'toggle2nd', variant: 'special' },
    { label: 'sin', label2: 'asin', action: 'sin(', action2: 'asin(', variant: 'function' },
    { label: 'cos', label2: 'acos', action: 'cos(', action2: 'acos(', variant: 'function' },
    { label: 'tan', label2: 'atan', action: 'tan(', action2: 'atan(', variant: 'function' },
    { label: '⌫', action: 'del', variant: 'danger' },
  ],
  [
    { label: 'x²', label2: 'x³', action: '²', action2: '³', variant: 'function' },
    { label: '√', label2: '∛', action: 'sqrt(', action2: 'cbrt(', variant: 'function' },
    { label: 'ln', label2: 'eˣ', action: 'ln(', action2: 'exp(', variant: 'function' },
    { label: 'log', label2: '10^(', action: 'log(', action2: '10^(', variant: 'function' },
    { label: 'n!', label2: 'mod', action: '!', action2: ' mod ', variant: 'function' },
  ],
  [
    { label: 'STO', action: 'sto', variant: 'special' },
    { label: 'RCL', action: 'rcl', variant: 'special' },
    { label: 'π', action: 'π', variant: 'function' },
    { label: 'e', action: 'e', variant: 'function' },
    { label: '^', action: '^', variant: 'operator' },
  ],
  [
    { label: '(', action: '(', variant: 'operator' },
    { label: ')', action: ')', variant: 'operator' },
    { label: '÷', action: '÷', variant: 'operator' },
    { label: '×', action: '×', variant: 'operator' },
    { label: 'AC', action: 'ac', variant: 'danger' },
  ],
  [
    { label: '7', action: '7', variant: 'default' },
    { label: '8', action: '8', variant: 'default' },
    { label: '9', action: '9', variant: 'default' },
    { label: '-', action: '-', variant: 'operator' },
    { label: '%', action: '%', variant: 'operator' },
  ],
  [
    { label: '4', action: '4', variant: 'default' },
    { label: '5', action: '5', variant: 'default' },
    { label: '6', action: '6', variant: 'default' },
    { label: '+', action: '+', variant: 'operator' },
    { label: 'ANS', action: 'ans', variant: 'special' },
  ],
  [
    { label: '1', action: '1', variant: 'default' },
    { label: '2', action: '2', variant: 'default' },
    { label: '3', action: '3', variant: 'default' },
    { label: '.', action: '.', variant: 'default' },
    { label: '±', action: 'neg', variant: 'operator' },
  ],
  [
    { label: '0', action: '0', variant: 'default' },
    { label: 'EE', action: '*10^', variant: 'default' },
    { label: ',', action: ',', variant: 'default' },
    { label: 'HIST', action: 'hist', variant: 'special' },
    { label: '=', action: '=', variant: 'equals' },
  ],
];

const VARS_KEYS = ['A', 'B', 'C', 'D', 'E'];

function toEval(expr: string): string {
  return expr
    .replace(/π/g, 'pi')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\bsin\b/g, '_sin')
    .replace(/\bcos\b/g, '_cos')
    .replace(/\btan\b/g, '_tan')
    .replace(/\basin\b/g, '_asin')
    .replace(/\bacos\b/g, '_acos')
    .replace(/\batan\b/g, '_atan')
    .replace(/\bln\b/g, '_ln')
    .replace(/\blog\b/g, '_log')
    .replace(/\bcbrt\b/g, '_cbrt')
    .replace(/\bexp\b/g, '_exp')
    .replace(/\bsqrt\b/g, 'sqrt');
}

function makeScope(mode: AngleMode, ans: number, mem: number, vars: Record<string, number>) {
  const d = mode === 'DEG' ? Math.PI / 180 : mode === 'GRAD' ? Math.PI / 200 : 1;
  const rd = 1 / d;
  return {
    ans, mem,
    A: vars.A ?? 0, B: vars.B ?? 0, C: vars.C ?? 0, D: vars.D ?? 0, E: vars.E ?? 0,
    _sin: (x: number) => Math.sin(x * d),
    _cos: (x: number) => Math.cos(x * d),
    _tan: (x: number) => Math.tan(x * d),
    _asin: (x: number) => Math.asin(x) * rd,
    _acos: (x: number) => Math.acos(x) * rd,
    _atan: (x: number) => Math.atan(x) * rd,
    _ln: (x: number) => Math.log(x),
    _log: (x: number) => Math.log10(x),
    _cbrt: (x: number) => Math.cbrt(x),
    _exp: (x: number) => Math.exp(x),
  };
}

function fmtResult(val: unknown): string {
  if (typeof val !== 'number') {
    if (val && typeof val === 'object' && 'toNumber' in val) {
      return fmtResult((val as { toNumber: () => number }).toNumber());
    }
    return String(val);
  }
  if (!isFinite(val)) return val > 0 ? '+∞' : val < 0 ? '-∞' : 'NaN';
  if (isNaN(val)) return 'Erreur';
  if (Math.abs(val) >= 1e12 || (Math.abs(val) < 1e-7 && val !== 0)) {
    return val.toExponential(6).replace('e+', 'E').replace('e', 'E');
  }
  const s = val.toPrecision(10);
  return String(parseFloat(s));
}

export default function CalcScreen() {
  console.log('[INDEX] CalcScreen render start');
  const { width: W } = useWindowDimensions();
  const KEY_W = Math.max(1, (W - PAD * 2 - GAP * 4) / 5);
  console.log('[INDEX] W =', W, 'KEY_W =', KEY_W);
  const colors = useColors();
  console.log('[INDEX] colors ok');
  const insets = useSafeAreaInsets();
  console.log('[INDEX] insets ok');
  const { addEntry, lastResult, history } = useCalcHistory();
  console.log('[INDEX] history ok');
  const { isLicensed } = useLicense();
  console.log('[INDEX] license ok, isLicensed =', isLicensed);

  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [is2nd, setIs2nd] = useState(false);
  const [mem, setMem] = useState(0);
  const [vars, setVars] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [stoMode, setStoMode] = useState(false);
  const [rclMode, setRclMode] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [error, setError] = useState(false);

  const cycleModes: AngleMode[] = ['DEG', 'RAD', 'GRAD'];

  const evaluate = useCallback((e: string): string => {
    try {
      const ev = toEval(e);
      const scope = makeScope(angleMode, parseFloat(lastResult) || 0, mem, vars);
      const res = math.evaluate(ev, scope as Record<string, unknown>);
      return fmtResult(res);
    } catch {
      return 'Erreur';
    }
  }, [angleMode, lastResult, mem, vars]);

  const handleKey = useCallback((action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (stoMode) {
      if (VARS_KEYS.includes(action)) {
        const val = parseFloat(result) || 0;
        setVars(v => ({ ...v, [action]: val }));
        setStoMode(false);
      } else {
        setStoMode(false);
      }
      return;
    }
    if (rclMode) {
      if (VARS_KEYS.includes(action)) {
        setExpr(e => e + action);
        setRclMode(false);
        setError(false);
      } else {
        setRclMode(false);
      }
      return;
    }

    setError(false);

    switch (action) {
      case 'toggle2nd': setIs2nd(v => !v); return;
      case 'del':
        setExpr(e => {
          if (e.length === 0) return '';
          // Remove last char, but handle multi-char tokens
          const tokens = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'sqrt(', 'cbrt(', 'exp(', 'ln(', 'log(', '*10^', ' mod '];
          for (const t of tokens) {
            if (e.endsWith(t)) return e.slice(0, -t.length);
          }
          return e.slice(0, -1);
        });
        return;
      case 'ac':
        setExpr('');
        setResult('0');
        setError(false);
        return;
      case 'sto':
        if (is2nd) { setMem(parseFloat(result) || 0); setIs2nd(false); } else { setStoMode(true); }
        return;
      case 'rcl':
        if (is2nd) { setExpr(e => e + String(mem)); setIs2nd(false); } else { setRclMode(true); }
        return;
      case 'ans':
        setExpr(e => e + 'ans');
        return;
      case 'neg':
        if (expr === '' || expr === '0') {
          setExpr('-');
        } else if (expr.startsWith('-')) {
          setExpr(e => e.slice(1));
        } else {
          setExpr(e => '-(' + e + ')');
        }
        return;
      case '%':
        setExpr(e => e + '÷100');
        return;
      case 'hist':
        setShowHist(true);
        return;
      case '=': {
        if (expr === '') return;
        const r = evaluate(expr);
        const isErr = r === 'Erreur';
        setError(isErr);
        setResult(r);
        if (!isErr) {
          addEntry(expr, r);
          setExpr('');
        }
        Haptics.notificationAsync(isErr ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success);
        return;
      }
      default:
        setExpr(e => {
          const newE = e + action;
          try {
            const r = evaluate(newE);
            if (r !== 'Erreur') setResult(r);
          } catch {}
          return newE;
        });
    }
    if (is2nd && !['toggle2nd', 'sto', 'rcl'].includes(action)) setIs2nd(false);
  }, [stoMode, rclMode, is2nd, result, expr, evaluate, addEntry, mem]);

  const modeBtn = (
    <TouchableOpacity
      onPress={() => {
        const idx = cycleModes.indexOf(angleMode);
        setAngleMode(cycleModes[(idx + 1) % 3]);
      }}
      style={styles.modeBtn}
    >
      <Text style={[styles.modeBtnText, { color: colors.neonCyan }]}>{angleMode}</Text>
    </TouchableOpacity>
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  console.log('[INDEX] returning JSX, topPad =', topPad);

  return (
    <View style={[styles.root, { backgroundColor: '#0a0a0f' }]}>
      <StarField />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerLeft}>
          {modeBtn}
          {is2nd && (
            <View style={[styles.secondBadge, { borderColor: colors.neonMagenta }]}>
              <Text style={[styles.secondText, { color: colors.neonMagenta }]}>2nd</Text>
            </View>
          )}
        </View>
        {!isLicensed && (
          <TouchableOpacity onPress={() => router.push('/licence')} style={styles.licBtn}>
            <Text style={[styles.licBtnText, { color: colors.neonOrange }]}>ACTIVER</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.push('/licence')} style={styles.licIconBtn}>
          <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Display */}
      <View style={[styles.display, { borderColor: colors.border, backgroundColor: 'rgba(0,10,20,0.8)' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exprScroll} contentContainerStyle={{ alignItems: 'center' }}>
          <Text style={[styles.exprText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {expr || '0'}
          </Text>
        </ScrollView>
        <Text
          style={[styles.resultText, { color: error ? colors.destructive : colors.neonCyan }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {result}
        </Text>
        {stoMode && (
          <View style={styles.varRow}>
            <Text style={[styles.varHint, { color: colors.neonMagenta }]}>STO →</Text>
            {VARS_KEYS.map(k => (
              <TouchableOpacity key={k} onPress={() => handleKey(k)} style={[styles.varKey, { borderColor: colors.neonMagenta }]}>
                <Text style={[styles.varKeyText, { color: colors.neonMagenta }]}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {rclMode && (
          <View style={styles.varRow}>
            <Text style={[styles.varHint, { color: colors.neonGreen }]}>RCL →</Text>
            {VARS_KEYS.map(k => (
              <TouchableOpacity key={k} onPress={() => handleKey(k)} style={[styles.varKey, { borderColor: colors.neonGreen }]}>
                <Text style={[styles.varKeyText, { color: colors.neonGreen }]}>{k}: {fmtResult(vars[k])}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key) => {
              const active2nd = is2nd && key.label2;
              const lbl = active2nd ? key.label2! : key.label;
              const act = active2nd ? (key.action2 ?? key.action) : key.action;
              return (
                <NeonButton
                  key={key.action}
                  label={lbl}
                  onPress={() => handleKey(act)}
                  variant={active2nd && key.action2 ? 'special' : key.variant}
                  style={{ width: KEY_W, height: KEY_H }}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Vars display */}
      <View style={[styles.varsBar, { borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : 4 }]}>
        {VARS_KEYS.map(k => (
          <View key={k} style={styles.varItem}>
            <Text style={[styles.varLabel, { color: colors.neonViolet }]}>{k}</Text>
            <Text style={[styles.varVal, { color: colors.mutedForeground }]}>{fmtResult(vars[k])}</Text>
          </View>
        ))}
        <View style={styles.varItem}>
          <Text style={[styles.varLabel, { color: colors.neonViolet }]}>M</Text>
          <Text style={[styles.varVal, { color: colors.mutedForeground }]}>{fmtResult(mem)}</Text>
        </View>
      </View>

      {/* History Modal — only mount when needed to avoid web overlay bug */}
      {showHist && (
        <Modal visible animationType="slide" transparent>
          <View style={styles.histOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.98)', '#0a0a0f']}
              style={styles.histModal}
            >
              <View style={styles.histHeader}>
                <Text style={[styles.histTitle, { color: colors.neonCyan }]}>Historique</Text>
                <TouchableOpacity onPress={() => setShowHist(false)} style={styles.histClose}>
                  <Text style={{ color: colors.neonMagenta, fontSize: 18, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={history}
                keyExtractor={i => i.id}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Aucun historique</Text>}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => { setExpr(item.result); setShowHist(false); }}
                    style={[styles.histItem, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[styles.histExpr, { color: colors.mutedForeground }]}>{item.expression}</Text>
                    <Text style={[styles.histResult, { color: colors.neonCyan }]}>= {item.result}</Text>
                  </Pressable>
                )}
              />
            </LinearGradient>
          </View>
        </Modal>
      )}
    </View>
  );
}

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 4 },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeBtn: { borderWidth: 1, borderColor: '#00f5ff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  modeBtnText: { fontSize: 12, fontWeight: '700', fontFamily: MONO },
  secondBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  secondText: { fontSize: 11, fontWeight: '700' },
  licBtn: { marginRight: 10, borderWidth: 1, borderColor: '#ff6b00', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  licBtnText: { fontSize: 11, fontWeight: '700' },
  licIconBtn: { padding: 4 },
  display: {
    marginHorizontal: PAD,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 6,
    minHeight: 100,
  },
  exprScroll: { maxHeight: 24 },
  exprText: { fontSize: 15, fontFamily: MONO },
  resultText: { fontSize: 42, fontWeight: '700', fontFamily: MONO, textAlign: 'right', lineHeight: 50 },
  varRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  varHint: { fontSize: 12, fontWeight: '700', fontFamily: MONO },
  varKey: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  varKeyText: { fontSize: 11, fontFamily: MONO },
  keypad: { flex: 1, paddingHorizontal: PAD, gap: GAP },
  row: { flexDirection: 'row', gap: GAP },
  varsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    justifyContent: 'space-around',
  },
  varItem: { alignItems: 'center' },
  varLabel: { fontSize: 9, fontWeight: '700', fontFamily: MONO },
  varVal: { fontSize: 9, fontFamily: MONO },
  histOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  histModal: { height: '65%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  histHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  histTitle: { flex: 1, fontSize: 18, fontWeight: '700', fontFamily: MONO },
  histClose: { padding: 6 },
  histItem: { borderBottomWidth: 1, paddingVertical: 10 },
  histExpr: { fontSize: 13, fontFamily: MONO },
  histResult: { fontSize: 16, fontWeight: '700', fontFamily: MONO },
  emptyText: { textAlign: 'center', marginTop: 40 },
});
