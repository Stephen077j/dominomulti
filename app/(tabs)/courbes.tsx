import { create, all } from 'mathjs';
import React, { useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import StarField from '@/components/StarField';
import { useColors } from '@/hooks/useColors';

const math = create(all);
const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const { width: W } = Dimensions.get('window');
const SVG_W = W - 32;
const SVG_H = 240;
const COLORS_CURVE = ['#00f5ff', '#ff00ff', '#00ff88', '#ff6b00', '#7b2fff'];

function evalF(expr: string, x: number): number {
  try {
    const r = math.evaluate(expr, { x });
    return typeof r === 'number' ? r : r.toNumber?.() ?? NaN;
  } catch { return NaN; }
}

interface Curve { expr: string; color: string; }

function plotPath(expr: string, xMin: number, xMax: number, yMin: number, yMax: number): string {
  const n = 300;
  const dx = (xMax - xMin) / n;
  const points: string[] = [];
  let started = false;
  for (let i = 0; i <= n; i++) {
    const x = xMin + i * dx;
    const y = evalF(expr, x);
    if (!isFinite(y) || isNaN(y)) { started = false; continue; }
    const px = ((x - xMin) / (xMax - xMin)) * SVG_W;
    const py = SVG_H - ((y - yMin) / (yMax - yMin)) * SVG_H;
    if (py < -SVG_H || py > 2 * SVG_H) { started = false; continue; }
    if (!started) { points.push(`M${px.toFixed(1)},${py.toFixed(1)}`); started = true; }
    else { points.push(`L${px.toFixed(1)},${py.toFixed(1)}`); }
  }
  return points.join(' ');
}

function toSvgX(x: number, xMin: number, xMax: number) { return ((x - xMin) / (xMax - xMin)) * SVG_W; }
function toSvgY(y: number, yMin: number, yMax: number) { return SVG_H - ((y - yMin) / (yMax - yMin)) * SVG_H; }

function GraphView({ curves, xMin, xMax, yMin, yMax }: { curves: Curve[]; xMin: number; xMax: number; yMin: number; yMax: number }) {
  const colors = useColors();
  const ox = toSvgX(0, xMin, xMax);
  const oy = toSvgY(0, yMin, yMax);
  const gridColor = 'rgba(0,245,255,0.12)';
  const axisColor = 'rgba(0,245,255,0.5)';
  const nGridX = 6, nGridY = 5;

  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(0,5,15,0.9)' }}>
      <Svg width={SVG_W} height={SVG_H}>
        {/* Grid */}
        {Array.from({ length: nGridX + 1 }).map((_, i) => {
          const x = (i / nGridX) * SVG_W;
          return <Line key={`gx${i}`} x1={x} y1={0} x2={x} y2={SVG_H} stroke={gridColor} strokeWidth={1} />;
        })}
        {Array.from({ length: nGridY + 1 }).map((_, i) => {
          const y = (i / nGridY) * SVG_H;
          return <Line key={`gy${i}`} x1={0} y1={y} x2={SVG_W} y2={y} stroke={gridColor} strokeWidth={1} />;
        })}
        {/* Axes */}
        {oy >= 0 && oy <= SVG_H && <Line x1={0} y1={oy} x2={SVG_W} y2={oy} stroke={axisColor} strokeWidth={1.5} />}
        {ox >= 0 && ox <= SVG_W && <Line x1={ox} y1={0} x2={ox} y2={SVG_H} stroke={axisColor} strokeWidth={1.5} />}
        {/* Axis labels */}
        {[xMin, 0, xMax].map((v, i) => {
          const px = toSvgX(v, xMin, xMax);
          const clamp = Math.max(4, Math.min(oy + 14, SVG_H - 2));
          return <SvgText key={`xl${i}`} x={px} y={clamp} fill="#e0e0ff" fontSize={9} textAnchor="middle">{v.toFixed(1)}</SvgText>;
        })}
        {[yMin, 0, yMax].map((v, i) => {
          const py = toSvgY(v, yMin, yMax);
          return <SvgText key={`yl${i}`} x={4} y={py + 4} fill="#e0e0ff" fontSize={9}>{v.toFixed(1)}</SvgText>;
        })}
        {/* Curves */}
        {curves.map((c, i) => {
          const d = plotPath(c.expr, xMin, xMax, yMin, yMax);
          return d ? <Path key={i} d={d} stroke={c.color} strokeWidth={2} fill="none" /> : null;
        })}
      </Svg>
    </View>
  );
}

function NeonInput({ value, onChangeText, placeholder, style }: { value: string; onChangeText: (t: string) => void; placeholder?: string; style?: object }) {
  const colors = useColors();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, color: colors.foreground, fontFamily: MONO, fontSize: 14, backgroundColor: 'rgba(0,10,20,0.7)' }, style]}
    />
  );
}

export default function CourbesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [curves, setCurves] = useState<Curve[]>([
    { expr: 'x^2 - 2', color: COLORS_CURVE[0] },
    { expr: 'sin(x)*3', color: COLORS_CURVE[1] },
  ]);
  const [xMin, setXMin] = useState('-5');
  const [xMax, setXMax] = useState('5');
  const [yMin, setYMin] = useState('-6');
  const [yMax, setYMax] = useState('6');
  const [newExpr, setNewExpr] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  function addCurve() {
    if (!newExpr.trim()) return;
    const color = COLORS_CURVE[curves.length % COLORS_CURVE.length];
    setCurves(c => [...c.slice(-4), { expr: newExpr.trim(), color }]);
    setNewExpr('');
  }

  function autoRange() {
    const xMnV = parseFloat(xMin), xMxV = parseFloat(xMax);
    let yMn = Infinity, yMx = -Infinity;
    curves.forEach(c => {
      for (let i = 0; i <= 200; i++) {
        const x = xMnV + (i / 200) * (xMxV - xMnV);
        const y = evalF(c.expr, x);
        if (isFinite(y) && !isNaN(y)) { if (y < yMn) yMn = y; if (y > yMx) yMx = y; }
      }
    });
    if (isFinite(yMn) && isFinite(yMx)) {
      const margin = (yMx - yMn) * 0.1 || 1;
      setYMin((yMn - margin).toFixed(1));
      setYMax((yMx + margin).toFixed(1));
    }
  }

  const xMnV = parseFloat(xMin) || -5;
  const xMxV = parseFloat(xMax) || 5;
  const yMnV = parseFloat(yMin) || -5;
  const yMxV = parseFloat(yMax) || 5;

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f', paddingTop: topPad }}>
      <StarField />
      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', fontFamily: MONO, color: colors.neonGreen }}>Courbes</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === 'web' ? 34 : 80 }}>
        <GraphView curves={curves} xMin={xMnV} xMax={xMxV} yMin={yMnV} yMax={yMxV} />

        {/* Range controls */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[['X min', xMin, setXMin], ['X max', xMax, setXMax], ['Y min', yMin, setYMin], ['Y max', yMax, setYMax]].map(([lbl, val, setter]) => (
            <View key={String(lbl)} style={{ flex: 1 }}>
              <Text style={{ color: colors.mutedForeground, fontSize: 10, marginBottom: 2 }}>{String(lbl)}</Text>
              <NeonInput value={String(val)} onChangeText={setter as (t: string) => void} placeholder="0" />
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={autoRange} style={{ borderWidth: 1, borderColor: colors.neonViolet, borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: colors.neonViolet, fontWeight: '700', fontSize: 13 }}>Auto Y</Text>
        </TouchableOpacity>

        {/* Curves list */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Fonctions actives</Text>
          {curves.map((c, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: c.color }} />
              <Text style={{ flex: 1, color: colors.foreground, fontFamily: MONO, fontSize: 13 }}>f{i + 1}(x) = {c.expr}</Text>
              <TouchableOpacity onPress={() => setCurves(cv => cv.filter((_, j) => j !== i))}>
                <Text style={{ color: colors.destructive, fontSize: 18, paddingHorizontal: 6 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add new curve */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <NeonInput value={newExpr} onChangeText={setNewExpr} placeholder="ex: cos(x) * 2" style={{ flex: 1 }} />
          <TouchableOpacity onPress={addCurve} style={{ backgroundColor: 'rgba(0,245,255,0.15)', borderWidth: 1, borderColor: colors.neonCyan, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' }}>
            <Text style={{ color: colors.neonCyan, fontWeight: '700', fontSize: 16 }}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 6 }}>
          Utilisez x comme variable. Ex: sin(x), x^2, log(x), sqrt(abs(x))
        </Text>
      </ScrollView>
    </View>
  );
}
