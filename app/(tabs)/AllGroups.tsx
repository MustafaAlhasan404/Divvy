import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
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

interface Group {
  id: string;
  name: string;
  memberCount: number;
  balance: number;
  icon: string;
}

const AllGroupsScreen: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const animation = useSharedValue(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups] = useState<Group[]>([
    { id: '1', name: 'Roommates', memberCount: 3, balance: 50, icon: 'home' },
    { id: '2', name: 'Trip to Paris', memberCount: 5, balance: -30, icon: 'airplane' },
    { id: '3', name: 'Office Lunch', memberCount: 8, balance: 0, icon: 'restaurant' },
  ]);

  useEffect(() => {
    animation.value = withTiming(1, { duration: 900 });
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(animation.value, [0, 1], [1000, 0]),
      },
    ],
  }));

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupItem = ({ item, index }: { item: Group; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100)}
      style={{ backgroundColor: theme.primary }}
      className="rounded-2xl p-4 mb-2 flex-row items-center"
    >
      <Ionicons name={item.icon as any} size={24} color={theme.accent} style={{ marginRight: 10 }} />
      <View>
        <Text style={{ color: theme.text }} className="text-lg font-semibold">{item.name}</Text>
        <Text style={{ color: theme.text }}>{item.memberCount} members</Text>
        <Text style={{ color: item.balance >= 0 ? theme.positive : theme.negative }} className="font-semibold">
          {item.balance >= 0 ? `You are owed ${item.balance}` : `You owe ${-item.balance}`}
        </Text>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center">
      <Text style={{ color: theme.text }} className="text-center mb-4">
        You're not in any groups yet. Create or join a group to get started!
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: theme.accent }}
        className="rounded-2xl p-4"
        onPress={() => router.push('../Screens/Create_join')}
      >
        <Text style={{ color: theme.primary }} className="text-center font-semibold">
          Create or Join a Group
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "My Groups",
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
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('../Screens/Create_join')}>
              <Ionicons name="add" size={24} color={theme.text} style={{ marginRight: 15 }} />
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
        <TextInput
          style={{ backgroundColor: theme.primary, color: theme.text }}
          className="rounded-2xl p-4 mb-4"
          placeholder="Search groups"
          placeholderTextColor={theme.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
});

export default AllGroupsScreen;
