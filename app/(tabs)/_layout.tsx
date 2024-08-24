import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '../../ThemeContext';

type IconName = keyof typeof Ionicons.glyphMap;

const ICON_MAP: Record<string, IconName> = {
  MainScreen: 'home',
  Search: 'search',
  Exchange: 'swap-horizontal',
  Layers: 'layers',
  Profile: 'person',
};

const getIconName = (routeName: string): IconName => ICON_MAP[routeName] || 'home';

interface TabBarButtonProps {
  route: { key: string; name: string };
  isFocused: boolean;
  index: number;
  navigation: BottomTabBarProps['navigation'];
  theme: ReturnType<typeof useTheme>;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({ route, isFocused, index, navigation, theme }) => {
  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons
        name={getIconName(route.name)}
        size={index === 2 ? 30 : 26}
        color={isFocused ? theme.accent : theme.text}
      />
    </TouchableOpacity>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const theme = useTheme();

  return (
    <View className="absolute bottom-0 left-0 right-0 h-24 items-center justify-center">
      <View style={{backgroundColor: theme.secondary}} className={`flex-row justify-around items-center rounded-full w-full h-32 pb-8 `}>
        {state.routes.map((route, index) => (
          <TabBarButton
            key={route.key}
            route={route}
            isFocused={state.index === index}
            index={index}
            navigation={navigation}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
};

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="MainScreen"
        options={{
          title: 'Main',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
