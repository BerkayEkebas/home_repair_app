import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { JSX, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// Type Definitions
interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  room_id?: number;
  is_active?: number;
}

interface Translations {
  [key: string]: {
    title: string;
    changePassword: string;
    adminPanel: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    save: string;
    cancel: string;
    passwordChanged: string;
    passwordsNotMatch: string;
    onlyStudents: string;
    fillAllFields: string;
    name: string;
    email: string;
    role: string;
    room: string;
    status: string;
    edit: string;
    delete: string;
    createUser: string;
    active: string;
    inactive: string;
    student: string;
    admin: string;
    userCreated: string;
    userUpdated: string;
    userDeleted: string;
    confirmDelete: string;
    allFieldsRequired: string;
    loading: string;
    noUsers: string;
    selectLanguage: string;
    korean: string;
    english: string;
    refresh: string;
    manageUsers: string;
    optional: string;
  };
}

const Saved = () => {
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [language, setLanguage] = useState<'korean' | 'english'>('korean');
  const [languageModal, setLanguageModal] = useState<boolean>(false);
  
  // Password Change States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordModal, setPasswordModal] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Admin Panel States
  const [users, setUsers] = useState<User[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    room_id: ''
  });
  const [createUserLoading, setCreateUserLoading] = useState<boolean>(false);

  // Dil çevirileri
  const translations: Translations = {
    korean: {
      title: '계정 설정',
      changePassword: '비밀번호 변경',
      adminPanel: '관리자 패널',
      currentPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      confirmPassword: '비밀번호 확인',
      save: '저장',
      cancel: '취소',
      passwordChanged: '비밀번호가 성공적으로 변경되었습니다',
      passwordsNotMatch: '비밀번호가 일치하지 않습니다',
      onlyStudents: '학생만 비밀번호를 변경할 수 있습니다',
      fillAllFields: '모든 필드를 입력해주세요',
      name: '이름',
      email: '이메일',
      role: '역할',
      room: '방',
      status: '상태',
      edit: '수정',
      delete: '삭제',
      createUser: '새 사용자 생성',
      active: '활성',
      inactive: '비활성',
      student: '학생',
      admin: '관리자',
      userCreated: '사용자가 성공적으로 생성되었습니다',
      userUpdated: '사용자 정보가 성공적으로 업데이트되었습니다',
      userDeleted: '사용자가 성공적으로 삭제되었습니다',
      confirmDelete: '이 사용자를 삭제하시겠습니까?',
      allFieldsRequired: '모든 필드는 필수입니다',
      loading: '로딩 중...',
      noUsers: '사용자를 찾을 수 없습니다',
      selectLanguage: '언어 선택',
      korean: '한국어',
      english: 'English',
      refresh: '새로고침',
      manageUsers: '사용자 관리',
      optional: '선택사항'
    },
    english: {
      title: 'Account Settings',
      changePassword: 'Change Password',
      adminPanel: 'Admin Panel',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save',
      cancel: 'Cancel',
      passwordChanged: 'Password changed successfully',
      passwordsNotMatch: 'Passwords do not match',
      onlyStudents: 'Only students can change password',
      fillAllFields: 'Please fill all fields',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      room: 'Room',
      status: 'Status',
      edit: 'Edit',
      delete: 'Delete',
      createUser: 'Create New User',
      active: 'Active',
      inactive: 'Inactive',
      student: 'Student',
      admin: 'Admin',
      userCreated: 'User created successfully',
      userUpdated: 'User updated successfully',
      userDeleted: 'User deleted successfully',
      confirmDelete: 'Are you sure you want to delete this user?',
      allFieldsRequired: 'All fields are required',
      loading: 'Loading...',
      noUsers: 'No users found',
      selectLanguage: 'Select Language',
      korean: 'Korean',
      english: 'English',
      refresh: 'Refresh',
      manageUsers: 'Manage Users',
      optional: 'Optional'
    }
  };

  const t = translations[language];

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async (): Promise<void> => {
    try {
      const role = await AsyncStorage.getItem("role");
      if (role) {
        setUserRole(role.replace(/"/g, ""));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  // Password Change Functions
  const handlePasswordChange = async (): Promise<void> => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage(t.fillAllFields);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage(t.passwordsNotMatch);
      return;
    }

    if (userRole !== 'student') {
      setMessage(t.onlyStudents);
      return;
    }

    setPasswordLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      
      const response = await fetch('https://home-repair-api.onrender.com/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId?.replace(/"/g, ""),
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t.passwordChanged);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordModal(false);
      } else {
        setMessage(data[language] || data.en || t.fillAllFields);
      }
    } catch (error) {
      setMessage(t.fillAllFields);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Admin Panel Functions
  const fetchUsers = async (): Promise<void> => {
    setAdminLoading(true);
    try {
      const response = await fetch('https://home-repair-api.onrender.com/api/users/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      setMessage('');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateUser = async (): Promise<void> => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      setMessage(t.allFieldsRequired);
      return;
    }

    setCreateUserLoading(true);
    try {
      const response = await fetch('https://home-repair-api.onrender.com/api/users/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t.userCreated);
        setShowCreateForm(false);
        setNewUser({ name: '', email: '', password: '', role: 'student', room_id: '' });
        fetchUsers();
      } else {
        const errorMsg = data[language] || data.en || data.message || 'Error creating user';
        setMessage(errorMsg);
      }
    } catch (error: any) {
      setMessage('Error creating user: ' + error.message);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number): Promise<void> => {
    Alert.alert(
      t.confirmDelete,
      undefined, // description yerine undefined kullan
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://home-repair-api.onrender.com/api/users/users/${userId}`, {
                method: 'DELETE',
              });

              const data = await response.json();

              if (response.ok) {
                setMessage(t.userDeleted);
                fetchUsers();
              } else {
                const errorMsg = data[language] || data.en || data.message || 'Error deleting user';
                setMessage(errorMsg);
              }
            } catch (error: any) {
              setMessage('Error deleting user: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const getStatusText = (isActive: number | undefined): string => {
    return isActive === 1 ? t.active : t.inactive;
  };

  const getStatusColor = (isActive: number | undefined): string => {
    return isActive === 1 ? '#22c55e' : '#ef4444';
  };

  const getRoleColor = (role: string): string => {
    return role === 'admin' ? '#f59e0b' : '#3b82f6';
  };

  const renderStudentView = (): JSX.Element => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>{t.changePassword}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setPasswordModal(true)}
      >
        <Text style={styles.buttonText}>{t.changePassword}</Text>
      </TouchableOpacity>

      {/* Password Change Modal */}
      <Modal
        visible={passwordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.changePassword}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={t.currentPassword}
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, currentPassword: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder={t.newPassword}
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, newPassword: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder={t.confirmPassword}
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({...passwordForm, confirmPassword: text})}
            />

            {message ? <Text style={styles.messageText}>{message}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePasswordChange}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t.save}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderAdminView = (): JSX.Element => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>{t.adminPanel}</Text>
      
      <View style={styles.adminActions}>
        <TouchableOpacity 
          style={[styles.button, styles.refreshButton]}
          onPress={fetchUsers}
        >
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>{t.refresh}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.createButton]}
          onPress={() => setShowCreateForm(true)}
        >
          <MaterialIcons name="person-add" size={20} color="#fff" />
          <Text style={styles.buttonText}>{t.createUser}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.manageUsersTitle}>{t.manageUsers}</Text>

      {adminLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : (
        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {users.length === 0 ? (
            <View style={styles.noUsers}>
              <MaterialIcons name="people-outline" size={48} color="#6b7280" />
              <Text style={styles.noUsersText}>{t.noUsers}</Text>
              <TouchableOpacity style={styles.refetchButton} onPress={fetchUsers}>
                <Text style={styles.refetchButtonText}>{t.refresh}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            users.map((user) => (
              <View key={user.user_id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={styles.userBadges}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                      <Text style={styles.badgeText}>
                        {user.role === 'student' ? t.student : t.admin}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.is_active) }]}>
                      <Text style={styles.badgeText}>
                        {getStatusText(user.is_active)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.userDetails}>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {user.room_id && (
                    <Text style={styles.userRoom}>
                      <Text>{t.room}: </Text>
                      <Text>{user.room_id}</Text>
                    </Text>
                  )}
                </View>
                
                <View style={styles.userActions}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteUser(user.user_id)}
                  >
                    <MaterialIcons name="delete" size={16} color="#fff" />
                    <Text style={styles.deleteButtonText}>{t.delete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Create User Modal */}
      <Modal
        visible={showCreateForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>{t.createUser}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder={t.name}
                placeholderTextColor="#9ca3af"
                value={newUser.name}
                onChangeText={(text) => setNewUser({...newUser, name: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder={t.email}
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                value={newUser.email}
                onChangeText={(text) => setNewUser({...newUser, email: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder={t.newPassword}
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={newUser.password}
                onChangeText={(text) => setNewUser({...newUser, password: text})}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.role}</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUser.role === 'student' && styles.selectedRoleOption
                    ]}
                    onPress={() => setNewUser({...newUser, role: 'student'})}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === 'student' && styles.selectedRoleOptionText
                    ]}>
                      {t.student}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUser.role === 'admin' && styles.selectedRoleOption
                    ]}
                    onPress={() => setNewUser({...newUser, role: 'admin'})}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === 'admin' && styles.selectedRoleOptionText
                    ]}>
                      {t.admin}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder={`${t.room} (${t.optional})`}
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={newUser.room_id}
                onChangeText={(text) => setNewUser({...newUser, room_id: text})}
              />

              {message ? <Text style={styles.messageText}>{message}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreateForm(false)}
                >
                  <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleCreateUser}
                  disabled={createUserLoading}
                >
                  {createUserLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t.save}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Language Selector */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
        
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setLanguageModal(true)}
        >
          <MaterialIcons name="language" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {userRole === 'student' && renderStudentView()}
        {userRole === 'admin' && renderAdminView()}
        
        {message && !passwordModal && !showCreateForm && (
          <View style={[
            styles.messageContainer,
            message.includes('successfully') || message.includes('성공적으로') 
              ? styles.successMessage 
              : styles.errorMessage
          ]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
            {(['korean', 'english'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageOption,
                  language === lang && styles.selectedLanguage
                ]}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModal(false);
                }}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === lang && styles.selectedLanguageText
                ]}>
                  {t[lang]}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>
                {language === 'korean' ? '취소' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#10b981',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  manageUsersTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedRoleOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  roleOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedRoleOptionText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  successMessage: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  usersList: {
    marginTop: 10,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDetails: {
    marginBottom: 12,
  },
  userEmail: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  userRoom: {
    color: '#9ca3af',
    fontSize: 12,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noUsers: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noUsersText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  refetchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  refetchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  languageOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedLanguage: {
    backgroundColor: '#007bff',
  },
  languageOptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
  },
  modalClose: {
    marginTop: 10,
    paddingVertical: 12,
  },
  modalCloseText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Saved;