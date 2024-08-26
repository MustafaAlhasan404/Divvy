/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';
import { auth } from '../../firebaseConfig';
import { getUserGroups, getGroupExpenses, Expense } from '../../firestore';

interface Activity {
  id: string;
  description: string;
  date: string;
  amount: number;
  icon: string;
  groupName: string;
}

const AllRecentActivitiesScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const animation = useSharedValue(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    animation.value = withTiming(1, { duration: 900 });
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userGroups = await getUserGroups(currentUser.uid);
        const allExpenses: Activity[] = [];

        for (const group of userGroups) {
          const groupExpenses = await getGroupExpenses(group.id);
          const groupActivities = groupExpenses.map(expense => ({
            id: expense.id,
            description: expense.description,
            date: formatDate(expense.date),
            amount: expense.totalAmount,
            icon: getCategoryIcon(expense.category),
            groupName: group.name,
          }));
          allExpenses.push(...groupActivities);
        }

        // Sort activities by date (most recent first)
        allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(allExpenses);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (date: any): string => {
    if (date && typeof date.toDate === 'function') {
      // Firestore Timestamp
      return date.toDate().toDateString();
    } else if (date && typeof date === 'object' && date.seconds) {
      // Firestore Timestamp stored as object
      return new Date(date.seconds * 1000).toDateString();
    } else if (date && !isNaN(Date.parse(date))) {
      // Date string
      return new Date(date).toDateString();
    }
    return 'Unknown Date';
  };

  const getCategoryIcon = (category?: string): string => {
    switch (category) {
      case 'food': return 'restaurant';
      case 'transport': return 'car';
      case 'entertainment': return 'film';
      case 'shopping': return 'cart';
      default: return 'cash';
    }
  };

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
      style={{ backgroundColor: theme.secondary }}
      className="rounded-2xl p-4 mb-2 flex-row items-center"
    >
      <Ionicons name={item.icon as any} size={24} color={theme.accent} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text }} className="text-lg font-semibold">{item.description}</Text>
        <Text style={{ color: theme.accent }} className="text-sm">{item.groupName} • {item.date}</Text>
      </View>
      <Text style={{ color: theme.accent }} className="font-semibold">
        ${item.amount.toFixed(2)}
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
        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} />
        ) : (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={{ color: theme.text, textAlign: 'center' }}>No recent activities</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AllRecentActivitiesScreen;