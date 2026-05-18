import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CalcHistoryProvider } from "@/context/CalcHistoryContext";
import { LicenseProvider } from "@/context/LicenseContext";

const queryClient = new QueryClient();

const Root = Platform.OS === 'web' ? View : GestureHandlerRootView;

export default function RootLayout() {
  return (
    <Root style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <LicenseProvider>
              <CalcHistoryProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#0a0a0f' },
                    animation: Platform.OS === 'web' ? 'none' : 'default',
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="licence"
                    options={{
                      headerShown: true,
                      title: "Activation Licence",
                      headerStyle: { backgroundColor: '#0a0a0f' },
                      headerTintColor: '#00f5ff',
                      headerTitleStyle: { color: '#00f5ff', fontWeight: '700' },
                      presentation: Platform.OS === 'web' ? 'card' : 'modal',
                      animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
                    }}
                  />
                </Stack>
              </CalcHistoryProvider>
            </LicenseProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </Root>
  );
}
