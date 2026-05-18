import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function TabIcon({ name, color, IconSet }: { name: string; color: string; IconSet: 'mci' | 'ion' | 'fa5' }) {
  if (IconSet === 'mci') return <MaterialCommunityIcons name={name as any} size={22} color={color} />;
  if (IconSet === 'ion') return <Ionicons name={name as any} size={22} color={color} />;
  return <FontAwesome5 name={name as any} size={18} color={color} />;
}

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0f',
          borderTopWidth: 1.5,
          borderTopColor: '#00f5ff',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          elevation: 0,
          ...(Platform.OS === 'web' ? { height: 84 } : {}),
        },
        tabBarActiveTintColor: '#00f5ff',
        tabBarInactiveTintColor: 'rgba(180,160,255,0.4)',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calc',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calculator-variant" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analyse"
        options={{
          title: 'Analyse',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="function-variant" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="algebre"
        options={{
          title: 'Algèbre',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="matrix" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courbes"
        options={{
          title: 'Courbes',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-bell-curve" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="geo"
        options={{
          title: 'Géo',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="triangle-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-bar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="outils"
        options={{
          title: 'Outils',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="tools" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
