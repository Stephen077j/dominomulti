import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StarField from '@/components/StarField';
import { useLicense } from '@/context/LicenseContext';
import { useColors } from '@/hooks/useColors';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export default function LicenceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLicensed, deviceId, expiresAt, validateToken, removeLicense } = useLicense();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleActivate() {
    const t = token.replace(/\s/g, '').toUpperCase();
    if (!t) { setMessage('Veuillez entrer un token'); setIsError(true); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await validateToken(t);
      if (res.success) {
        setMessage(res.message);
        setIsError(false);
        setToken('');
      } else {
        setMessage(res.message);
        setIsError(true);
      }
    } catch {
      setMessage('Erreur lors de la validation.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleDeactivate() {
    Alert.alert(
      'Désactiver la licence',
      'Êtes-vous sûr de vouloir désactiver la licence? Toutes les fonctionnalités premium seront limitées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désactiver', style: 'destructive', onPress: removeLicense },
      ]
    );
  }

  function formatToken(raw: string): string {
    const clean = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 16);
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += 4) parts.push(clean.slice(i, i + 4));
    return parts.join('-');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0a0a0f' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StarField />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status Card */}
        <View style={[styles.card, { borderColor: isLicensed ? colors.neonGreen : colors.neonOrange }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isLicensed ? colors.neonGreen : colors.neonOrange }]} />
            <Text style={[styles.statusText, { color: isLicensed ? colors.neonGreen : colors.neonOrange }]}>
              {isLicensed ? 'LICENCE ACTIVE' : 'NON ACTIVE'}
            </Text>
          </View>
          {isLicensed && expiresAt && (
            <Text style={[styles.expiryText, { color: colors.mutedForeground }]}>
              Expire le: {new Date(expiresAt).toLocaleDateString('fr-MG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Device ID */}
        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.neonViolet }]}>ID de cet appareil</Text>
          <Text style={[styles.deviceId, { color: colors.foreground }]}>
            {deviceId || 'Calcul en cours...'}
          </Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Communiquez cet identifiant à votre revendeur pour obtenir un token d'activation.
          </Text>
        </View>

        {/* Activation Form */}
        {!isLicensed && (
          <View style={[styles.card, { borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.neonCyan }]}>Activer la licence</Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Entrez votre token au format XXXX-XXXX-XXXX-XXXX
            </Text>
            <TextInput
              value={token}
              onChangeText={raw => setToken(formatToken(raw))}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              maxLength={19}
              style={[styles.tokenInput, { borderColor: colors.neonCyan, color: colors.foreground }]}
            />
            {message !== '' && (
              <View style={[styles.msgBox, { borderColor: isError ? colors.destructive : colors.neonGreen, backgroundColor: isError ? 'rgba(255,68,85,0.08)' : 'rgba(0,255,136,0.08)' }]}>
                <Text style={{ color: isError ? colors.destructive : colors.neonGreen, fontFamily: MONO, fontSize: 13 }}>{message}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleActivate}
              disabled={loading}
              style={[styles.activateBtn, { backgroundColor: loading ? 'rgba(0,245,255,0.08)' : 'rgba(0,245,255,0.15)', borderColor: colors.neonCyan }]}
            >
              <Text style={[styles.activateBtnText, { color: colors.neonCyan }]}>
                {loading ? 'Validation...' : 'Activer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Deactivate */}
        {isLicensed && (
          <>
            {message !== '' && (
              <View style={[styles.msgBox, { borderColor: isError ? colors.destructive : colors.neonGreen, backgroundColor: isError ? 'rgba(255,68,85,0.08)' : 'rgba(0,255,136,0.08)', marginBottom: 12 }]}>
                <Text style={{ color: isError ? colors.destructive : colors.neonGreen, fontFamily: MONO, fontSize: 13 }}>{message}</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleDeactivate} style={[styles.deactivateBtn, { borderColor: colors.destructive }]}>
              <Text style={{ color: colors.destructive, fontWeight: '700', fontSize: 14 }}>Désactiver la licence</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Info */}
        <View style={[styles.card, { borderColor: colors.border, marginTop: 20 }]}>
          <Text style={[styles.cardTitle, { color: colors.neonViolet }]}>Informations</Text>
          {[
            ['Application', 'CalcProSte'],
            ['Version', '1.0.0'],
            ['Cible', 'Lycéens Madagascar'],
            ['Mode', '100% Hors ligne'],
            ['Algorithme', 'SHA-256 / ±90 jours'],
          ].map(([k, v]) => (
            <View key={k} style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.mutedForeground }]}>{k}</Text>
              <Text style={[styles.infoVal, { color: colors.foreground }]}>{v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(0,5,15,0.8)',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 16, fontWeight: '800', fontFamily: MONO, letterSpacing: 1 },
  expiryText: { fontSize: 13, marginTop: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, fontFamily: MONO },
  deviceId: { fontFamily: MONO, fontSize: 15, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  tokenInput: {
    borderWidth: 1.5, borderRadius: 10, padding: 14, marginTop: 10,
    fontFamily: MONO, fontSize: 18, fontWeight: '700', textAlign: 'center', letterSpacing: 2,
    backgroundColor: 'rgba(0,245,255,0.04)',
  },
  msgBox: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 10 },
  activateBtn: { borderWidth: 1.5, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  activateBtnText: { fontSize: 16, fontWeight: '800', fontFamily: MONO, letterSpacing: 1 },
  deactivateBtn: { borderWidth: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoKey: { fontSize: 13 },
  infoVal: { fontSize: 13, fontWeight: '600' },
});
