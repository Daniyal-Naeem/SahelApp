import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();

  const GoBack = () => {
    navigation.goBack();
  };

  // Dummy notifications data
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'New Product Available',
      message: 'Check out our latest collection of summer dresses',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped and will arrive soon',
      time: '1 day ago',
      isRead: false,
    },
    {
      id: '3',
      title: 'Special Offer',
      message: 'Get 30% off on all beauty products this weekend',
      time: '2 days ago',
      isRead: true,
    },
    {
      id: '4',
      title: 'Welcome Bonus',
      message: 'You have received a welcome bonus of 100 points',
      time: '3 days ago',
      isRead: true,
    },
  ];

  const renderNotificationItem = ({item}: {item: NotificationItem}) => {
    return (
      <View style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notifications"
        onBackPress={GoBack}
        showBorder={true}
      />

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    borderColor: Colors.primary || '#F83758',
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
    backgroundColor: Colors.primary || '#F83758',
    marginLeft: Spacing[2],
    alignSelf: 'flex-start',
    marginTop: Spacing[1],
  },
});

export default NotificationsScreen;

