import {useNavigation, useFocusEffect} from '@react-navigation/native';
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
import {useToast} from '../hooks/useToast';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import ImagePicker from 'react-native-image-crop-picker';
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
import {protectScreen} from '../utils/authGuard';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  markConversationAsRead,
  type SupportConversation,
  type SupportMessage,
} from '../services/supportService';
import {getBaseURL} from '../services/axios';

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
    image?: string;
    order?: OrderData;
    isIssue?: boolean;
    timestamp: Date;
  }>;
}

const SupportScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
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
  const [currentConversation, setCurrentConversation] = useState<SupportConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_MESSAGE_LENGTH = 1000;

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

  // Load conversations and protect screen
  useFocusEffect(
    React.useCallback(() => {
      protectScreen(
        async () => {
          // User is authenticated, load conversations
          await loadConversations();
        },
        navigation,
        {
          redirectTo: 'login',
          actionType: 'access_support',
          actionData: {
            screen: 'Support',
            draftMessage: message,
            selectedIssue: selectedIssue,
          },
        }
      );
    }, [navigation, message, selectedIssue, loadConversations])
  );

  // Load conversations from API
  const loadConversations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const conversations = await getConversations();
      // If there's an open conversation, load it
      const openConversation = conversations.find(c => c.status === 'open');
      if (openConversation) {
        // Load full conversation with messages
        const fullConversation = await getConversation(openConversation._id);
        setCurrentConversation(fullConversation);
        // Convert API messages to display format
        const displayMessages = fullConversation.messages.map(msg => {
          const imageUrl = msg.attachments?.find(a => a.type === 'image')?.url;
          // Construct full URL if relative path
          const fullImageUrl = imageUrl && !imageUrl.startsWith('http') 
            ? `${getBaseURL()}${imageUrl}` 
            : imageUrl;
          
          return {
            type: msg.sender === 'user' ? 'user' : 'support' as const,
            text: msg.text,
            image: fullImageUrl,
            timestamp: new Date(msg.createdAt),
          };
        });
        setSupportSessionData(prev => ({
          ...prev,
          messages: displayMessages,
        }));
      } else {
        // No open conversation, reset state
        setCurrentConversation(null);
        setSupportSessionData(prev => ({
          ...prev,
          messages: [],
        }));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.showToast('Failed to load conversations', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const GoBack = () => {
    navigation.goBack();
  };

  const navigateToProfile = () => {
    // Navigate to Profile tab
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {
        screen: 'Profile',
      },
    });
  };

  // Step navigation handlers
  const handleNext = async () => {
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
        // Submit conversation to API
        await handleSubmitConversation();
        break;
    }
  };

  // Submit conversation to API
  const handleSubmitConversation = async () => {
    if (!supportSessionData.selectedIssue) return;

    setIsSubmitting(true);
    try {
      // Build initial message from session data
      let initialMessage = supportSessionData.selectedIssue;
      if (supportSessionData.selectedSubOption) {
        initialMessage += ` - ${supportSessionData.selectedSubOption}`;
      }
      if (supportSessionData.selectedOrderId) {
        initialMessage += ` (Order: ${supportSessionData.selectedOrderId})`;
      }
      if (message.trim()) {
        initialMessage += `\n\n${message.trim()}`;
      }

      // Collect image attachments
      const attachments = supportSessionData.messages
        .filter(msg => msg.image)
        .map(msg => ({
          uri: msg.image!,
          path: msg.image!,
          type: 'image/jpeg',
          filename: 'image.jpg',
        }));

      // Create conversation
      const conversation = await createConversation({
        subject: `${supportSessionData.selectedIssue}${supportSessionData.selectedSubOption ? ` - ${supportSessionData.selectedSubOption}` : ''}`,
        initialMessage,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      setCurrentConversation(conversation);
      toast.showToast('Support request submitted successfully!', 'success');
      
      // Clear form and reset to chat view
      setCurrentStep('issue-selection');
      setMessage('');
      setSelectedIssue('Order Issues');
      setSelectedSubOption(null);
      setSelectedOrderId(null);
    } catch (error: any) {
      console.error('Error submitting conversation:', error);
      toast.showToast(
        error.response?.data?.error || 'Failed to submit support request',
        'error'
      );
    } finally {
      setIsSubmitting(false);
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

  const handleGalleryPress = async () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: false,
      compressImageQuality: 0.8,
      includeBase64: false,
      mediaType: 'photo',
    })
      .then(async (image) => {
        // Add image message to chat
        const newMessage = {
          type: 'user' as const,
          image: image.path,
          timestamp: new Date(),
        };

        setSupportSessionData(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
        }));

        // If we have a conversation, send image to API
        if (currentConversation) {
          try {
            await sendMessage(currentConversation._id, {
              text: '', // Empty text for image-only messages
              attachments: [{
                uri: image.path,
                path: image.path,
                type: image.mime || 'image/jpeg',
                filename: image.filename || 'image.jpg',
              }],
            });
            // Reload conversation
            await loadConversations();
          } catch (error: any) {
            console.error('Error sending image:', error);
            toast.showToast(
              error.response?.data?.error || 'Failed to send image',
              'error'
            );
            // Remove image from UI on error
            setSupportSessionData(prev => ({
              ...prev,
              messages: prev.messages.filter((_, idx) => idx !== prev.messages.length - 1),
            }));
          }
        } else {
          // No conversation exists, create one with image
          try {
            const conversation = await createConversation({
              subject: 'Support Request with Image',
              initialMessage: 'Please see attached image',
              attachments: [{
                uri: image.path,
                path: image.path,
                type: image.mime || 'image/jpeg',
                filename: image.filename || 'image.jpg',
              }],
            });
            setCurrentConversation(conversation);
            await loadConversations();
            toast.showToast('Support request created', 'success');
          } catch (error: any) {
            console.error('Error creating conversation with image:', error);
            toast.showToast(
              error.response?.data?.error || 'Failed to send image',
              'error'
            );
            // Remove image from UI on error
            setSupportSessionData(prev => ({
              ...prev,
              messages: prev.messages.filter((_, idx) => idx !== prev.messages.length - 1),
            }));
          }
        }
      })
      .catch((error) => {
        if (error.code !== 'E_PICKER_CANCELLED') {
          if (error.code === 'E_PERMISSION_MISSING' || error.message?.includes('permission')) {
            toast.showToast('Photo library permission is required. Please enable it in your device settings.');
          } else {
            toast.showToast(error.message || 'Failed to open gallery');
          }
        }
      });
  };

  const handleMenuPress = () => {
  };

  const sendMessageToChat = async () => {
    if (message.trim() && message.length <= MAX_MESSAGE_LENGTH) {
      const messageText = message.trim();
      setMessage(''); // Clear input immediately for better UX

      // Optimistically add message to UI
      const newMessage = {
        type: 'user' as const,
        text: messageText,
        timestamp: new Date(),
      };

      setSupportSessionData(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // If we have a conversation, send message to API
      if (currentConversation) {
        try {
          await sendMessage(currentConversation._id, {
            text: messageText,
          });
          // Reload conversation to get support responses
          await loadConversations();
        } catch (error: any) {
          console.error('Error sending message:', error);
          toast.showToast(
            error.response?.data?.error || 'Failed to send message',
            'error'
          );
          // Remove optimistic message on error
          setSupportSessionData(prev => ({
            ...prev,
            messages: prev.messages.filter((_, idx) => idx !== prev.messages.length - 1),
          }));
          setMessage(messageText); // Restore message text
        }
      } else {
        // No conversation exists, create one first
        try {
          const conversation = await createConversation({
            subject: 'Support Request',
            initialMessage: messageText,
          });
          setCurrentConversation(conversation);
          await loadConversations();
          toast.showToast('Support request created', 'success');
        } catch (error: any) {
          console.error('Error creating conversation:', error);
          toast.showToast(
            error.response?.data?.error || 'Failed to create support request',
            'error'
          );
          // Remove optimistic message on error
          setSupportSessionData(prev => ({
            ...prev,
            messages: prev.messages.filter((_, idx) => idx !== prev.messages.length - 1),
          }));
          setMessage(messageText); // Restore message text
        }
      }
    }
  };

  const handleMessageChange = (text: string) => {
    if (text.length <= MAX_MESSAGE_LENGTH) {
      setMessage(text);
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
            <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
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
            if (msg.type === 'user') {
              if (msg.image) {
                // Render image message
                return (
                  <View key={index} style={styles.imageMessageContainer}>
                    <View style={styles.imageMessageBubble}>
                      <FastImage
                        source={{uri: msg.image}}
                        style={styles.messageImage}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  </View>
                );
              } else if (msg.text) {
                return (
                  <UserMessageBubble
                    key={index}
                    text={msg.text}
                    isIssue={msg.isIssue || false}
                  />
                );
              }
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
            {paddingBottom: (insets.bottom || 0) + Spacing[0]},
          ]}>
          <TextInput
            style={styles.messageInput}
            placeholder="Message"
            placeholderTextColor={Colors.gray[400] || '#9CA3AF'}
            value={message}
            onChangeText={handleMessageChange}
            onSubmitEditing={sendMessageToChat}
            multiline
            maxLength={MAX_MESSAGE_LENGTH}
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
    backgroundColor: Colors.primaryLight,
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
    alignItems: 'center',
    backgroundColor: Colors.gray[100] || '#F3F4F6',
    borderRadius: r(10),
    paddingHorizontal: Spacing[3],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    marginHorizontal: Spacing[5],
    minHeight: r(60),
    marginBottom: Spacing[6],
  },
  messageInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    paddingTop: Spacing[1],
    paddingBottom: Spacing[2],
    paddingHorizontal: Spacing[2],
    maxHeight: r(120),
    minHeight: r(36),
    textAlignVertical: 'top',
    includeFontPadding: false,
  },
  inputIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  imageMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing[2],
    paddingRight: Spacing[5],
  },
  imageMessageBubble: {
    borderRadius: r(10),
    overflow: 'hidden',
    maxWidth: '80%',
    backgroundColor: Colors.primaryLight,
    padding: r(2),
  },
  messageImage: {
    width: r(200),
    height: r(200),
    borderRadius: r(8),
  },
});

export default SupportScreen;
