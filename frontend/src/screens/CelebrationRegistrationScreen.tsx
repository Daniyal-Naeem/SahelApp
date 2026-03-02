import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  registerCelebration,
  getUserCelebrations,
  formatCelebrationType,
  formatEventDate,
  type CelebrationEvent,
  type RegisterCelebrationPayload,
} from '../services/celebrationService';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';
import {Platform} from 'react-native';

const CELEBRATION_TYPES = [
  {value: 'birthday', label: 'Birthday', icon: '🎂'},
  {value: 'wedding', label: 'Wedding', icon: '💒'},
  {value: 'newborn', label: 'Newborn', icon: '👶'},
  {value: 'anniversary', label: 'Anniversary', icon: '💝'},
  {value: 'other', label: 'Other', icon: '🎉'},
] as const;

const CelebrationRegistrationScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCelebrations, setUserCelebrations] = useState<CelebrationEvent[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState<RegisterCelebrationPayload>({
    type: 'birthday',
    eventDate: new Date().toISOString(),
    name: '',
    description: '',
    isRecurring: true,
    notifyBeforeDays: 7,
  });

  const [errors, setErrors] = useState({
    type: '',
    eventDate: '',
    name: '',
  });

  const GoBack = () => {
    navigation.goBack();
  };

  // Load user celebrations
  const loadCelebrations = async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const celebrations = await getUserCelebrations();
        setUserCelebrations(celebrations);
      }
    } catch (error: any) {
      console.error('Error loading celebrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCelebrations();
    }, [])
  );

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      type: '',
      eventDate: '',
      name: '',
    };

    if (!form.type) {
      newErrors.type = 'Please select a celebration type';
    }

    if (!form.eventDate) {
      newErrors.eventDate = 'Please select an event date';
    } else {
      const eventDate = new Date(form.eventDate);
      if (isNaN(eventDate.getTime())) {
        newErrors.eventDate = 'Invalid date';
      }
    }

    setErrors(newErrors);
    return !newErrors.type && !newErrors.eventDate;
  };

  // Handle date picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setForm({...form, eventDate: selectedDate.toISOString()});
      setErrors({...errors, eventDate: ''});
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCelebration(form);
      toast.showToast('Celebration registered successfully!', 'success');
      
      // Reset form
      setForm({
        type: 'birthday',
        eventDate: new Date().toISOString(),
        name: '',
        description: '',
        isRecurring: true,
        notifyBeforeDays: 7,
      });
      
      // Reload celebrations
      await loadCelebrations();
    } catch (error: any) {
      toast.showToast(
        error.response?.data?.error || 'Failed to register celebration',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete celebration
  const handleDeleteCelebration = (celebrationId: string) => {
    Alert.alert(
      'Delete Celebration',
      'Are you sure you want to delete this celebration event?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const {deleteCelebration} = await import('../services/celebrationService');
              await deleteCelebration(celebrationId);
              toast.showToast('Celebration deleted successfully', 'success');
              await loadCelebrations();
            } catch (error: any) {
              toast.showToast('Failed to delete celebration', 'error');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Register Celebration"
        onBackPress={GoBack}
        showBorder={true}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please login to register celebration events
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Celebration Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Celebration Type</Text>
            <View style={styles.typeContainer}>
              {CELEBRATION_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    form.type === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    setForm({...form, type: type.value});
                    setErrors({...errors, type: ''});
                  }}>
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      form.type === type.value && styles.typeLabelActive,
                    ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type ? (
              <Text style={styles.errorText}>{errors.type}</Text>
            ) : null}
          </View>

          {/* Event Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {form.eventDate
                  ? formatEventDate(form.eventDate)
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(form.eventDate)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            {errors.eventDate ? (
              <Text style={styles.errorText}>{errors.eventDate}</Text>
            ) : null}
          </View>

          {/* Name (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Name {form.type === 'birthday' && '(Person\'s Name)'}
              {form.type === 'wedding' && '(Couple Names)'}
              {form.type === 'newborn' && '(Baby\'s Name)'}
            </Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={text => {
                setForm({...form, name: text});
                setErrors({...errors, name: ''});
              }}
              placeholder="Enter name (optional)"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          {/* Description (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={text => setForm({...form, description: text})}
              placeholder="Add any additional details"
              placeholderTextColor={Colors.gray[400]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Recurring Toggle */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setForm({...form, isRecurring: !form.isRecurring})
              }>
              <View
                style={[
                  styles.checkboxBox,
                  form.isRecurring && styles.checkboxBoxChecked,
                ]}>
                {form.isRecurring && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Recurring event (remind me every year)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Register Celebration</Text>
            )}
          </TouchableOpacity>

          {/* User's Registered Celebrations */}
          {userCelebrations.length > 0 && (
            <View style={styles.celebrationsSection}>
              <Text style={styles.sectionTitle}>My Celebrations</Text>
              {userCelebrations.map(celebration => (
                <View key={celebration._id} style={styles.celebrationCard}>
                  <View style={styles.celebrationHeader}>
                    <Text style={styles.celebrationType}>
                      {formatCelebrationType(celebration.type)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteCelebration(celebration._id)}>
                      <Text style={styles.deleteButton}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  {celebration.name && (
                    <Text style={styles.celebrationName}>{celebration.name}</Text>
                  )}
                  <Text style={styles.celebrationDate}>
                    {formatEventDate(celebration.eventDate)}
                  </Text>
                  {celebration.isRecurring && (
                    <Text style={styles.recurringBadge}>Recurring</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing[4],
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderRadius: r(8),
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[5],
  },
  section: {
    marginBottom: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[4],
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: r(2),
    borderColor: Colors.gray[200],
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  typeIcon: {
    fontSize: r(32),
    marginBottom: Spacing[2],
  },
  typeLabel: {
    fontSize: FontSizes.sm,
    color: Colors.black[100],
    fontFamily: FontFamilies.msemibold,
    textAlign: 'center',
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  dateButton: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.gray[200],
    borderRadius: r(8),
    padding: Spacing[4],
  },
  dateButtonText: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing[2],
  },
  datePickerButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  datePickerButtonText: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.gray[200],
    borderRadius: r(8),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  textArea: {
    minHeight: r(80),
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.red[500],
    fontFamily: FontFamilies.mregular,
    marginTop: Spacing[2],
  },
  checkboxContainer: {
    marginBottom: Spacing[6],
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: r(20),
    height: r(20),
    borderWidth: r(2),
    borderColor: Colors.gray[300],
    borderRadius: r(4),
    marginRight: Spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mbold,
  },
  checkboxLabel: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: r(12),
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[4],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
  },
  celebrationsSection: {
    marginTop: Spacing[8],
    paddingTop: Spacing[6],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
  },
  celebrationCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[3],
  },
  celebrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  celebrationType: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  deleteButton: {
    fontSize: FontSizes.sm,
    color: Colors.red[500],
    fontFamily: FontFamilies.mregular,
  },
  celebrationName: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[1],
  },
  celebrationDate: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500],
  },
  recurringBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: r(8),
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontFamily: FontFamilies.msemibold,
    marginTop: Spacing[2],
  },
});

export default CelebrationRegistrationScreen;
