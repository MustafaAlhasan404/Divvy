import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';

import { useTheme } from '../../ThemeContext';
import { auth } from '../../firebaseConfig';
import { 
  createExpense, 
  createExpenseShares, 
  getUserGroups, 
  getUser, 
  Group, 
  User, 
  Expense,
  ExpenseShare
} from '../../firestore';

const Expenses: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0));

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [payers, setPayers] = useState<{ [userId: string]: number }>({});
  const [isPayerModalVisible, setPayerModalVisible] = useState(false);
  const [isGroupModalVisible, setGroupModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [payerError, setPayerError] = useState('');

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers();
    }
  }, [selectedGroup]);

  const fetchUserGroups = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userGroups = await getUserGroups(currentUser.uid);
      setGroups(userGroups);
    }
  };

  const fetchGroupMembers = async () => {
    if (selectedGroup) {
      const members = await Promise.all(selectedGroup.members.map(memberId => getUser(memberId)));
      const filteredMembers = members.filter((member): member is User => member !== null);
      setGroupMembers(filteredMembers);
      
      const initialPayers = filteredMembers.reduce((acc, member) => {
        acc[member.id] = 0;
        return acc;
      }, {} as { [key: string]: number });
      setPayers(initialPayers);
    }
  };

  const backgroundStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1000, 0],
        }),
      },
    ],
  };

  const handleDone = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create an expense');
      return;
    }

    if (!amount || !description || !selectedGroup) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const totalAmount = parseFloat(amount);
    const totalPaid = Object.values(payers).reduce((sum, value) => sum + value, 0);
    
    if (Math.abs(totalPaid - totalAmount) > 0.01) {
      Alert.alert('Error', 'The sum of payer amounts must equal the total expense amount');
      return;
    }

    try {
      const expenseData: Omit<Expense, 'id'> = {
        groupId: selectedGroup.id,
        paidBy: payers,
        totalAmount,
        description,
        date,
        splitMethod: 'equal',
      };

      const expenseId = await createExpense(expenseData);

      const shares: Omit<ExpenseShare, 'id'>[] = selectedGroup.members.map(memberId => {
        const shareAmount = totalAmount / selectedGroup.members.length;
        return {
          expenseId,
          userId: memberId,
          amount: shareAmount,
          isPaid: payers[memberId] ? payers[memberId] >= shareAmount : false,
        };
      });

      await createExpenseShares(shares);

      Alert.alert('Success', 'Expense created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense. Please try again.');
    }
  };

  const renderInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>{placeholder}:</Text>
      <TextInput
        style={{
          backgroundColor: theme.primary,
          color: theme.text,
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          fontFamily: 'PoppinsSemiBold',
        }}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        keyboardType={keyboardType}
        keyboardAppearance="dark"
      />
    </View>
  );  

  const renderGroupDropdown = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>Group:</Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          borderRadius: 15,
          padding: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={() => setGroupModalVisible(true)}
      >
        <Text style={{ color: selectedGroup ? theme.text : '#6B7280', fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>
          {selectedGroup ? selectedGroup.name : 'Select Group'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const renderPaidBy = () => {
    if (!selectedGroup) {
      return (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: theme.text, fontFamily: 'PoppinsSemiBold' }}>Please select a group first</Text>
        </View>
      );
    }

    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>Paid by:</Text>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            borderRadius: 15,
            padding: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => setPayerModalVisible(true)}
        >
          <Text style={{ color: Object.keys(payers).length ? theme.text : '#6B7280', fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>
            {Object.keys(payers).filter(k => payers[k] > 0).map(k => `${groupMembers.find(m => m.id === k)?.fullName}: ${payers[k]}`).join(', ') || 'Select Payers'}
          </Text>
          <Ionicons name="chevron-down" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDatePicker = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>Date:</Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          borderRadius: 15,
          padding: 15,
        }}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (event.type === 'set') {
              setDate(selectedDate || date);
              setShowDatePicker(Platform.OS === 'ios');
            } else {
              setShowDatePicker(false);
            }
          }}
          textColor={theme.text}
          style={{ backgroundColor: theme.primary }}
        />
      )}
    </View>
  );  

  const PayerModal = () => {
    const [modalPayers, setModalPayers] = useState<{ [key: string]: number }>(payers);

    const updatePayerAmount = (userId: string, amount: string) => {
      setModalPayers(prev => ({
        ...prev,
        [userId]: parseFloat(amount) || 0
      }));
    };

    const handleModalDone = () => {
      const totalPaid = Object.values(modalPayers).reduce((sum, value) => sum + value, 0);
      const totalAmount = parseFloat(amount);

      if (Math.abs(totalPaid - totalAmount) > 0.01) {
        setPayerError(`The total paid (${totalPaid.toFixed(2)}) must equal the expense amount (${totalAmount.toFixed(2)})`);
      } else {
        setPayerError('');
        setPayers(modalPayers);
        setPayerModalVisible(false);
      }
    };

    return (
      <Modal
        isVisible={isPayerModalVisible}
        onBackdropPress={() => setPayerModalVisible(false)}
        style={{ 
          margin: 0,
          justifyContent: 'flex-end',
        }}
        avoidKeyboard
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ 
            backgroundColor: theme.primary,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
          }}
        >
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>Select Payers</Text>
              <TouchableOpacity onPress={() => setPayerModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={groupMembers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.secondary,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>{item.fullName}</Text>
                  </View>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: theme.secondary,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                  }}>
                    <Text style={{ color: theme.text, fontSize: 18, marginRight: 5 }}>$</Text>
                    <TextInput
                      style={{
                        color: theme.text,
                        fontSize: 18,
                        width: 80,
                        padding: 10,
                        textAlign: 'right',
                      }}
                      value={modalPayers[item.id]?.toString() || ''}
                      onChangeText={(text) => updatePayerAmount(item.id, text)}
                      placeholder="0.00"
                      placeholderTextColor="#6B7280"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            />
{payerError ? (
  <View style={{
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  }}>
    <Ionicons name="warning-outline" size={24} color="red" style={{ marginRight: 10 }} />
    <Text style={{ 
      color: 'red', 
      fontSize: 16, 
      fontWeight: '600',
      flex: 1,
    }}>
      {payerError}
    </Text>
  </View>
) : null}

            <TouchableOpacity
              style={{ 
                backgroundColor: theme.accent,
                padding: 15,
                borderRadius: 15,
                marginTop: 20,
              }}
              onPress={handleModalDone}
            >
              <Text style={{ 
                color: theme.primary,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const GroupModal = () => {
    const handleGroupSelect = (group: Group) => {
      setSelectedGroup(group);
      setGroupModalVisible(false);
    };

    return (
      <Modal
        isVisible={isGroupModalVisible}
        onBackdropPress={() => setGroupModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{ 
          backgroundColor: theme.primary, 
          padding: 20, 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20, 
          maxHeight: '80%' 
        }}>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Select Group</Text>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ 
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.secondary
                }}
                onPress={() => handleGroupSelect(item)}
              >
                <Text style={{ color: theme.text, fontSize: 18 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        </Modal>
    );
  };

  const renderContent = () => (
    <ScrollView style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
      <View className="flex-1">
        {renderInput(amount, setAmount, 'Amount', 'numeric')}
        {renderInput(description, setDescription, 'Description')}
        {renderGroupDropdown()}
        {renderPaidBy()}
        {renderDatePicker()}
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Add Expense",
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
          headerRight: () => (
            <TouchableOpacity onPress={handleDone}>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginRight: 15 }}>Done</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor={theme.secondary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.secondary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { position: 'absolute', top: 0, left: 0, right: 0, height: '100%', backgroundColor: theme.secondary },
          ]}
        />
        {Platform.OS === 'ios' ? (
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateY: keyboardOffset }],
            }}
          >
            {renderContent()}
          </Animated.View>
        ) : (
          <KeyboardAvoidingView
            behavior="padding"
            className="flex-1"
          >
            {renderContent()}
          </KeyboardAvoidingView>
        )}
        <PayerModal />
        <GroupModal />
      </SafeAreaView>
    </>
  );
});

export default Expenses;
