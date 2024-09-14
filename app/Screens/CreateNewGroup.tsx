import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useCallback } from 'react';
import {
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
} from 'react-native';

import { useTheme } from '../../ThemeContext';
import { auth } from '../../firebaseConfig';
import { createGroup, searchUser } from '../../firestore';

const CreateNewGroup: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('');
  const [newMember, setNewMember] = useState('');
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  const handleSave = useCallback(async () => {
    if (!groupName || !groupType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const newGroup = {
        name: groupName,
        members: [currentUser.uid, ...members.map(member => member.id)],
        createdBy: currentUser.uid,
        createdAt: new Date(),
        type: groupType,
      };

      const groupId = await createGroup(newGroup);
      console.log('Group created with ID:', groupId);
      Alert.alert('Success', 'Group created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  }, [groupName, groupType, members, router]);

  const handleAddMember = useCallback(async () => {
    if (newMember) {
      try {
        const user = await searchUser(newMember);
        if (user) {
          if (!members.some(member => member.id === user.id)) {
            setMembers([...members, { id: user.id, name: user.name }]);
            setNewMember('');
          } else {
            Alert.alert('Info', 'This user is already a member of the group.');
          }
        } else {
          Alert.alert('Error', 'No such user found.');
        }
      } catch (error) {
        console.error('Error searching for user:', error);
        Alert.alert('Error', 'Failed to search for user. Please try again.');
      }
    }
  }, [newMember, members]);

  const handleRemoveMember = useCallback((index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  }, [members]);

  const renderInputField = useCallback((label: string, value: string, setter: (text: string) => void, placeholder: string) => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold', marginBottom: 8 }}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: theme.primary,
          color: theme.text,
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          fontFamily: 'PoppinsSemiBold',
          borderWidth: 1,
          borderColor: theme.accent,
        }}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
      />
    </View>
  ), [theme]);

  const renderGroupTypeSelection = useCallback(() => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold', marginBottom: 8 }}>Group Type</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {['Home', 'Trip', 'Other'].map((type) => (
          <TouchableOpacity
            key={type}
            style={{
              flex: 1,
              backgroundColor: groupType === type ? theme.accent : theme.primary,
              padding: 15,
              borderRadius: 15,
              marginHorizontal: 4,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.accent,
            }}
            onPress={() => setGroupType(type)}
          >
            <Text 
              style={{ 
                fontFamily: 'PoppinsSemiBold',
                color: groupType === type ? theme.primary : theme.text,
                fontSize: 16,
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [theme, groupType]);

  const renderAddMembers = useCallback(() => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold', marginBottom: 8 }}>Add Members</Text>
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: theme.primary,
            color: theme.text,
            borderRadius: 15,
            padding: 15,
            marginRight: 10,
            fontSize: 16,
            fontFamily: 'PoppinsSemiBold',
            borderWidth: 1,
            borderColor: theme.accent,
          }}
          value={newMember}
          onChangeText={setNewMember}
          placeholder="Enter username..."
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            padding: 15,
            borderRadius: 15,
            justifyContent: 'center',
          }}
          onPress={handleAddMember}
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, fontSize: 16 }}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [theme, newMember, handleAddMember]);

  const renderMembersList = useCallback(() => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold', marginBottom: 8 }}>Members</Text>
      {members.map((member, index) => (
        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>{member.name}</Text>
          <TouchableOpacity onPress={() => handleRemoveMember(index)}>
            <Ionicons name="close-circle" size={28} color={theme.accent} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  ), [theme, members, handleRemoveMember]);

  const renderContent = useCallback(() => (
    <ScrollView 
      style={{ flexGrow: 1 }} 
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36 }}
    >
      <View className="flex-1">
        {renderInputField('Group Name', groupName, setGroupName, 'Enter group name...')}
        {renderGroupTypeSelection()}
        {renderAddMembers()}
        {renderMembersList()}
      </View>
    </ScrollView>
  ), [groupName, renderInputField, renderGroupTypeSelection, renderAddMembers, renderMembersList]);

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: theme.text,
            fontSize: 24,
            fontFamily: 'PoppinsSemiBold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
              <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={{ padding: 10 }}>
              <Text style={{ color: theme.accent, fontSize: 18, fontFamily: 'PoppinsSemiBold' }}>Save</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor={theme.secondary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.secondary }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
});

export default CreateNewGroup;
