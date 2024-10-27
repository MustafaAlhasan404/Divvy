import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import React, { useState, memo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';
import { auth, db } from '../../firebaseConfig';
import { Group } from '../../firestore';

const AllGroupsScreen: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const animation = useSharedValue(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    animation.value = withTiming(1, { duration: 900 });
    const user = auth.currentUser;
    if (user) {
      const groupsQuery = query(collection(db, 'Groups'), where('members', 'array-contains', user.uid));
      const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
        const updatedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        setGroups(updatedGroups);
      });

      return () => unsubscribe();
    }
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
      className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center">
        <Ionicons 
          name={item.type === 'Home' ? 'home' : item.type === 'Trip' ? 'airplane' : 'people'} 
          size={24} 
          color={theme.accent} 
          style={{ marginRight: 10 }} 
        />
        <View>
          <Text style={{ color: theme.text }} className="text-lg font-semibold">{item.name}</Text>
          <Text style={{ color: theme.text }}>{item.members.length} members</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={async () => {
          await Clipboard.setStringAsync(item.code);
          Alert.alert('Copied!', `Group code ${item.code} has been copied to clipboard.`);
        }}
      >
        <View style={{ backgroundColor: theme.accent }} className="rounded-lg p-2">
          <Text style={{ color: theme.primary, fontFamily: 'PoppinsSemiBold' }} className="text-sm">
            Code: {item.code}
          </Text>
        </View>
      </TouchableOpacity>
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                <Ionicons name="close" size={24} color={theme.text} />
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
          <View style={{ backgroundColor: theme.primary }} className="rounded-2xl p-4 mb-4 shadow-md">
            <View style={{ backgroundColor: theme.primary }} className="rounded-2xl flex-row items-center">
              <Ionicons name="search" size={24} color={theme.text} style={{ marginLeft: 15 }} />
              <TextInput
                style={{ color: theme.accent, flex: 1, paddingVertical: 12, paddingHorizontal: 10 }}
                className="rounded-2xl"
                placeholder="Search groups"
                placeholderTextColor={theme.text}
                value={searchQuery}
                onChangeText={setSearchQuery}
                keyboardAppearance="dark"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 10 }}>
                  <Ionicons name="close-circle" size={24} color={theme.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <FlatList
            data={filteredGroups}
            renderItem={renderGroupItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});

export default AllGroupsScreen;