import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Dimensions, Platform } from 'react-native';

import { useTheme } from '../../ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_HEIGHT < 700;

const TAB_BAR_HEIGHT = Platform.OS === 'ios' 
  ? (IS_SMALL_DEVICE ? 75 : 100) 
  : (IS_SMALL_DEVICE ? 50 : 70);

const INNER_TAB_BAR_HEIGHT = Platform.OS === 'ios' 
  ? (IS_SMALL_DEVICE ? 70 : 90) 
  : (IS_SMALL_DEVICE ? 70 : 85);

const ICON_SIZE = IS_SMALL_DEVICE ? 24 : 28;
const ANDROID_ICON_SIZE = IS_SMALL_DEVICE ? 24 : 28;
const BAR_WIDTH = Platform.OS === 'android' ? '110%' : '100%';
const ANDROID_ICON_PADDING = IS_SMALL_DEVICE ? 10 : 12;
const BORDER_RADIUS = 40;
const ANDROID_BORDER_RADIUS = BORDER_RADIUS * 3;

type IconName = keyof typeof Ionicons.glyphMap;

const ICON_MAP: Record<string, IconName> = {
  MainScreen: 'home-outline',
  AllGroups: 'people-outline',
  Activities: 'list-outline',
  Analytics: 'bar-chart-outline',
  Profile: 'person-outline',
};

const getIconName = (routeName: string): IconName => ICON_MAP[routeName] || 'home-outline';

interface TabBarButtonProps {
  route: { key: string; name: string };
  isFocused: boolean;
  navigation: BottomTabBarProps['navigation'];
  theme: ReturnType<typeof useTheme>;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({ route, isFocused, navigation, theme }) => {
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
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: Platform.OS === 'android' ? ANDROID_ICON_PADDING : 15,
        minWidth: Platform.OS === 'android' ? 60 : 70,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons
        name={getIconName(route.name)}
        size={Platform.OS === 'android' ? ANDROID_ICON_SIZE : ICON_SIZE}
        color={isFocused ? theme.accent : theme.text}
      />
    </TouchableOpacity>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const theme = useTheme();

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 items-center justify-center" 
      style={{ height: TAB_BAR_HEIGHT }}
    >
      <View 
        className="flex-row justify-around items-center" 
        style={{
          backgroundColor: theme.secondary,
          height: INNER_TAB_BAR_HEIGHT,
          width: BAR_WIDTH,
          paddingBottom: Platform.OS === 'ios' ? (IS_SMALL_DEVICE ? 4 : 6) : 0,
          borderTopLeftRadius: Platform.OS === 'android' ? ANDROID_BORDER_RADIUS : BORDER_RADIUS,
          borderTopRightRadius: Platform.OS === 'android' ? ANDROID_BORDER_RADIUS : BORDER_RADIUS,
          borderBottomLeftRadius: BORDER_RADIUS,
          borderBottomRightRadius: BORDER_RADIUS,
        }}
      >
        {state.routes.map((route, index) => (
          <TabBarButton
            key={route.key}
            route={route}
            isFocused={state.index === index}
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
          height: Platform.OS === 'ios' ? (IS_SMALL_DEVICE ? 80 : 100) : (IS_SMALL_DEVICE ? 70 : 85),
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: IS_SMALL_DEVICE ? 16 : 18,
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
      <Tabs.Screen
        name="AllGroups"
        options={{
          title: 'Groups',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Activities"
        options={{
          title: 'Activities',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
