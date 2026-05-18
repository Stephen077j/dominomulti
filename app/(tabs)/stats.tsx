import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SectionTab from '@/components/SectionTab';
import StarField from '@/components/StarField';
import { useColors } from '@/hooks/useColors';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const TABS = ['Descriptive', 'Régression', 'Probas', 'Combin.', 'Loi Normale'];

function fmtNum(x: number, prec = 6): string {
  if (!isFinite(x)) return x > 0 ? '+∞' : '-∞';
  if (isNaN(x)) return 'NaN';
  return parseFloat(x.toPrecision(prec)).toString();
}

function parseData(s: string): number[] {
  return s.trim().split(/[\s,;]+/).map(Number).filter(v => !isNaN(v));
}

function NeonInput({ value, onChangeText, placeholder, multiline, label }: { value: string; onChangeText: (t: string) => void; placeholder?: string; multiline?: boolean; label?: string }) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 4 }}>
      {label && <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.foreground, fontFamily: MONO, fontSize: 13, backgroundColor: 'rgba(0,10,20,0.7)', minHeight: multiline ? 72 : undefined }}
      />
    </View>
  );
}

function ResultBox({ lines, color }: { lines: string[]; color?: string }) {
  const colors = useColors();
  const c = color ?? colors.neonCyan;
  return (
    <View style={{ borderWidth: 1, borderColor: c, borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: `${c}08` }}>
      {lines.map((l, i) => <Text key={i} style={{ color: c, fontFamily: MONO, fontSize: 13, lineHeight: 20 }}>{l}</Text>)}
    </View>
  );
}

function CalcBtn({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  const colors = useColors();
  const c = color ?? colors.neonCyan;
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: `${c}1a`, borderWidth: 1, borderColor: c, borderRadius: 8, padding: 12, alignItems: 'center', flex: 1, marginTop: 10 }}>
      <Text style={{ color: c, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function DescriptiveTab() {
  const [data, setData] = useState('3 7 2 9 4 1 8 5 6 10');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const d = parseData(data);
    if (d.length < 2) { setResult(['Entrez au moins 2 valeurs']); return; }
    d.sort((a, b) => a - b);
    const n = d.length;
    const mean = d.reduce((s, v) => s + v, 0) / n;
    const variance = d.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const varUnbiased = d.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(variance);
    const stdUnbiased = Math.sqrt(varUnbiased);
    const median = n % 2 === 0 ? (d[n / 2 - 1] + d[n / 2]) / 2 : d[Math.floor(n / 2)];
    const q1 = d[Math.floor(n / 4)];
    const q3 = d[Math.floor(3 * n / 4)];
    const iqr = q3 - q1;
    // Mode
    const freq: Record<number, number> = {};
    d.forEach(v => { freq[v] = (freq[v] ?? 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k => freq[Number(k)] === maxFreq).map(Number);
    setResult([
      `n = ${n}`,
      `Données: [${d.join(', ')}]`,
      `Min = ${d[0]}  Max = ${d[n - 1]}`,
      `Étendue = ${fmtNum(d[n - 1] - d[0])}`,
      `Moyenne = ${fmtNum(mean)}`,
      `Médiane = ${fmtNum(median)}`,
      `Q1 = ${fmtNum(q1)}  Q3 = ${fmtNum(q3)}  IQR = ${fmtNum(iqr)}`,
      `Mode: ${modes.join(', ')} (freq. ${maxFreq})`,
      `Variance σ² = ${fmtNum(variance)}`,
      `Écart-type σ = ${fmtNum(std)}`,
      `Var. corrigée s² = ${fmtNum(varUnbiased)}`,
      `Éc.-type corrigé s = ${fmtNum(stdUnbiased)}`,
    ]);
  }

  return (
    <View>
      <NeonInput value={data} onChangeText={setData} placeholder="3 7 2 9 4..." multiline label="Données (séparées par espaces ou virgules)" />
      <CalcBtn label="Analyser" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function RegressionTab() {
  const [xs, setXs] = useState('1 2 3 4 5');
  const [ys, setYs] = useState('2.1 3.9 6.1 7.8 10.2');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const xd = parseData(xs), yd = parseData(ys);
    if (xd.length !== yd.length || xd.length < 2) { setResult(['x et y doivent avoir le même nombre de valeurs (min 2)']); return; }
    const n = xd.length;
    const sx = xd.reduce((s, v) => s + v, 0);
    const sy = yd.reduce((s, v) => s + v, 0);
    const sxy = xd.reduce((s, v, i) => s + v * yd[i], 0);
    const sx2 = xd.reduce((s, v) => s + v * v, 0);
    const sy2 = yd.reduce((s, v) => s + v * v, 0);
    const mx = sx / n, my = sy / n;
    const a = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const b = my - a * mx;
    const ssRes = yd.reduce((s, v, i) => s + (v - (a * xd[i] + b)) ** 2, 0);
    const ssTot = yd.reduce((s, v) => s + (v - my) ** 2, 0);
    const r2 = 1 - ssRes / ssTot;
    const r = Math.sqrt(Math.abs(r2)) * (a >= 0 ? 1 : -1);
    setResult([
      `n = ${n} points`,
      `Droite de régression: y = ${fmtNum(a)}x + ${fmtNum(b)}`,
      `Pente a = ${fmtNum(a)}`,
      `Ordonnée b = ${fmtNum(b)}`,
      `Corrélation r = ${fmtNum(r)}`,
      `Coefficient R² = ${fmtNum(r2)}`,
      Math.abs(r) > 0.9 ? 'Corrélation forte' : Math.abs(r) > 0.7 ? 'Corrélation modérée' : 'Corrélation faible',
    ]);
  }

  return (
    <View>
      <NeonInput value={xs} onChangeText={setXs} label="Valeurs x" />
      <NeonInput value={ys} onChangeText={setYs} label="Valeurs y" />
      <CalcBtn label="Régression linéaire" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function ProbasTab() {
  const [n, setN] = useState('10');
  const [k, setK] = useState('3');
  const [p, setP] = useState('0.5');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function factorial(m: number): number {
    if (m <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= m; i++) r *= i;
    return r;
  }
  function C(nv: number, kv: number): number {
    if (kv > nv) return 0;
    return factorial(nv) / (factorial(kv) * factorial(nv - kv));
  }

  function compute() {
    const nv = parseInt(n), kv = parseInt(k), pv = parseFloat(p);
    if (pv < 0 || pv > 1) { setResult(['p doit être entre 0 et 1']); return; }
    const q = 1 - pv;
    const binProb = C(nv, kv) * Math.pow(pv, kv) * Math.pow(q, nv - kv);
    const cumProb = Array.from({ length: kv + 1 }, (_, i) => C(nv, i) * Math.pow(pv, i) * Math.pow(q, nv - i)).reduce((s, v) => s + v, 0);
    const expMean = nv * pv;
    const expVar = nv * pv * q;
    setResult([
      `Loi Binomiale B(${nv}, ${pv})`,
      `P(X = ${kv}) = C(${nv},${kv}) × ${pv}^${kv} × ${q}^${nv - kv}`,
      `P(X = ${kv}) = ${fmtNum(binProb, 8)}`,
      `P(X ≤ ${kv}) = ${fmtNum(cumProb, 8)}`,
      `E(X) = np = ${fmtNum(expMean)}`,
      `V(X) = npq = ${fmtNum(expVar)}`,
      `σ(X) = ${fmtNum(Math.sqrt(expVar))}`,
    ]);
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="n (essais)" value={n} onChangeText={setN} />
        <NeonInput label="k (succès)" value={k} onChangeText={setK} />
        <NeonInput label="p (prob.)" value={p} onChangeText={setP} />
      </View>
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function CombinTab() {
  const [n, setN] = useState('8');
  const [k, setK] = useState('3');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function factorial(m: number): number {
    if (m < 0 || !Number.isInteger(m)) return NaN;
    if (m > 20) return Infinity;
    let r = 1; for (let i = 2; i <= m; i++) r *= i; return r;
  }

  function compute() {
    const nv = parseInt(n), kv = parseInt(k);
    if (nv < 0 || kv < 0 || kv > nv) { setResult(['Valeurs invalides: 0 ≤ k ≤ n']); return; }
    const fn = factorial(nv), fk = factorial(kv), fnk = factorial(nv - kv);
    const comb = fn / (fk * fnk);
    const perm = fn / fnk;
    const permR = Math.pow(nv, kv);
    const combR = comb;
    setResult([
      `n = ${nv}, k = ${kv}`,
      `n! = ${fmtNum(fn)}`,
      `─── Arrangements ───`,
      `A(n,k) = n!/(n-k)! = ${fmtNum(perm)} (sans répétition)`,
      `Aʳ(n,k) = nᵏ = ${fmtNum(permR)} (avec répétition)`,
      `─── Combinaisons ───`,
      `C(n,k) = n!/(k!(n-k)!) = ${fmtNum(comb)}`,
      `Triangle Pascal C(${nv},${kv}) = ${fmtNum(comb)}`,
    ]);
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="n" value={n} onChangeText={setN} />
        <NeonInput label="k" value={k} onChangeText={setK} />
      </View>
      <CalcBtn label="Calculer" onPress={compute} color={colors.neonMagenta} />
      {result.length > 0 && <ResultBox lines={result} color={colors.neonMagenta} />}
    </View>
  );
}

function LoiNormaleTab() {
  const [mu, setMu] = useState('0');
  const [sigma, setSigma] = useState('1');
  const [x, setX] = useState('1.96');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  // Approximation de l'intégrale de la loi normale
  function phi(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    const p = 1 - pdf * poly;
    return z >= 0 ? p : 1 - p;
  }

  function compute() {
    const muv = parseFloat(mu), sigv = parseFloat(sigma), xv = parseFloat(x);
    if (sigv <= 0) { setResult(['σ doit être positif']); return; }
    const z = (xv - muv) / sigv;
    const cdf = phi(z);
    const pdf = Math.exp(-0.5 * z * z) / (sigv * Math.sqrt(2 * Math.PI));
    setResult([
      `X ~ N(${muv}, ${sigv}²)`,
      `z = (${xv} - ${muv}) / ${sigv} = ${fmtNum(z)}`,
      `P(X ≤ ${xv}) = Φ(z) = ${fmtNum(cdf, 6)}`,
      `P(X ≥ ${xv}) = ${fmtNum(1 - cdf, 6)}`,
      `P(-${Math.abs(xv)} ≤ X ≤ ${Math.abs(xv)}) ≈ ${fmtNum(phi(Math.abs(z)) - phi(-Math.abs(z)), 6)}`,
      `Densité f(${xv}) = ${fmtNum(pdf, 6)}`,
      `Règle 68-95-99.7:`,
      `  P(μ±σ) ≈ 68.27%`,
      `  P(μ±2σ) ≈ 95.45%`,
      `  P(μ±3σ) ≈ 99.73%`,
    ]);
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="μ (moyenne)" value={mu} onChangeText={setMu} />
        <NeonInput label="σ (écart-type)" value={sigma} onChangeText={setSigma} />
        <NeonInput label="x" value={x} onChangeText={setX} />
      </View>
      <CalcBtn label="Calculer" onPress={compute} color={colors.neonViolet} />
      {result.length > 0 && <ResultBox lines={result} color={colors.neonViolet} />}
    </View>
  );
}

export default function StatsScreen() {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const CONTENT = [DescriptiveTab, RegressionTab, ProbasTab, CombinTab, LoiNormaleTab];
  const C = CONTENT[tab];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f', paddingTop: topPad }}>
      <StarField />
      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', fontFamily: MONO, color: colors.neonViolet }}>Statistiques</Text>
      </View>
      <SectionTab tabs={TABS} selected={tab} onSelect={setTab} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 34 : 80 }}>
        <C />
      </ScrollView>
    </View>
  );
}
