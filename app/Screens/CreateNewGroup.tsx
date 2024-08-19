import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo } from 'react';
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
} from 'react-native';

import { useTheme } from '../../ThemeContext';

const CreateNewGroup: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('');
  const [newMember, setNewMember] = useState('');
  const [members, setMembers] = useState(['You (Admin)']);

  const handleSave = () => {
    console.log('Saving group:', { groupName, groupType, members });
    router.back();
  };

  const handleAddMember = () => {
    if (newMember) {
      setMembers([...members, newMember]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const renderInputField = (label: string, value: string, setter: (text: string) => void, placeholder: string) => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold', marginBottom: 8 }}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: theme.primary,
          color: theme.text,
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          fontFamily: 'PoppinsRegular',
          borderWidth: 1,
          borderColor: theme.accent,
        }}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
      />
    </View>
  );

  const renderGroupTypeSelection = () => (
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
  );

  const renderAddMembers = () => (
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
            fontFamily: 'PoppinsRegular',
            borderWidth: 1,
            borderColor: theme.accent,
          }}
          value={newMember}
          onChangeText={setNewMember}
          placeholder="Enter email or name..."
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
  );

  const renderMembersList = () => (
    <View style={{ marginBottom: 25 }}>
      <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold', marginBottom: 8 }}>Members</Text>
      {members.map((member, index) => (
        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsRegular' }}>{member}</Text>
          {index !== 0 && (
            <TouchableOpacity onPress={() => handleRemoveMember(index)}>
              <Ionicons name="close-circle" size={28} color={theme.accent} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderContent = () => (
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
  );

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
