import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  formatNotificationTime,
  Notification,
} from '../services/notificationService';
import {checkAuthStatus} from '../utils/authGuard';

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const GoBack = () => {
    navigation.goBack();
  };

  // Load notifications from API
  useFocusEffect(
    React.useCallback(() => {
      const loadNotifications = async () => {
        setIsLoading(true);
        try {
          const authStatus = await checkAuthStatus();
          setIsAuthenticated(authStatus);

          if (authStatus) {
            const params: any = { limit: 50 };
            if (filter === 'unread') {
              params.isRead = false;
            } else if (filter === 'read') {
              params.isRead = true;
            }

            const notificationsData = await getUserNotifications(params);
            setNotifications(notificationsData);
          } else {
            setNotifications([]);
          }
        } catch (error) {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadNotifications();
    }, [filter])
  );

  // Handle notification press (mark as read)
  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? {...n, isRead: true, readAt: new Date().toISOString()} : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      try {
        const url = notification.actionUrl;
        
        // Handle different URL formats
        if (url.startsWith('/orders/') || url.includes('order')) {
          // Navigate to order details
          const orderId = url.split('/orders/')[1]?.split('/')[0] || url.split('order=')[1]?.split('&')[0];
          if (orderId) {
            navigation.navigate('OrderDetails', {orderId, order: undefined});
          } else {
            navigation.navigate('Orders');
          }
        } else if (url.startsWith('/products/') || url.includes('product')) {
          // Navigate to product details
          const productId = url.split('/products/')[1]?.split('/')[0] || url.split('product=')[1]?.split('&')[0];
          if (productId) {
            // Would need product details to navigate - for now just show toast
            toast.showToast('Product notification', 'info');
          }
        } else if (url.includes('support') || url.includes('chat')) {
          // Navigate to support
          navigation.navigate('Support');
        } else if (url.includes('profile') || url.includes('account')) {
          // Navigate to profile
          navigation.navigate('HomeScreen', {
            screen: 'Dashboard',
            params: {screen: 'Profile'},
          });
        } else if (url.startsWith('http')) {
          // External URL - could open in browser
          // For now, just log it
          console.log('External URL:', url);
          toast.showToast('External link: ' + url, 'info');
        } else {
          // Default: just log
          console.log('Navigate to:', url);
        }
      } catch (error) {
        console.error('Error navigating from notification:', error);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
              setNotifications(prev => prev.filter(n => n._id !== notificationId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const renderNotificationItem = ({item}: {item: Notification}) => {
    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <TouchableOpacity
              onPress={() => handleDeleteNotification(item._id)}
              style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {formatNotificationTime(item.createdAt)}
            </Text>
            {item.type && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
            )}
          </View>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notifications"
        onBackPress={GoBack}
        showBorder={true}
        rightComponent={
          unreadCount > 0 && isAuthenticated ? (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      {isAuthenticated && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}>
            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'read' && styles.filterTabActive]}
            onPress={() => setFilter('read')}>
            <Text style={[styles.filterText, filter === 'read' && styles.filterTextActive]}>
              Read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view notifications</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.white,
    borderRadius: r(12),
    marginBottom: Spacing[3],
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E7EB',
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
    borderColor: Colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  notificationMessage: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    marginBottom: Spacing[2],
    lineHeight: r(20),
  },
  notificationTime: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#9CA3AF',
  },
  unreadDot: {
    width: r(8),
    height: r(8),
    borderRadius: r(4),
    backgroundColor: Colors.primary,
    marginLeft: Spacing[2],
    alignSelf: 'flex-start',
    marginTop: Spacing[1],
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[1],
  },
  deleteButton: {
    width: r(24),
    height: r(24),
    borderRadius: r(12),
    backgroundColor: Colors.gray[200] || '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.gray[600] || '#6B7280',
    lineHeight: r(20),
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  typeBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[2],
    paddingVertical: r(2),
    borderRadius: r(4),
  },
  typeText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: r(8),
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D3D3D3',
  },
  filterTabActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
  },
  filterTextActive: {
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  markAllButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  markAllText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  loadingText: {
    marginTop: Spacing[4],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
});

export default NotificationsScreen;

