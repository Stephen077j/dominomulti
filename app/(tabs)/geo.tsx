import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SectionTab from '@/components/SectionTab';
import StarField from '@/components/StarField';
import { useColors } from '@/hooks/useColors';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const TABS = ['Triangle', 'Cercle', 'Points', 'Quadrilatère', 'Trigo'];
const PI = Math.PI;

function fmtNum(x: number, prec = 6): string {
  if (!isFinite(x)) return x > 0 ? '+∞' : '-∞';
  if (isNaN(x)) return 'NaN';
  return parseFloat(x.toPrecision(prec)).toString();
}

function NeonInput({ value, onChangeText, placeholder, label }: { value: string; onChangeText: (t: string) => void; placeholder?: string; label?: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1 }}>
      {label && <Text style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 2, fontWeight: '600' }}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '0'}
        placeholderTextColor={colors.mutedForeground}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, color: colors.foreground, fontFamily: MONO, fontSize: 14, backgroundColor: 'rgba(0,10,20,0.7)' }}
      />
    </View>
  );
}

function ResultBox({ lines, color }: { lines: string[]; color?: string }) {
  const colors = useColors();
  const c = color ?? colors.neonGreen;
  return (
    <View style={{ borderWidth: 1, borderColor: c, borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: `${c}08` }}>
      {lines.map((l, i) => <Text key={i} style={{ color: c, fontFamily: MONO, fontSize: 13, lineHeight: 20 }}>{l}</Text>)}
    </View>
  );
}

function CalcBtn({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  const colors = useColors();
  const c = color ?? colors.neonGreen;
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: `${c}1a`, borderWidth: 1, borderColor: c, borderRadius: 8, padding: 12, alignItems: 'center', flex: 1, marginTop: 10 }}>
      <Text style={{ color: c, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function TriangleTab() {
  const [mode, setMode] = useState<'cotes' | 'angle'>('cotes');
  const [a, setA] = useState('3'); const [b, setB] = useState('4'); const [c, setC] = useState('5');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const av = parseFloat(a), bv = parseFloat(b), cv = parseFloat(c);
    if (av + bv <= cv || av + cv <= bv || bv + cv <= av) { setResult(['Impossible: inégalité triangulaire non satisfaite']); return; }
    const s = (av + bv + cv) / 2;
    const area = Math.sqrt(s * (s - av) * (s - bv) * (s - cv));
    const A = Math.acos((bv * bv + cv * cv - av * av) / (2 * bv * cv)) * 180 / PI;
    const B = Math.acos((av * av + cv * cv - bv * bv) / (2 * av * cv)) * 180 / PI;
    const C = 180 - A - B;
    const r = area / s;
    const R = (av * bv * cv) / (4 * area);
    setResult([
      `Côtés: a=${av}, b=${bv}, c=${cv}`,
      `Périmètre = ${fmtNum(av + bv + cv)}`,
      `Aire = ${fmtNum(area)} (Héron)`,
      `Angle A = ${fmtNum(A)}°`,
      `Angle B = ${fmtNum(B)}°`,
      `Angle C = ${fmtNum(C)}°`,
      `Rayon inscrit r = ${fmtNum(r)}`,
      `Rayon circonscrit R = ${fmtNum(R)}`,
      av * av + bv * bv === cv * cv || av * av + cv * cv === bv * bv || bv * bv + cv * cv === av * av ? 'Triangle rectangle' : '',
    ].filter(Boolean));
  }

  return (
    <View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Côtés du triangle</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="a" value={a} onChangeText={setA} />
        <NeonInput label="b" value={b} onChangeText={setB} />
        <NeonInput label="c" value={c} onChangeText={setC} />
      </View>
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function CercleTab() {
  const [input, setInput] = useState('5');
  const [mode, setMode] = useState<'r' | 'd'>('r');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const v = parseFloat(input);
    const r = mode === 'r' ? v : v / 2;
    setResult([
      `${mode === 'r' ? 'Rayon' : 'Diamètre'} = ${fmtNum(v)}`,
      `Diamètre = ${fmtNum(2 * r)}`,
      `Circonférence = ${fmtNum(2 * PI * r)} ≈ ${fmtNum(2 * PI * r)}`,
      `Aire = πr² = ${fmtNum(PI * r * r)}`,
      `Aire secteur (1°) = ${fmtNum(PI * r * r / 360)}`,
    ]);
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {[['r', 'Rayon'], ['d', 'Diamètre']].map(([k, lbl]) => (
          <TouchableOpacity key={k} onPress={() => setMode(k as 'r' | 'd')} style={{ flex: 1, borderWidth: 1, borderColor: mode === k ? colors.neonGreen : colors.border, borderRadius: 8, padding: 8, alignItems: 'center', backgroundColor: mode === k ? 'rgba(0,255,136,0.12)' : 'transparent' }}>
            <Text style={{ color: mode === k ? colors.neonGreen : colors.mutedForeground, fontWeight: '700' }}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NeonInput label={mode === 'r' ? 'Rayon r' : 'Diamètre d'} value={input} onChangeText={setInput} />
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function PointsTab() {
  const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const x1v = parseFloat(x1), y1v = parseFloat(y1), x2v = parseFloat(x2), y2v = parseFloat(y2);
    const dist = Math.sqrt((x2v - x1v) ** 2 + (y2v - y1v) ** 2);
    const midX = (x1v + x2v) / 2, midY = (y1v + y2v) / 2;
    const slope = (y2v - y1v) / (x2v - x1v);
    const angle = Math.atan2(y2v - y1v, x2v - x1v) * 180 / PI;
    setResult([
      `A = (${x1v}, ${y1v}), B = (${x2v}, ${y2v})`,
      `Distance AB = ${fmtNum(dist)}`,
      `Milieu M = (${fmtNum(midX)}, ${fmtNum(midY)})`,
      isFinite(slope) ? `Pente = ${fmtNum(slope)}` : 'Droite verticale',
      isFinite(slope) ? `Équation: y - ${y1v} = ${fmtNum(slope)}(x - ${x1v})` : `x = ${x1v}`,
      `Angle / axe x = ${fmtNum(angle)}°`,
    ]);
  }

  return (
    <View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Point A</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="x₁" value={x1} onChangeText={setX1} />
        <NeonInput label="y₁" value={y1} onChangeText={setY1} />
      </View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 }}>Point B</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="x₂" value={x2} onChangeText={setX2} />
        <NeonInput label="y₂" value={y2} onChangeText={setY2} />
      </View>
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function QuadrilaterTab() {
  const [type, setType] = useState<'rect' | 'trap' | 'loz' | 'para'>('rect');
  const [l, setL] = useState('6'); const [w, setW] = useState('4'); const [h, setH] = useState('4');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  const TYPES = [['rect', 'Rectangle'], ['trap', 'Trapèze'], ['loz', 'Losange'], ['para', 'Parallél.']];

  function compute() {
    const lv = parseFloat(l), wv = parseFloat(w), hv = parseFloat(h);
    switch (type) {
      case 'rect': setResult([`Rectangle ${lv}×${wv}`, `Périmètre = ${fmtNum(2 * (lv + wv))}`, `Aire = ${fmtNum(lv * wv)}`, `Diagonale = ${fmtNum(Math.sqrt(lv * lv + wv * wv))}`]); break;
      case 'trap': setResult([`Trapèze: b₁=${lv}, b₂=${wv}, h=${hv}`, `Aire = ${fmtNum((lv + wv) * hv / 2)}`, `Milieu = ${fmtNum((lv + wv) / 2)}`]); break;
      case 'loz': setResult([`Losange: côté=${lv}, diag1=${wv}, diag2=${hv}`, `Périmètre = ${fmtNum(4 * lv)}`, `Aire = ${fmtNum(wv * hv / 2)}`]); break;
      case 'para': setResult([`Parallélogramme: base=${lv}, h=${hv}`, `Aire = ${fmtNum(lv * hv)}`]); break;
    }
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {TYPES.map(([k, lbl]) => (
          <TouchableOpacity key={k} onPress={() => setType(k as typeof type)} style={{ borderWidth: 1, borderColor: type === k ? colors.neonGreen : colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: type === k ? 'rgba(0,255,136,0.12)' : 'transparent' }}>
            <Text style={{ color: type === k ? colors.neonGreen : colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label={type === 'rect' ? 'Longueur' : type === 'trap' ? 'Base₁' : type === 'loz' ? 'Côté' : 'Base'} value={l} onChangeText={setL} />
        <NeonInput label={type === 'rect' ? 'Largeur' : type === 'trap' ? 'Base₂' : type === 'loz' ? 'Diag₁' : 'Largeur'} value={w} onChangeText={setW} />
        {['trap', 'loz', 'para'].includes(type) && <NeonInput label="Hauteur/D₂" value={h} onChangeText={setH} />}
      </View>
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function TrigoTab() {
  const [angle, setAngle] = useState('30');
  const [unit, setUnit] = useState<'deg' | 'rad'>('deg');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const v = parseFloat(angle);
    const r = unit === 'deg' ? v * PI / 180 : v;
    const d = unit === 'rad' ? v * 180 / PI : v;
    setResult([
      `Angle: ${fmtNum(v)} ${unit === 'deg' ? '°' : 'rad'} = ${fmtNum(d)}° = ${fmtNum(r)} rad`,
      `sin = ${fmtNum(Math.sin(r))}`,
      `cos = ${fmtNum(Math.cos(r))}`,
      `tan = ${Math.abs(Math.cos(r)) > 1e-10 ? fmtNum(Math.tan(r)) : '±∞'}`,
      `cot = ${Math.abs(Math.sin(r)) > 1e-10 ? fmtNum(1 / Math.tan(r)) : '±∞'}`,
      `sec = ${Math.abs(Math.cos(r)) > 1e-10 ? fmtNum(1 / Math.cos(r)) : '±∞'}`,
      `csc = ${Math.abs(Math.sin(r)) > 1e-10 ? fmtNum(1 / Math.sin(r)) : '±∞'}`,
      `sin²+ cos² = ${fmtNum(Math.sin(r) ** 2 + Math.cos(r) ** 2)}`,
    ]);
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        {[['deg', 'Degrés'], ['rad', 'Radians']].map(([k, lbl]) => (
          <TouchableOpacity key={k} onPress={() => setUnit(k as 'deg' | 'rad')} style={{ flex: 1, borderWidth: 1, borderColor: unit === k ? colors.neonGreen : colors.border, borderRadius: 8, padding: 8, alignItems: 'center', backgroundColor: unit === k ? 'rgba(0,255,136,0.12)' : 'transparent' }}>
            <Text style={{ color: unit === k ? colors.neonGreen : colors.mutedForeground, fontWeight: '700' }}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NeonInput label={`Angle (${unit === 'deg' ? '°' : 'rad'})`} value={angle} onChangeText={setAngle} />
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

export default function GeoScreen() {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const CONTENT = [TriangleTab, CercleTab, PointsTab, QuadrilaterTab, TrigoTab];
  const C = CONTENT[tab];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f', paddingTop: topPad }}>
      <StarField />
      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', fontFamily: MONO, color: colors.neonGreen }}>Géométrie</Text>
      </View>
      <SectionTab tabs={TABS} selected={tab} onSelect={setTab} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 34 : 80 }}>
        <C />
      </ScrollView>
    </View>
  );
}
