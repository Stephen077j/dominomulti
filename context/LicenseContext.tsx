import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const SECRET = 'CALCPROSTE_MG_2024_LYCEE';

interface LicenseState {
  deviceId: string;
  isLicensed: boolean;
  expiresAt: Date | null;
  daysRemaining: number;
  isLoading: boolean;
  validateToken: (token: string) => Promise<{ success: boolean; message: string }>;
  removeLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseState | null>(null);

function formatId(hex: string): string {
  const upper = hex.toUpperCase().replace(/[^A-F0-9]/g, '').substring(0, 16);
  const padded = upper.padEnd(16, '0');
  return `${padded.slice(0, 4)}-${padded.slice(4, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}`;
}

async function computeHash(input: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

// Storage abstraction: SecureStore on native, localStorage on web
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    try {
      const SecureStore = await import('expo-secure-store');
      return SecureStore.getItemAsync(key);
    } catch { return null; }
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

async function getOrCreateUUID(): Promise<string> {
  let uuid = await storage.get('calcproste_uuid');
  if (!uuid) {
    uuid = `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    await storage.set('calcproste_uuid', uuid);
  }
  return uuid;
}

async function generateDeviceId(): Promise<string> {
  const uuid = await getOrCreateUUID();
  let raw: string;
  if (Platform.OS !== 'web') {
    try {
      const Device = await import('expo-device');
      const modelId = Device.modelId ?? 'UnknownModel';
      const osName = Device.osName ?? 'UnknownOS';
      const osVersion = Device.osVersion ?? '0';
      raw = `${modelId}|${osName}|${osVersion}|${uuid}`;
    } catch {
      raw = `NATIVE|${uuid}`;
    }
  } else {
    raw = `WEB|${uuid}`;
  }
  const hash = await computeHash(raw);
  return formatId(hash);
}

function getDaysRemaining(expiresAt: Date): number {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState('');
  const [isLicensed, setIsLicensed] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const id = await generateDeviceId();
        setDeviceId(id);
        const stored = await storage.get('calcproste_token');
        const storedExpiry = await storage.get('calcproste_expiry');
        if (stored && storedExpiry) {
          const expiry = new Date(storedExpiry);
          if (expiry > new Date()) {
            setIsLicensed(true);
            setExpiresAt(expiry);
          }
        }
      } catch (e) {
        console.warn('LicenseProvider init error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const validateToken = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    const cleanToken = token.replace(/-/g, '').toUpperCase();
    if (cleanToken.length !== 16) {
      return { success: false, message: 'Format invalide. Utilisez XXXX-XXXX-XXXX-XXXX' };
    }
    const cleanDevice = deviceId.replace(/-/g, '').toUpperCase();
    const today = new Date();
    for (let delta = -90; delta <= 180; delta++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + delta);
      const dateStr = testDate.toISOString().split('T')[0];
      const raw = `${cleanDevice}::${SECRET}::${dateStr}`;
      const hash = await computeHash(raw);
      const expected = hash.toUpperCase().substring(0, 16);
      if (expected === cleanToken) {
        if (testDate >= today) {
          await storage.set('calcproste_token', cleanToken);
          await storage.set('calcproste_expiry', testDate.toISOString());
          setIsLicensed(true);
          setExpiresAt(testDate);
          const days = getDaysRemaining(testDate);
          return { success: true, message: `Licence activée! Expire dans ${days} jour(s)` };
        } else {
          return { success: false, message: `Licence expirée depuis le ${testDate.toLocaleDateString('fr-FR')}` };
        }
      }
    }
    return { success: false, message: 'Token invalide. Vérifiez le code et votre Device ID.' };
  }, [deviceId]);

  const removeLicense = useCallback(async () => {
    await storage.remove('calcproste_token');
    await storage.remove('calcproste_expiry');
    setIsLicensed(false);
    setExpiresAt(null);
  }, []);

  const daysRemaining = expiresAt ? getDaysRemaining(expiresAt) : 0;

  return (
    <LicenseContext.Provider value={{ deviceId, isLicensed, expiresAt, daysRemaining, isLoading, validateToken, removeLicense }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error('useLicense must be used inside LicenseProvider');
  return ctx;
}
