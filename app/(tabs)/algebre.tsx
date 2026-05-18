import { create, all } from 'mathjs';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SectionTab from '@/components/SectionTab';
import StarField from '@/components/StarField';
import { useColors } from '@/hooks/useColors';

const math = create(all);
const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const TABS = ['Équation 2°', 'Système', 'Matrice', 'Complexes', 'Vecteurs'];

function fmtNum(x: number, prec = 6): string {
  if (!isFinite(x)) return x > 0 ? '+∞' : '-∞';
  if (isNaN(x)) return 'NaN';
  return parseFloat(x.toPrecision(prec)).toString();
}

function NeonInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  const colors = useColors();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      keyboardType="default"
      style={{
        borderWidth: 1, borderColor: colors.border, borderRadius: 8,
        padding: 10, color: colors.foreground, fontFamily: MONO,
        fontSize: 14, backgroundColor: 'rgba(0,10,20,0.7)', marginTop: 4,
      }}
    />
  );
}

function ResultBox({ lines, color }: { lines: string[]; color?: string }) {
  const colors = useColors();
  const c = color ?? colors.neonCyan;
  return (
    <View style={{ borderWidth: 1, borderColor: c, borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: 'rgba(0,245,255,0.04)' }}>
      {lines.map((l, i) => <Text key={i} style={{ color: c, fontFamily: MONO, fontSize: 13, lineHeight: 20 }}>{l}</Text>)}
    </View>
  );
}

function CalcBtn({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  const colors = useColors();
  const c = color ?? colors.neonCyan;
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: `${c}22`, borderWidth: 1, borderColor: c, borderRadius: 8, padding: 12, alignItems: 'center', flex: 1, marginTop: 10 }}>
      <Text style={{ color: c, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Eq2Tab() {
  const [a, setA] = useState('1'); const [b, setB] = useState('-5'); const [c, setC] = useState('6');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function solve() {
    const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c);
    if (av === 0) { setResult(['Erreur: a ne peut pas être 0']); return; }
    const D = bv * bv - 4 * av * cv;
    const lines: string[] = [
      `${av}x² + ${bv}x + ${cv} = 0`,
      `Discriminant Δ = ${fmtNum(D)}`,
      `Somme des racines = ${fmtNum(-bv / av)}`,
      `Produit des racines = ${fmtNum(cv / av)}`,
    ];
    if (D > 0) {
      const x1 = (-bv + Math.sqrt(D)) / (2 * av);
      const x2 = (-bv - Math.sqrt(D)) / (2 * av);
      lines.push(`Δ > 0 → 2 racines réelles`);
      lines.push(`x₁ = ${fmtNum(x1)}`);
      lines.push(`x₂ = ${fmtNum(x2)}`);
    } else if (D === 0) {
      lines.push(`Δ = 0 → racine double`);
      lines.push(`x₀ = ${fmtNum(-bv / (2 * av))}`);
    } else {
      const re = -bv / (2 * av);
      const im = Math.sqrt(-D) / (2 * av);
      lines.push(`Δ < 0 → 2 racines complexes`);
      lines.push(`x₁ = ${fmtNum(re)} + ${fmtNum(im)}i`);
      lines.push(`x₂ = ${fmtNum(re)} - ${fmtNum(im)}i`);
    }
    setResult(lines);
  }

  return (
    <View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>ax² + bx + c = 0</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[['a', a, setA], ['b', b, setB], ['c', c, setC]].map(([lbl, val, setter]) => (
          <View key={String(lbl)} style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{String(lbl)}</Text>
            <NeonInput value={String(val)} onChangeText={setter as (t: string) => void} placeholder="0" />
          </View>
        ))}
      </View>
      <CalcBtn label="Résoudre" onPress={solve} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function SystemeTab() {
  const [a1, setA1] = useState('2'); const [b1, setB1] = useState('1'); const [c1, setC1] = useState('5');
  const [a2, setA2] = useState('1'); const [b2, setB2] = useState('-1'); const [c2, setC2] = useState('1');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function solve() {
    const a1v = parseFloat(a1), b1v = parseFloat(b1), c1v = parseFloat(c1);
    const a2v = parseFloat(a2), b2v = parseFloat(b2), c2v = parseFloat(c2);
    const D = a1v * b2v - a2v * b1v;
    if (Math.abs(D) < 1e-12) {
      setResult([`Système indéterminé ou sans solution (D = 0)`]);
      return;
    }
    const x = (c1v * b2v - c2v * b1v) / D;
    const y = (a1v * c2v - a2v * c1v) / D;
    setResult([
      `${a1}x + ${b1}y = ${c1}`,
      `${a2}x + ${b2}y = ${c2}`,
      `Déterminant D = ${fmtNum(D)}`,
      `x = ${fmtNum(x, 8)}`,
      `y = ${fmtNum(y, 8)}`,
    ]);
  }

  return (
    <View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Équation 1: ax + by = c</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[['a₁', a1, setA1], ['b₁', b1, setB1], ['c₁', c1, setC1]].map(([lbl, val, setter]) => (
          <View key={String(lbl)} style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{String(lbl)}</Text>
            <NeonInput value={String(val)} onChangeText={setter as (t: string) => void} placeholder="0" />
          </View>
        ))}
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 8 }]}>Équation 2:</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[['a₂', a2, setA2], ['b₂', b2, setB2], ['c₂', c2, setC2]].map(([lbl, val, setter]) => (
          <View key={String(lbl)} style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{String(lbl)}</Text>
            <NeonInput value={String(val)} onChangeText={setter as (t: string) => void} placeholder="0" />
          </View>
        ))}
      </View>
      <CalcBtn label="Résoudre (Cramer)" onPress={solve} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function MatriceTab() {
  const [size, setSize] = useState<2 | 3>(2);
  const [matA, setMatA] = useState([['1','2'],['3','4']]);
  const [matB, setMatB] = useState([['5','6'],['7','8']]);
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function setSize2(s: 2 | 3) {
    setSize(s);
    if (s === 2) { setMatA([['1','0'],['0','1']]); setMatB([['1','0'],['0','1']]); }
    else { setMatA([['1','0','0'],['0','1','0'],['0','0','1']]); setMatB([['1','0','0'],['0','1','0'],['0','0','1']]); }
  }

  function updateCell(mat: string[][], row: number, col: number, val: string, setter: (m: string[][]) => void) {
    const newMat = mat.map(r => [...r]);
    newMat[row][col] = val;
    setter(newMat);
  }

  function toNumMat(m: string[][]): number[][] { return m.map(r => r.map(Number)); }

  function det2(m: number[][]): number { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }
  function det3(m: number[][]): number {
    return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  }

  function multiply() {
    const A = toNumMat(matA), B = toNumMat(matB);
    const n = size;
    const C: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) C[i][j] += A[i][k] * B[k][j];
    const lines = ['A × B ='];
    C.forEach(row => lines.push('[' + row.map(x => fmtNum(x, 5).padStart(8)).join('  ') + ' ]'));
    const dA = n === 2 ? det2(A) : det3(A);
    const dB = n === 2 ? det2(B) : det3(B);
    lines.push(`det(A) = ${fmtNum(dA, 6)}`);
    lines.push(`det(B) = ${fmtNum(dB, 6)}`);
    lines.push(`det(A×B) = ${fmtNum(dA * dB, 6)}`);
    setResult(lines);
  }

  function computeDet() {
    const A = toNumMat(matA);
    const d = size === 2 ? det2(A) : det3(A);
    setResult([`det(A) = ${fmtNum(d, 8)}`, d !== 0 ? 'Matrice inversible' : 'Matrice singulière (non inversible)']);
  }

  const renderMat = (mat: string[][], setter: (m: string[][]) => void, label: string) => (
    <View style={{ marginBottom: 8 }}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Matrice {label}</Text>
      {mat.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
          {row.map((val, ci) => (
            <TextInput
              key={ci}
              value={val}
              onChangeText={t => updateCell(mat, ri, ci, t, setter)}
              keyboardType="numeric"
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, color: colors.foreground, fontFamily: MONO, fontSize: 14, textAlign: 'center', backgroundColor: 'rgba(0,10,20,0.7)' }}
            />
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {([2, 3] as const).map(s => (
          <TouchableOpacity key={s} onPress={() => setSize2(s)} style={{ flex: 1, borderWidth: 1, borderColor: size === s ? colors.neonCyan : colors.border, borderRadius: 8, padding: 8, alignItems: 'center', backgroundColor: size === s ? 'rgba(0,245,255,0.12)' : 'transparent' }}>
            <Text style={{ color: size === s ? colors.neonCyan : colors.mutedForeground, fontWeight: '700' }}>{s}×{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderMat(matA, setMatA, 'A')}
      {renderMat(matB, setMatB, 'B')}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <CalcBtn label="A×B" onPress={multiply} />
        <CalcBtn label="det(A)" onPress={computeDet} color={colors.neonMagenta} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function ComplexesTab() {
  const [a1, setA1] = useState('3'); const [b1, setB1] = useState('4');
  const [a2, setA2] = useState('1'); const [b2, setB2] = useState('2');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const r1 = parseFloat(a1), i1 = parseFloat(b1), r2 = parseFloat(a2), i2 = parseFloat(b2);
    const z1 = `${r1} + ${i1}i`, z2 = `${r2} + ${i2}i`;
    const addR = r1 + r2, addI = i1 + i2;
    const subR = r1 - r2, subI = i1 - i2;
    const mulR = r1 * r2 - i1 * i2, mulI = r1 * i2 + i1 * r2;
    const denom = r2 * r2 + i2 * i2;
    const divR = (r1 * r2 + i1 * i2) / denom, divI = (i1 * r2 - r1 * i2) / denom;
    const mod1 = Math.sqrt(r1 * r1 + i1 * i1), mod2 = Math.sqrt(r2 * r2 + i2 * i2);
    const arg1 = Math.atan2(i1, r1) * 180 / Math.PI;
    const lines = [
      `z₁ = ${z1}   |z₁| = ${fmtNum(mod1)}   arg = ${fmtNum(arg1)}°`,
      `z₂ = ${z2}   |z₂| = ${fmtNum(mod2)}`,
      `z₁ + z₂ = ${fmtNum(addR)} + ${fmtNum(addI)}i`,
      `z₁ - z₂ = ${fmtNum(subR)} + ${fmtNum(subI)}i`,
      `z₁ × z₂ = ${fmtNum(mulR)} + ${fmtNum(mulI)}i`,
      denom !== 0 ? `z₁ ÷ z₂ = ${fmtNum(divR)} + ${fmtNum(divI)}i` : 'z₁ ÷ z₂: division par zéro',
      `z̄₁ = ${r1} - ${i1}i`,
    ];
    setResult(lines);
  }

  return (
    <View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>z₁ = a + bi</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>a₁</Text>
          <NeonInput value={a1} onChangeText={setA1} placeholder="0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>b₁</Text>
          <NeonInput value={b1} onChangeText={setB1} placeholder="0" />
        </View>
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 8 }]}>z₂ = a + bi</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>a₂</Text>
          <NeonInput value={a2} onChangeText={setA2} placeholder="0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>b₂</Text>
          <NeonInput value={b2} onChangeText={setB2} placeholder="0" />
        </View>
      </View>
      <CalcBtn label="Calculer" onPress={compute} color={colors.neonViolet} />
      {result.length > 0 && <ResultBox lines={result} color={colors.neonViolet} />}
    </View>
  );
}

function VecteursTab() {
  const [ax, setAx] = useState('1'); const [ay, setAy] = useState('2'); const [az, setAz] = useState('3');
  const [bx, setBx] = useState('4'); const [by, setBy] = useState('5'); const [bz, setBz] = useState('6');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const a = [parseFloat(ax), parseFloat(ay), parseFloat(az)];
    const b = [parseFloat(bx), parseFloat(by), parseFloat(bz)];
    const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const normA = Math.sqrt(a.reduce((s, v) => s + v*v, 0));
    const normB = Math.sqrt(b.reduce((s, v) => s + v*v, 0));
    const cross = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const angle = Math.acos(dot / (normA * normB)) * 180 / Math.PI;
    const lines = [
      `A = (${a.join(', ')})   |A| = ${fmtNum(normA)}`,
      `B = (${b.join(', ')})   |B| = ${fmtNum(normB)}`,
      `A + B = (${a.map((v, i) => fmtNum(v + b[i])).join(', ')})`,
      `A - B = (${a.map((v, i) => fmtNum(v - b[i])).join(', ')})`,
      `A · B = ${fmtNum(dot)}`,
      `A × B = (${cross.map(v => fmtNum(v)).join(', ')})`,
      `Angle = ${fmtNum(angle)}°`,
    ];
    setResult(lines);
  }

  return (
    <View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Vecteur A (x, y, z)</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[['x', ax, setAx], ['y', ay, setAy], ['z', az, setAz]].map(([l, v, s]) => (
          <View key={String(l)} style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{String(l)}</Text>
            <NeonInput value={String(v)} onChangeText={s as (t: string) => void} placeholder="0" />
          </View>
        ))}
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 8 }]}>Vecteur B (x, y, z)</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[['x', bx, setBx], ['y', by, setBy], ['z', bz, setBz]].map(([l, v, s]) => (
          <View key={String(l)} style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{String(l)}</Text>
            <NeonInput value={String(v)} onChangeText={s as (t: string) => void} placeholder="0" />
          </View>
        ))}
      </View>
      <CalcBtn label="Calculer" onPress={compute} color={colors.neonGreen} />
      {result.length > 0 && <ResultBox lines={result} color={colors.neonGreen} />}
    </View>
  );
}

export default function AlgebreScreen() {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const CONTENT = [Eq2Tab, SystemeTab, MatriceTab, ComplexesTab, VecteursTab];
  const C = CONTENT[tab];

  return (
    <View style={[{ flex: 1, backgroundColor: '#0a0a0f', paddingTop: topPad }]}>
      <StarField />
      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={[styles.screenTitle, { color: colors.neonMagenta }]}>Algèbre</Text>
      </View>
      <SectionTab tabs={TABS} selected={tab} onSelect={setTab} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 34 : 80 }}>
        <C />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  screenTitle: { fontSize: 22, fontWeight: '800', fontFamily: MONO },
});
