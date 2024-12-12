import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';
import { auth } from '../../firebaseConfig';
import {
  getUserGroups,
  getUser,
  Group,
  User,
  Settlement,
  calculateSettlements,
  updateSettlement
} from '../../firestore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  groupSelector: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  groupSelectorText: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  settlementItem: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  settlementText: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  settlementAmount: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    marginTop: 5,
  },
  settleButton: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  settleButtonText: {
    fontFamily: 'PoppinsSemiBold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'PoppinsSemiBold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  separator: {
    height: 1,
    opacity: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'PoppinsSemiBold',
  },
});

const LoadingOverlay: React.FC = () => {
  const opacity = useSharedValue(0.5);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    translateY.value = withRepeat(
      withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
      <View style={styles.loadingContainer}>
        <Animated.Image
          source={require('../../assets/app-logo-white.png')}
          style={[styles.loadingLogo, animatedStyle]}
        />
        <Animated.Text style={[styles.loadingText, animatedStyle]}>
          Calculating settlements...
        </Animated.Text>
      </View>
    </BlurView>
  );
};

const SettleUp: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchSettlements();
    }
  }, [selectedGroup]);

  const fetchUserGroups = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userGroups = await getUserGroups(currentUser.uid);
        setGroups(userGroups);
        setFilteredGroups(userGroups);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user groups:', error);
        Alert.alert('Error', 'Failed to fetch user groups. Please try again.');
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'No user is currently logged in.');
      setLoading(false);
    }
  }, []);

  const fetchSettlements = useCallback(async () => {
    if (selectedGroup) {
      setLoading(true);
      try {
        const groupSettlements = await calculateSettlements(selectedGroup.id);
        setSettlements(groupSettlements);

        const userPromises = selectedGroup.members.map(memberId => getUser(memberId));
        const fetchedUsers = await Promise.all(userPromises);
        const usersObj = fetchedUsers.reduce((acc, user) => {
          if (user) acc[user.id] = user;
          return acc;
        }, {} as { [key: string]: User });
        setUsers(usersObj);
      } catch (error) {
        console.error('Error fetching settlements:', error);
        Alert.alert('Error', 'Failed to fetch settlements. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [selectedGroup]);

  const handleSettle = useCallback(async (settlement: Settlement) => {
    try {
      await updateSettlement(settlement.id, { settled: true });
      setSettlements(prevSettlements =>
        prevSettlements.filter(s => s.id !== settlement.id)
      );
      Alert.alert('Success', 'Settlement marked as completed');
    } catch (error) {
      console.error('Error settling up:', error);
      Alert.alert('Error', 'Failed to settle up. Please try again.');
    }
  }, []);

  const renderSettlement = useCallback(({ item }: { item: Settlement }) => {
    const currentUserId = auth.currentUser?.uid;
    const isCurrentUserOwes = item.fromUserId === currentUserId;
    const isCurrentUserOwed = item.toUserId === currentUserId;

    return (
      <View style={[styles.settlementItem, { backgroundColor: theme.primary }]}>
        <Text style={[styles.settlementText, { color: theme.text }]}>
          {isCurrentUserOwes ? 'You owe' : `${users[item.fromUserId]?.fullName} owes`} {isCurrentUserOwed ? 'you' : users[item.toUserId]?.fullName}
        </Text>
        <Text style={[styles.settlementAmount, { color: theme.text }]}>
          ${item.amount.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={[styles.settleButton, { backgroundColor: theme.accent }]}
          onPress={() => handleSettle(item)}
        >
          <Text style={[styles.settleButtonText, { color: theme.primary }]}>Settle Up</Text>
        </TouchableOpacity>
      </View>
    );
  }, [users, handleSettle, theme]);

  const renderGroupSelector = () => (
    <TouchableOpacity
      style={[styles.groupSelector, { backgroundColor: theme.secondary }]}
      onPress={() => setGroupModalVisible(true)}
    >
      <Text style={[styles.groupSelectorText, { color: theme.text }]}>
        {selectedGroup ? selectedGroup.name : 'Select a group'}
      </Text>
    </TouchableOpacity>
  );

  const renderGroupModal = () => (
    <Modal
      visible={groupModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setGroupModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.primary }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select a Group</Text>
            <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.searchInput, { borderColor: theme.accent, color: theme.text }]}
            placeholder="Search groups"
            placeholderTextColor={theme.text}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              const filtered = groups.filter(group => group.name.toLowerCase().includes(text.toLowerCase()));
              setFilteredGroups(filtered);
            }}
          />
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedGroup(item);
                  setGroupModalVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, { color: theme.text }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.accent }]} />}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Settle Up",
          headerTitleAlign: "center",
          gestureEnabled: false,
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
          headerBackVisible: false,
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor={theme.secondary} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.primary }]}>
        <View style={styles.content}>
          {renderGroupSelector()}
          {selectedGroup ? (
            settlements.length > 0 ? (
              <FlatList
                data={settlements}
                renderItem={renderSettlement}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No settlements to show for this group.
              </Text>
            )
          ) : (
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Please select a group to view settlements.
            </Text>
          )}
        </View>
      </SafeAreaView>
      {renderGroupModal()}
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <LoadingOverlay />
        </View>
      )}
    </View>
  );
};

export default SettleUp;
