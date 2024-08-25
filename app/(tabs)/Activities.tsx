import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';

interface Activity {
  id: string;
  description: string;
  date: string;
  amount: number;
  icon: string;
}

const AllRecentActivitiesScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const animation = useSharedValue(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    animation.value = withTiming(1, { duration: 900 });
    // Simulated API call to fetch activities
    setActivities([
      { id: '1', description: 'Paid for groceries', date: '2023-05-01', amount: -50, icon: 'cart' },
      { id: '2', description: 'Split dinner bill', date: '2023-05-02', amount: 30, icon: 'restaurant' },
      { id: '3', description: 'Movie tickets', date: '2023-05-03', amount: -20, icon: 'film' },
    ]);
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(animation.value, [0, 1], [-1000, 0]),
      },
    ],
  }));

  const renderActivityItem = useCallback(({ item, index }: { item: Activity; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={{ backgroundColor: theme.primary }}
      className="rounded-2xl p-4 mb-2 flex-row items-center"
    >
      <Ionicons name={item.icon as any} size={24} color={theme.accent} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text }} className="text-lg font-semibold">{item.description}</Text>
        <Text style={{ color: theme.text }}>{item.date}</Text>
      </View>
      <Text style={{ color: item.amount >= 0 ? theme.positive : theme.negative }} className="font-semibold">
        {item.amount >= 0 ? `+$${item.amount}` : `-$${Math.abs(item.amount)}`}
      </Text>
    </Animated.View>
  ), [theme]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Recent Activities",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: theme.text,
            fontSize: 20,
            fontFamily: 'PoppinsSemiBold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} style={{ marginLeft: 15 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Animated.View
        style={[
          backgroundStyle,
          { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.background },
        ]}
        className="rounded-b-[50px] md:rounded-b-[80px]"
      />
      <View className="flex-1 px-4 py-20 md:px-6 md:py-10">
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={{ color: theme.text, textAlign: 'center' }}>No recent activities</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default AllRecentActivitiesScreen;
