import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SectionTab from '@/components/SectionTab';
import StarField from '@/components/StarField';
import { useColors } from '@/hooks/useColors';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const TABS = ['Bases', 'Fractions', 'Unités', 'Constantes', 'PGCD/PPCM'];

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function simplify(n: number, d: number): [number, number] {
  const g = gcd(n, d);
  return [n / g, d / g];
}

function NeonInput({ value, onChangeText, placeholder, label, style }: { value: string; onChangeText: (t: string) => void; placeholder?: string; label?: string; style?: object }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1 }}>
      {label && <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '0'}
        placeholderTextColor={colors.mutedForeground}
        style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, color: colors.foreground, fontFamily: MONO, fontSize: 14, backgroundColor: 'rgba(0,10,20,0.7)' }, style]}
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
  const c = color ?? colors.neonOrange;
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: `${c}1a`, borderWidth: 1, borderColor: c, borderRadius: 8, padding: 12, alignItems: 'center', flex: 1, marginTop: 10 }}>
      <Text style={{ color: c, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function BasesTab() {
  const [input, setInput] = useState('255');
  const [srcBase, setSrcBase] = useState<10 | 2 | 8 | 16>(10);
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();
  const BASES = [['10', 10], ['2', 2], ['8', 8], ['16', 16]] as const;

  function convert() {
    try {
      const dec = parseInt(input, srcBase);
      if (isNaN(dec)) { setResult(['Valeur invalide pour la base ' + srcBase]); return; }
      setResult([
        `Décimal (base 10): ${dec}`,
        `Binaire (base 2): ${dec.toString(2)}`,
        `Octal (base 8): ${dec.toString(8)}`,
        `Hexadécimal (base 16): ${dec.toString(16).toUpperCase()}`,
        `Base 32: ${dec.toString(32).toUpperCase()}`,
      ]);
    } catch (e) { setResult([`Erreur: ${String(e)}`]); }
  }

  return (
    <View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Base source</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
        {BASES.map(([lbl, b]) => (
          <TouchableOpacity key={b} onPress={() => setSrcBase(b)} style={{ flex: 1, borderWidth: 1, borderColor: srcBase === b ? colors.neonOrange : colors.border, borderRadius: 8, padding: 8, alignItems: 'center', backgroundColor: srcBase === b ? 'rgba(255,107,0,0.12)' : 'transparent' }}>
            <Text style={{ color: srcBase === b ? colors.neonOrange : colors.mutedForeground, fontWeight: '700' }}>Base {lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NeonInput value={input} onChangeText={setInput} placeholder="Valeur" label="Valeur à convertir" />
      <CalcBtn label="Convertir" onPress={convert} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function FractionsTab() {
  const [n1, setN1] = useState('3'); const [d1, setD1] = useState('4');
  const [n2, setN2] = useState('2'); const [d2, setD2] = useState('5');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const a = parseInt(n1), b = parseInt(d1), c = parseInt(n2), d = parseInt(d2);
    if (b === 0 || d === 0) { setResult(['Le dénominateur ne peut pas être 0']); return; }
    const addN = a * d + c * b, addD = b * d;
    const subN = a * d - c * b, subD = b * d;
    const mulN = a * c, mulD = b * d;
    const divN = a * d, divD = b * c;
    function fmt(n: number, d: number): string {
      if (d === 0) return 'Impossible';
      const [sn, sd] = simplify(n, d);
      const sign = (sn < 0) !== (sd < 0) ? '-' : '';
      return `${Math.abs(sn)}/${Math.abs(sd)}${sn === sd ? ' = 1' : sd === 1 ? ` = ${sn}` : ` ≈ ${(sn/sd).toFixed(6)}`}`;
    }
    const [sn1, sd1] = simplify(a, b); const [sn2, sd2] = simplify(c, d);
    setResult([
      `${a}/${b} = ${sn1}/${sd1}  (simplifiée)`,
      `${c}/${d} = ${sn2}/${sd2}  (simplifiée)`,
      `Addition: ${a}/${b} + ${c}/${d} = ${fmt(addN, addD)}`,
      `Soustraction: ${a}/${b} - ${c}/${d} = ${fmt(subN, subD)}`,
      `Multiplication: ${a}/${b} × ${c}/${d} = ${fmt(mulN, mulD)}`,
      d2 !== '0' && d !== 0 && c !== 0 ? `Division: ${a}/${b} ÷ ${c}/${d} = ${fmt(divN, divD)}` : 'Division: impossible',
    ]);
  }

  return (
    <View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Fraction 1</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <NeonInput label="Numér." value={n1} onChangeText={setN1} />
        <Text style={{ color: colors.foreground, fontSize: 20, marginTop: 16 }}>/</Text>
        <NeonInput label="Dénominat." value={d1} onChangeText={setD1} />
      </View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 4 }}>Fraction 2</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <NeonInput label="Numér." value={n2} onChangeText={setN2} />
        <Text style={{ color: colors.foreground, fontSize: 20, marginTop: 16 }}>/</Text>
        <NeonInput label="Dénominat." value={d2} onChangeText={setD2} />
      </View>
      <CalcBtn label="Calculer" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

const UNITS_DATA = {
  'Longueur': { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, inch: 0.0254, yd: 0.9144 },
  'Masse': { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.453592, oz: 0.0283495 },
  'Volume': { L: 1, mL: 0.001, m3: 1000, cm3: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176 },
  'Vitesse': { 'km/h': 1, 'm/s': 3.6, mph: 1.60934, knot: 1.852 },
  'Température': { C: 0, F: 0, K: 0 },
  'Énergie': { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, kWh: 3600000 },
} as const;

type UnitCategory = keyof typeof UNITS_DATA;

function UnitsTab() {
  const [cat, setCat] = useState<UnitCategory>('Longueur');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function convert() {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(['Valeur invalide']); return; }

    if (cat === 'Température') {
      const lines: string[] = [];
      let celsius: number;
      if (fromUnit === 'C') celsius = v;
      else if (fromUnit === 'F') celsius = (v - 32) / 1.8;
      else celsius = v - 273.15;
      lines.push(`${v} ${fromUnit} =`);
      lines.push(`  ${celsius.toFixed(4)} °C`);
      lines.push(`  ${(celsius * 1.8 + 32).toFixed(4)} °F`);
      lines.push(`  ${(celsius + 273.15).toFixed(4)} K`);
      setResult(lines);
      return;
    }

    const units = UNITS_DATA[cat] as Record<string, number>;
    const baseVal = v * (units[fromUnit] ?? 1);
    const lines = [`${v} ${fromUnit} =`];
    Object.entries(units).forEach(([u, factor]) => {
      if (u !== fromUnit) lines.push(`  ${(baseVal / factor).toFixed(6)} ${u}`);
    });
    setResult(lines);
  }

  const units = Object.keys(UNITS_DATA[cat]);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Object.keys(UNITS_DATA).map(c => (
            <TouchableOpacity key={c} onPress={() => { setCat(c as UnitCategory); setFromUnit(Object.keys(UNITS_DATA[c as UnitCategory])[0]); setResult([]); }} style={{ borderWidth: 1, borderColor: cat === c ? colors.neonOrange : colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: cat === c ? 'rgba(255,107,0,0.12)' : 'transparent' }}>
              <Text style={{ color: cat === c ? colors.neonOrange : colors.mutedForeground, fontWeight: '700', fontSize: 12 }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <NeonInput value={value} onChangeText={setValue} placeholder="1" label="Valeur" />
      <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', marginTop: 8, marginBottom: 4 }}>Unité source</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {units.map(u => (
            <TouchableOpacity key={u} onPress={() => setFromUnit(u)} style={{ borderWidth: 1, borderColor: fromUnit === u ? colors.neonCyan : colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: fromUnit === u ? 'rgba(0,245,255,0.12)' : 'transparent' }}>
              <Text style={{ color: fromUnit === u ? colors.neonCyan : colors.mutedForeground, fontWeight: '600', fontSize: 13 }}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <CalcBtn label="Convertir" onPress={convert} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

const CONSTANTS = [
  ['c', '299 792 458 m/s', 'Vitesse de la lumière'],
  ['g', '9.80665 m/s²', 'Accélération gravitationnelle'],
  ['G', '6.674×10⁻¹¹ N·m²/kg²', 'Constante gravitationnelle'],
  ['h', '6.626×10⁻³⁴ J·s', 'Constante de Planck'],
  ['NA', '6.022×10²³ mol⁻¹', 'Nombre d\'Avogadro'],
  ['R', '8.314 J/(mol·K)', 'Constante des gaz'],
  ['k_B', '1.381×10⁻²³ J/K', 'Constante de Boltzmann'],
  ['e', '1.602×10⁻¹⁹ C', 'Charge de l\'électron'],
  ['m_e', '9.109×10⁻³¹ kg', 'Masse de l\'électron'],
  ['ε₀', '8.854×10⁻¹² F/m', 'Permittivité du vide'],
  ['μ₀', '4π×10⁻⁷ H/m', 'Perméabilité du vide'],
  ['π', '3.14159265358979...', 'Pi'],
  ['e', '2.71828182845904...', 'Nombre d\'Euler'],
  ['φ', '1.61803398874989...', 'Nombre d\'or'],
];

function ConstantesTab() {
  const colors = useColors();
  return (
    <View>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Constantes physiques et mathématiques</Text>
      {CONSTANTS.map(([sym, val, name]) => (
        <View key={`${sym}${val}`} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, marginBottom: 6, backgroundColor: 'rgba(0,10,20,0.6)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.neonOrange, fontFamily: MONO, fontSize: 14, fontWeight: '700', width: 40 }}>{sym}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: MONO, fontSize: 13 }}>{val}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>{name}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function PgcdTab() {
  const [a, setA] = useState('48');
  const [b, setB] = useState('36');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    const av = Math.abs(parseInt(a)), bv = Math.abs(parseInt(b));
    if (isNaN(av) || isNaN(bv)) { setResult(['Valeurs invalides']); return; }
    const g = gcd(av, bv);
    const ppcm = (av * bv) / g;
    // Factorisation
    function factors(n: number): Record<number, number> {
      const f: Record<number, number> = {};
      let d = 2;
      while (n > 1) {
        while (n % d === 0) { f[d] = (f[d] ?? 0) + 1; n /= d; }
        d++;
        if (d * d > n && n > 1) { f[n] = (f[n] ?? 0) + 1; break; }
      }
      return f;
    }
    const fa = factors(av), fb = factors(bv);
    const fmtFactors = (f: Record<number, number>) => Object.entries(f).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ') || '1';
    setResult([
      `a = ${av} = ${fmtFactors(fa)}`,
      `b = ${bv} = ${fmtFactors(fb)}`,
      `PGCD(${av}, ${bv}) = ${g}`,
      `PPCM(${av}, ${bv}) = ${ppcm}`,
      `Vérification: PGCD × PPCM = ${g * ppcm} = ${av} × ${bv} = ${av * bv}`,
      `${av} et ${bv} sont ${g === 1 ? 'premiers entre eux' : 'non premiers entre eux'}`,
    ]);
  }

  // Check if prime
  function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <NeonInput label="a" value={a} onChangeText={setA} />
        <NeonInput label="b" value={b} onChangeText={setB} />
      </View>
      <CalcBtn label="Calculer PGCD / PPCM" onPress={compute} />
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

export default function OutilsScreen() {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const CONTENT = [BasesTab, FractionsTab, UnitsTab, ConstantesTab, PgcdTab];
  const C = CONTENT[tab];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f', paddingTop: topPad }}>
      <StarField />
      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', fontFamily: MONO, color: colors.neonOrange }}>Outils</Text>
      </View>
      <SectionTab tabs={TABS} selected={tab} onSelect={setTab} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 34 : 80 }}>
        <C />
      </ScrollView>
    </View>
  );
}
