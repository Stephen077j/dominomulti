import { LinearGradient } from 'expo-linear-gradient';
import { create, all } from 'mathjs';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SectionTab from '@/components/SectionTab';
import StarField from '@/components/StarField';
import { useColors } from '@/hooks/useColors';

const math = create(all);
const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const TABS = ['Dérivée', 'Intégrale', 'Limite', 'Taylor', 'Valeurs', 'Signe', 'Polynôme'];

function fmtNum(x: number, prec = 6): string {
  if (!isFinite(x)) return x > 0 ? '+∞' : '-∞';
  if (isNaN(x)) return 'NaN';
  return parseFloat(x.toPrecision(prec)).toString();
}

function numericalDerivative(f: (x: number) => number, x: number): number {
  const h = 1e-7;
  return (f(x + h) - f(x - h)) / (2 * h);
}

function simpson(f: (x: number) => number, a: number, b: number, n = 1000): number {
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * sum;
}

function makeF(expr: string, varName = 'x'): (x: number) => number {
  return (val: number) => {
    try {
      const r = math.evaluate(expr, { [varName]: val });
      return typeof r === 'number' ? r : r.toNumber?.() ?? NaN;
    } catch {
      return NaN;
    }
  };
}

function NeonInput({ value, onChangeText, placeholder, style }: { value: string; onChangeText: (t: string) => void; placeholder?: string; style?: object }) {
  const colors = useColors();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      style={[{
        borderWidth: 1, borderColor: colors.border, borderRadius: 8,
        padding: 10, color: colors.foreground, fontFamily: MONO,
        fontSize: 14, backgroundColor: 'rgba(0,10,20,0.7)',
      }, style]}
    />
  );
}

function ResultBox({ lines }: { lines: string[] }) {
  const colors = useColors();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.neonCyan, borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: 'rgba(0,245,255,0.05)' }}>
      {lines.map((l, i) => (
        <Text key={i} style={{ color: colors.neonCyan, fontFamily: MONO, fontSize: 13, lineHeight: 20 }}>{l}</Text>
      ))}
    </View>
  );
}

function CalcBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: 'rgba(0,245,255,0.12)', borderWidth: 1, borderColor: colors.neonCyan, borderRadius: 8, padding: 12, alignItems: 'center', flex: 1 }}>
      <Text style={{ color: colors.neonCyan, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function DeriveeTab() {
  const [expr, setExpr] = useState('x^3 - 2*x + 1');
  const [x0, setX0] = useState('2');
  const [order, setOrder] = useState('1');
  const [result, setResult] = useState<string[]>([]);

  function compute() {
    try {
      const f = makeF(expr);
      const x = parseFloat(x0);
      const ord = parseInt(order) || 1;
      const lines: string[] = [];
      lines.push(`f(x) = ${expr}`);

      // Symbolic derivative using mathjs
      try {
        let node: { toString: () => string } = math.parse(expr);
        for (let i = 0; i < ord; i++) {
          node = math.derivative(node.toString(), 'x');
        }
        lines.push(`f${"'".repeat(ord)}(x) = ${node.toString()}`);
        const fDeriv = makeF(node.toString());
        lines.push(`f${"'".repeat(ord)}(${x0}) = ${fmtNum(fDeriv(x))}`);
      } catch {
        // Fallback to numerical
        let df = f;
        for (let i = 0; i < ord; i++) {
          const prevF = df;
          df = (xv: number) => numericalDerivative(prevF, xv);
        }
        lines.push(`f${"'".repeat(ord)}(${x0}) ≈ ${fmtNum(df(x))} (numérique)`);
      }

      // Tangent line
      if (ord === 1) {
        const fx = f(x);
        const fpx = numericalDerivative(f, x);
        lines.push(`Tangente en x=${x0}: y = ${fmtNum(fpx)}(x - ${x0}) + ${fmtNum(fx)}`);
      }
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  const colors = useColors();
  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Fonction f(x)</Text>
      <NeonInput value={expr} onChangeText={setExpr} placeholder="x^2 + 3*x" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>x₀</Text>
          <NeonInput value={x0} onChangeText={setX0} placeholder="0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Ordre</Text>
          <NeonInput value={order} onChangeText={setOrder} placeholder="1" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Calculer" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function IntegraleTab() {
  const [expr, setExpr] = useState('x^2');
  const [a, setA] = useState('0');
  const [b, setB] = useState('3');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    try {
      const f = makeF(expr);
      const av = parseFloat(a), bv = parseFloat(b);
      if (isNaN(av) || isNaN(bv)) { setResult(['Erreur: bornes invalides']); return; }
      const I = simpson(f, av, bv);
      const lines = [
        `∫[${a}, ${b}] ${expr} dx`,
        `≈ ${fmtNum(I, 10)}`,
        `(méthode: Simpson, n=1000)`,
      ];
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>f(x)</Text>
      <NeonInput value={expr} onChangeText={setExpr} placeholder="x^2" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Borne a</Text>
          <NeonInput value={a} onChangeText={setA} placeholder="0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Borne b</Text>
          <NeonInput value={b} onChangeText={setB} placeholder="1" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Calculer" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function LimiteTab() {
  const [expr, setExpr] = useState('sin(x)/x');
  const [x0, setX0] = useState('0');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    try {
      const f = makeF(expr);
      const xv = parseFloat(x0);
      const eps = 1e-8;
      const left = f(xv - eps);
      const right = f(xv + eps);
      const avg = (left + right) / 2;
      const lines = [
        `lim_{x→${x0}} ${expr}`,
        `Limite gauche: ${fmtNum(left)}`,
        `Limite droite: ${fmtNum(right)}`,
      ];
      if (Math.abs(left - right) < 1e-5) {
        lines.push(`Limite = ${fmtNum(avg, 10)}`);
      } else {
        lines.push(`La limite n'existe pas (gauche ≠ droite)`);
      }
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>f(x)</Text>
      <NeonInput value={expr} onChangeText={setExpr} placeholder="sin(x)/x" />
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>x → ?</Text>
        <NeonInput value={x0} onChangeText={setX0} placeholder="0" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Calculer" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function TaylorTab() {
  const [expr, setExpr] = useState('sin(x)');
  const [x0, setX0] = useState('0');
  const [order, setOrder] = useState('5');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    try {
      const f = makeF(expr);
      const xv = parseFloat(x0) || 0;
      const n = Math.min(parseInt(order) || 5, 8);
      const lines = [`Série de Taylor de ${expr} en x=${x0}:`];
      let terms: string[] = [];
      let fDeriv = f;
      let factorial = 1;

      for (let i = 0; i <= n; i++) {
        if (i > 0) {
          const prevF = fDeriv;
          fDeriv = (xv2: number) => numericalDerivative(prevF, xv2);
          factorial *= i;
        }
        const coeff = fDeriv(xv) / factorial;
        if (Math.abs(coeff) > 1e-10) {
          if (i === 0) terms.push(fmtNum(coeff, 5));
          else if (i === 1) terms.push(`${fmtNum(coeff, 5)}(x-${x0})`);
          else terms.push(`${fmtNum(coeff, 5)}(x-${x0})^${i}`);
        }
      }
      lines.push(`P(x) = ${terms.join(' + ') || '0'}`);
      lines.push(`(Ordre ${n}, approx. numérique)`);
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>f(x)</Text>
      <NeonInput value={expr} onChangeText={setExpr} placeholder="sin(x)" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>x₀</Text>
          <NeonInput value={x0} onChangeText={setX0} placeholder="0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Ordre</Text>
          <NeonInput value={order} onChangeText={setOrder} placeholder="5" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Calculer" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function ValeursTab() {
  const [expr, setExpr] = useState('x^2 - 1');
  const [from, setFrom] = useState('-3');
  const [to, setTo] = useState('3');
  const [step, setStep] = useState('1');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    try {
      const f = makeF(expr);
      const a = parseFloat(from), b = parseFloat(to), s = parseFloat(step) || 1;
      const lines = [`  x       | f(x)`];
      lines.push(`----------|----------`);
      for (let x = a; x <= b + 1e-9; x += s) {
        const fx = f(x);
        lines.push(`  ${fmtNum(x, 4).padEnd(8)} | ${fmtNum(fx, 6)}`);
        if (lines.length > 30) { lines.push('  ...'); break; }
      }
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>f(x)</Text>
      <NeonInput value={expr} onChangeText={setExpr} placeholder="x^2" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>De</Text>
          <NeonInput value={from} onChangeText={setFrom} placeholder="-5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>À</Text>
          <NeonInput value={to} onChangeText={setTo} placeholder="5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Pas</Text>
          <NeonInput value={step} onChangeText={setStep} placeholder="1" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Calculer" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function SigneTab() {
  const [expr, setExpr] = useState('x^2 - 4');
  const [from, setFrom] = useState('-5');
  const [to, setTo] = useState('5');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    try {
      const f = makeF(expr);
      const a = parseFloat(from), b = parseFloat(to);
      const n = 500;
      const h = (b - a) / n;
      const roots: number[] = [];
      for (let i = 0; i < n; i++) {
        const x1 = a + i * h, x2 = a + (i + 1) * h;
        const f1 = f(x1), f2 = f(x2);
        if (f1 * f2 < 0) {
          // Bisection
          let lo = x1, hi = x2;
          for (let j = 0; j < 50; j++) {
            const mid = (lo + hi) / 2;
            if (f(mid) * f(lo) < 0) hi = mid; else lo = mid;
          }
          roots.push((lo + hi) / 2);
        }
      }
      const lines = [`Tableau de signes de ${expr}`];
      lines.push(`Intervalle: [${from}, ${to}]`);
      if (roots.length === 0) {
        const mid = (a + b) / 2;
        lines.push(`Pas de racine trouvée`);
        lines.push(`Signe: ${f(mid) > 0 ? '(+) sur [' + from + ', ' + to + ']' : '(-) sur [' + from + ', ' + to + ']'}`);
      } else {
        lines.push(`Racines: ${roots.map(r => fmtNum(r, 5)).join(', ')}`);
        const pts = [a, ...roots, b];
        for (let i = 0; i < pts.length - 1; i++) {
          const mid = (pts[i] + pts[i + 1]) / 2;
          const sign = f(mid) > 0 ? '+' : '-';
          lines.push(`(${fmtNum(pts[i], 4)}, ${fmtNum(pts[i + 1], 4)}): ${sign}`);
        }
      }
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>f(x)</Text>
      <NeonInput value={expr} onChangeText={setExpr} placeholder="x^2 - 4" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>De</Text>
          <NeonInput value={from} onChangeText={setFrom} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>À</Text>
          <NeonInput value={to} onChangeText={setTo} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Analyser" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

function PolynomeTab() {
  const [coeffs, setCoeffs] = useState('1 -5 6');
  const [result, setResult] = useState<string[]>([]);
  const colors = useColors();

  function compute() {
    try {
      const cs = coeffs.trim().split(/\s+/).map(Number).reverse();
      const n = cs.length - 1;
      const lines = [`Polynôme degré ${n}:`];
      const terms: string[] = [];
      for (let i = n; i >= 0; i--) {
        const c = cs[i];
        if (c === 0) continue;
        if (i === 0) terms.push(String(c));
        else if (i === 1) terms.push(`${c}x`);
        else terms.push(`${c}x^${i}`);
      }
      lines.push(`P(x) = ${terms.join(' + ').replace(/\+ -/g, '- ')}`);

      // Find roots numerically
      const f = (x: number) => cs.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
      const roots: number[] = [];
      for (let xi = -100; xi <= 100; xi++) {
        const x1 = xi, x2 = xi + 1;
        if (f(x1) * f(x2) < 0) {
          let lo = x1, hi = x2;
          for (let j = 0; j < 60; j++) {
            const mid = (lo + hi) / 2;
            if (f(mid) * f(lo) < 0) hi = mid; else lo = mid;
          }
          const r = (lo + hi) / 2;
          if (roots.every(existing => Math.abs(existing - r) > 1e-5)) roots.push(r);
        }
      }
      if (roots.length > 0) lines.push(`Racines: ${roots.map(r => fmtNum(r, 5)).join(', ')}`);
      else lines.push(`Pas de racine réelle trouvée dans [-100, 100]`);
      setResult(lines);
    } catch (e) {
      setResult([`Erreur: ${String(e)}`]);
    }
  }

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Coefficients (haut degré → bas)</Text>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>Ex: "1 -5 6" pour x²-5x+6</Text>
      <NeonInput value={coeffs} onChangeText={setCoeffs} placeholder="1 0 -1" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <CalcBtn label="Analyser" onPress={compute} />
      </View>
      {result.length > 0 && <ResultBox lines={result} />}
    </View>
  );
}

export default function AnalyseScreen() {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const CONTENT = [DeriveeTab, IntegraleTab, LimiteTab, TaylorTab, ValeursTab, SigneTab, PolynomeTab];
  const ContentComp = CONTENT[tab];

  return (
    <View style={[styles.root, { backgroundColor: '#0a0a0f', paddingTop: topPad }]}>
      <StarField />
      <View style={styles.titleRow}>
        <Text style={[styles.screenTitle, { color: colors.neonCyan }]}>Analyse</Text>
      </View>
      <SectionTab tabs={TABS} selected={tab} onSelect={setTab} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 34 : 80 }}>
        <ContentComp />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: { paddingHorizontal: 16, paddingBottom: 4 },
  screenTitle: { fontSize: 22, fontWeight: '800', fontFamily: MONO },
  tabContent: {},
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 4 },
  hint: { fontSize: 11, marginBottom: 4 },
});
