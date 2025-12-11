import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {
  CustomHeader,
  ActionButtons,
  OrderCard,
  UserMessageBubble,
  OrderCardMessage,
} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  icons,
  issues,
  orderIssueOptions,
  orders,
  type IssueType,
  type OrderIssueOption,
} from '../constants';
import CheckIcon from '../assets/svgs/check.svg';
import {galleryIcon} from '../assets/svgs/galleryIcon';
import {menuListIcon} from '../assets/svgs/menuListIcon';
import type {OrderData} from '../components/OrderCard';

type StepType =
  | 'issue-selection'
  | 'sub-options'
  | 'order-selection'
  | 'final-step';

interface SupportSessionData {
  selectedIssue: IssueType | null;
  selectedSubOption: OrderIssueOption | null;
  selectedOrderId: string | null;
  messages: Array<{
    type: 'user' | 'support' | 'order-card';
    text?: string;
    order?: OrderData;
    isIssue?: boolean;
    timestamp: Date;
  }>;
}

const SupportScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedIssue, setSelectedIssue] = useState<IssueType>('Order Issues');
  const [message, setMessage] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepType>('issue-selection');
  const [selectedSubOption, setSelectedSubOption] =
    useState<OrderIssueOption | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [supportSessionData, setSupportSessionData] =
    useState<SupportSessionData>({
      selectedIssue: null,
      selectedSubOption: null,
      selectedOrderId: null,
      messages: [],
    });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const GoBack = () => {
    navigation.goBack();
  };

  // Step navigation handlers
  const handleNext = () => {
    switch (currentStep) {
      case 'issue-selection':
        if (selectedIssue) {
          setSupportSessionData(prev => ({
            ...prev,
            selectedIssue: selectedIssue,
            messages: [
              ...prev.messages,
              {
                type: 'user',
                text: selectedIssue,
                isIssue: true,
                timestamp: new Date(),
              },
            ],
          }));
          if (selectedIssue === 'Order Issues') {
            setCurrentStep('sub-options');
          } else {
            setCurrentStep('final-step');
          }
        }
        break;
      case 'sub-options':
        if (selectedIssue !== 'Order Issues') {
          setSupportSessionData(prev => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                type: 'user',
                text: selectedIssue,
                isIssue: true,
                timestamp: new Date(),
              },
            ],
          }));
          setCurrentStep('final-step');
          break;
        }
        if (selectedSubOption) {
          setSupportSessionData(prev => ({
            ...prev,
            selectedSubOption: selectedSubOption,
            messages: [
              ...prev.messages,
              {
                type: 'user',
                text: selectedSubOption,
                isIssue: true,
                timestamp: new Date(),
              },
            ],
          }));
          if (selectedSubOption === "I didn't receive my parcel") {
            setCurrentStep('order-selection');
          } else {
            setCurrentStep('final-step');
          }
        }
        break;
      case 'order-selection':
        if (selectedOrderId) {
          const selectedOrder = orders.find(o => o.id === selectedOrderId);
          if (selectedOrder) {
            setSupportSessionData(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  type: 'order-card',
                  order: selectedOrder,
                  timestamp: new Date(),
                },
              ],
            }));
          }
          setCurrentStep('final-step');
        }
        break;
      case 'final-step':
        break;
    }
  };

  const handleClose = () => {
    switch (currentStep) {
      case 'issue-selection':
        navigation.goBack();
        break;
      case 'sub-options':
        setCurrentStep('issue-selection');
        setSelectedSubOption(null);
        setSupportSessionData(prev => ({
          ...prev,
          selectedSubOption: null,
        }));
        break;
      case 'order-selection':
        setCurrentStep('sub-options');
        setSelectedOrderId(null);
        setSupportSessionData(prev => ({
          ...prev,
          selectedOrderId: null,
        }));
        break;
      case 'final-step':
        setCurrentStep('sub-options');
        break;
    }
  };

  const handleGalleryPress = () => {
    // TODO: Open gallery to attach images
  };

  const handleMenuPress = () => {
    // TODO: Show menu options
  };

  const sendMessageToChat = () => {
    if (message.trim()) {
      const newMessage = {
        type: 'user' as const,
        text: message.trim(),
        timestamp: new Date(),
      };

      setSupportSessionData(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      setMessage('');
    }
  };

  const getNextButtonLabel = (): string => {
    switch (currentStep) {
      case 'final-step':
        return 'Submit';
      default:
        return 'Next';
    }
  };

  const isNextDisabled = (): boolean => {
    switch (currentStep) {
      case 'issue-selection':
        return !selectedIssue;
      case 'sub-options':
        if (selectedIssue !== 'Order Issues') {
          return false;
        }
        return !selectedSubOption;
      case 'order-selection':
        return !selectedOrderId;
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <CustomHeader
          title="Support"
          onBackPress={GoBack}
          rightComponent={
            <TouchableOpacity style={styles.profileButton}>
              <FastImage
                source={icons.profileIcon}
                style={styles.profileIcon}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          }
          showBorder={true}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.welcomeBubble}>
            <Text style={styles.welcomeText}>
              Hello, Amanda! Welcome to Customer Care Service. We will be happy
              to help you. Please, provide us more details about your issue
              before we can start.
            </Text>
          </View>

          {supportSessionData.messages.map((msg, index) => {
            if (msg.type === 'user' && msg.text) {
              return (
                <UserMessageBubble
                  key={index}
                  text={msg.text}
                  isIssue={msg.isIssue || false}
                />
              );
            }
            if (msg.type === 'order-card' && msg.order) {
              return <OrderCardMessage key={index} order={msg.order} />;
            }
            return null;
          })}
        </ScrollView>

        {!isKeyboardVisible &&
          currentStep === 'issue-selection' &&
          supportSessionData.messages.length === 0 && (
            <>
              <View style={styles.issuePrompt}>
                <Text style={styles.issuePromptText}>What's your issue?</Text>
              </View>
              <View style={styles.issuesContainer}>
                {issues.map(issue => {
                  const isSelected = selectedIssue === issue;
                  return (
                    <TouchableOpacity
                      key={issue}
                      style={[
                        styles.issueButton,
                        isSelected && styles.issueButtonSelected,
                      ]}
                      onPress={() => {
                        setSelectedIssue(issue);
                        setSupportSessionData(prev => ({
                          ...prev,
                          selectedIssue: issue,
                        }));
                      }}>
                      {isSelected ? (
                        <LinearGradient
                          colors={['#FFCA28', '#F1D534']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 0}}
                          style={styles.issueButtonGradient}>
                          <View style={styles.checkmarkContainer}>
                            <CheckIcon />
                          </View>
                          <Text
                            style={[
                              styles.issueButtonText,
                              styles.issueButtonTextSelected,
                            ]}>
                            {issue}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.issueButtonContent}>
                          <Text style={styles.issueButtonText}>{issue}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
                <ActionButtons
                  onNext={handleNext}
                  onClose={handleClose}
                  nextLabel={getNextButtonLabel()}
                  nextDisabled={isNextDisabled()}
                />
              </View>
            </>
          )}

        {!isKeyboardVisible &&
          currentStep === 'sub-options' &&
          supportSessionData.messages.length <= 1 && (
            <>
              <LinearGradient
                colors={['#FFCA28', '#F1D534']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.subOptionHeader}>
                <Text style={styles.subOptionHeaderText}>{selectedIssue}</Text>
              </LinearGradient>
              <View style={styles.subOptionsContainer}>
                {selectedIssue === 'Order Issues' ? (
                  orderIssueOptions.map(option => {
                    const isSelected = selectedSubOption === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.issueButton,
                          isSelected && styles.issueButtonSelected,
                        ]}
                        onPress={() => {
                          setSelectedSubOption(option);
                          setSupportSessionData(prev => ({
                            ...prev,
                            selectedSubOption: option,
                          }));
                        }}>
                        {isSelected ? (
                          <LinearGradient
                            colors={['#FFCA28', '#F1D534']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            style={styles.issueButtonGradient}>
                            <View style={styles.checkmarkContainer}>
                              <CheckIcon />
                            </View>
                            <Text
                              style={[
                                styles.issueButtonText,
                                styles.issueButtonTextSelected,
                              ]}>
                              {option}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.issueButtonContent}>
                            <Text style={styles.issueButtonText}>{option}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.noSubOptionsContainer}>
                    <Text style={styles.noSubOptionsText}>
                      No additional options available for {selectedIssue}. Click
                      Next to continue.
                    </Text>
                  </View>
                )}
                <ActionButtons
                  onNext={handleNext}
                  onClose={handleClose}
                  nextLabel={getNextButtonLabel()}
                  nextDisabled={isNextDisabled()}
                />
              </View>
            </>
          )}

        {!isKeyboardVisible &&
          currentStep === 'order-selection' &&
          supportSessionData.messages.length <= 2 && (
            <>
              <LinearGradient
                colors={['#FFCA28', '#F1D534']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.subOptionHeader}>
                <Text style={styles.subOptionHeaderText}>Order Issues</Text>
              </LinearGradient>
              <View style={styles.orderSelectionContainer}>
                <ScrollView
                  style={styles.ordersScrollView}
                  contentContainerStyle={styles.ordersScrollContent}
                  showsVerticalScrollIndicator={false}>
                  {orders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrderId === order.id}
                      onSelect={orderId => {
                        setSelectedOrderId(orderId);
                        setSupportSessionData(prev => ({
                          ...prev,
                          selectedOrderId: orderId,
                        }));
                      }}
                    />
                  ))}
                </ScrollView>

                <ActionButtons
                  onNext={handleNext}
                  onClose={handleClose}
                  nextLabel={getNextButtonLabel()}
                  nextDisabled={isNextDisabled()}
                />
              </View>
            </>
          )}

        {!isKeyboardVisible &&
          currentStep === 'final-step' &&
          supportSessionData.messages.length === 0 && (
            <View style={styles.subOptionsContainer}>
              <LinearGradient
                colors={['#FFCA28', '#F1D534']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.finalStepHeader}>
                <Text style={styles.subOptionHeaderText}>
                  {selectedSubOption || selectedIssue}
                </Text>
              </LinearGradient>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepText}>
                  Please provide more details about your issue.
                </Text>
              </View>
              <ActionButtons
                onNext={handleNext}
                onClose={handleClose}
                nextLabel={getNextButtonLabel()}
                nextDisabled={isNextDisabled()}
              />
            </View>
          )}

        <View
          style={[
            styles.inputBar,
            {paddingBottom: (insets.bottom || 0) + Spacing[3]},
          ]}>
          <TextInput
            style={styles.messageInput}
            placeholder="Message"
            placeholderTextColor={Colors.gray[400] || '#9CA3AF'}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessageToChat}
            multiline
          />
          <View style={styles.inputIcons}>
            <TouchableOpacity
              style={styles.inputIconButton}
              onPress={handleGalleryPress}>
              <SvgXml xml={galleryIcon} width={r(20)} height={r(20)} />
            </TouchableOpacity>
            {message.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessageToChat}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.inputIconButton}
                onPress={handleMenuPress}>
                <SvgXml xml={menuListIcon} width={r(20)} height={r(20)} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  profileButton: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[200] || '#E5E7EB',
  },
  profileIcon: {
    width: '100%',
    height: '100%',
  },
  welcomeBubble: {
    backgroundColor: '#FFEEF1',
    borderRadius: r(12),
    padding: Spacing[3],
    width: '80%',
    marginBottom: Spacing[3],
  },
  welcomeText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    lineHeight: r(18),
  },
  issuePrompt: {
    backgroundColor: '#FFCA28',
    borderRadius: r(10),
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[2],
  },
  issuePromptText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  subOptionHeader: {
    borderTopLeftRadius: r(10),
    borderTopRightRadius: r(10),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[2],
    alignItems: 'flex-start',
  },
  finalStepHeader: {
    borderTopLeftRadius: r(10),
    borderTopRightRadius: r(10),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    marginHorizontal: 0,
    alignItems: 'flex-start',
  },
  subOptionHeaderText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  issuesContainer: {
    marginHorizontal: Spacing[5],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    backgroundColor: '#FFF9ED',
  },
  subOptionsContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    backgroundColor: '#FFF9ED',
    marginHorizontal: Spacing[5],
  },
  nextStepContent: {
    paddingVertical: Spacing[4],
  },
  nextStepText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    textAlign: 'center',
  },
  issueButton: {
    borderRadius: r(10),
    borderWidth: r(0.7),
    backgroundColor: Colors.white,
    marginBottom: Spacing[2],
    minHeight: r(44),
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  issueButtonSelected: {
    borderWidth: 0,
  },
  issueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: r(10),
    minHeight: r(44),
  },
  issueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    minHeight: r(44),
  },
  checkmarkContainer: {
    marginRight: Spacing[2],
  },
  issueButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    flexShrink: 1,
  },
  issueButtonTextSelected: {
    fontFamily: FontFamilies.msemibold,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.gray[100] || '#F3F4F6',
    borderRadius: r(10),
    paddingHorizontal: Spacing[3],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[3],
    marginHorizontal: Spacing[5],
    minHeight: r(60),
    marginBottom: Spacing[6],
  },
  messageInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[2],
    maxHeight: r(120),
    minHeight: r(40),
  },
  inputIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  inputIconButton: {
    padding: Spacing[1],
  },
  sendButton: {
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
    borderRadius: r(6),
    backgroundColor: Colors.red[500] || '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
  noSubOptionsContainer: {
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  noSubOptionsText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
    textAlign: 'center',
  },
  orderSelectionContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    backgroundColor: '#FFF9ED',
    marginHorizontal: Spacing[5],
    flex: 1,
  },
  ordersScrollView: {
    flex: 1,
    backgroundColor: '#FFF9ED',
    paddingHorizontal: Spacing[3],
  },
  ordersScrollContent: {
    paddingBottom: Spacing[2],
  },
});

export default SupportScreen;
