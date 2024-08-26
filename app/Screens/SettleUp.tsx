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
  Alert,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    groupSelector: {
      backgroundColor: theme.secondary,
      borderRadius: 15,
      padding: 15,
      marginBottom: 20,
    },
    groupSelectorText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: 'PoppinsSemiBold',
    },
    settlementItem: {
      backgroundColor: theme.primary,
      borderRadius: 15,
      padding: 15,
      marginBottom: 10,
    },
    settlementText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: 'PoppinsSemiBold',
    },
    settlementAmount: {
      color: theme.text,
      fontSize: 18,
      fontFamily: 'PoppinsBold',
      marginTop: 5,
    },
    settleButton: {
      backgroundColor: theme.accent,
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
      alignItems: 'center',
    },
    settleButtonText: {
      color: theme.primary,
      fontFamily: 'PoppinsSemiBold',
    },
    emptyText: {
      color: theme.text,
      textAlign: 'center',
      marginTop: 20,
      fontFamily: 'PoppinsRegular',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.primary,
      borderRadius: 15,
      padding: 20,
      width: '80%',
      maxHeight: '80%',
    },
    modalTitle: {
      color: theme.text,
      fontSize: 20,
      fontFamily: 'PoppinsBold',
      marginBottom: 15,
    },
    modalItem: {
      paddingVertical: 10,
    },
    modalItemText: {
      color: theme.text,
      fontSize: 16,
      fontFamily: 'PoppinsRegular',
    },
    searchInput: {
      height: 40,
      borderColor: theme.text,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 15,
      color: theme.text,
    },
  });

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
      await fetchSettlements();
      Alert.alert('Success', 'Settlement marked as completed');
    } catch (error) {
      console.error('Error settling up:', error);
      Alert.alert('Error', 'Failed to settle up. Please try again.');
    }
  }, [fetchSettlements]);

  const renderSettlement = useCallback(({ item }: { item: Settlement }) => {
    const currentUserId = auth.currentUser?.uid;
    const isCurrentUserOwes = item.fromUserId === currentUserId;
    const isCurrentUserOwed = item.toUserId === currentUserId;

    return (
      <View style={styles.settlementItem}>
        <Text style={styles.settlementText}>
          {isCurrentUserOwes ? 'You owe' : `${users[item.fromUserId]?.fullName} owes`} {isCurrentUserOwed ? 'you' : users[item.toUserId]?.fullName}
        </Text>
        <Text style={styles.settlementAmount}>
          ${item.amount.toFixed(2)}
        </Text>
        {!item.settled && (
          <TouchableOpacity
            style={styles.settleButton}
            onPress={() => handleSettle(item)}
          >
            <Text style={styles.settleButtonText}>Settle Up</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [users, handleSettle, styles]);

  const renderGroupSelector = () => (
    <TouchableOpacity
      style={styles.groupSelector}
      onPress={() => setGroupModalVisible(true)}
    >
      <Text style={styles.groupSelectorText}>
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
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups"
            placeholderTextColor={theme.text}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              const filtered = groups.filter(group => group.name.toLowerCase().includes(text.toLowerCase()));
              setFilteredGroups(filtered);
            }}
          />
          <Text style={styles.modalTitle}>Select a Group</Text>
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
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Settle Up",
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
          headerBackVisible: false,
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor={theme.secondary} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderGroupSelector()}
          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} />
          ) : selectedGroup ? (
            settlements.length > 0 ? (
              <FlatList
                data={settlements}
                renderItem={renderSettlement}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <Text style={styles.emptyText}>
                No settlements to show for this group.
              </Text>
            )
          ) : (
            <Text style={styles.emptyText}>
              Please select a group to view settlements.
            </Text>
          )}
        </View>
      </SafeAreaView>
      {renderGroupModal()}
    </>
  );
};

export default SettleUp;