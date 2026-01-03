import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {ReviewType, ScreenProps} from '../constants/types';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {EmptyStar} from '../assets/svgs/emptyStar';
import {activeStar} from '../assets/svgs/activeStar';
import {halfStar} from '../assets/svgs/halfstar';
import {CustomHeader} from '../components';

const ReviewsScreen = ({route}: ScreenProps<'Reviews'>) => {
  const navigation = useNavigation<ScreenProps<'Reviews'>['navigation']>();
  const {reviews = []} = route.params || {};

  const GoBack = () => {
    navigation.goBack();
  };

  // Render stars for reviews using EmptyStar
  const renderReviewStars = (rating: number) => {
    const normalizedRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const starsArray = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsArray.push(
          <SvgXml key={i} xml={activeStar} width={r(16)} height={r(16)} />
        );
      } else if (i === fullStars && hasHalfStar) {
        starsArray.push(
          <SvgXml key={i} xml={halfStar} width={r(16)} height={r(16)} />
        );
      } else {
        starsArray.push(
          <SvgXml key={i} xml={EmptyStar} width={r(16)} height={r(16)} />
        );
      }
    }
    return starsArray;
  };

  const renderReviewItem = ({item}: {item: ReviewType}) => {
    return (
      <View style={styles.reviewItem}>
        <View style={styles.avatarContainer}>
          <FastImage
            source={{
              uri: item?.userAvatar || 
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
            }}
            style={styles.reviewAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        <View style={styles.reviewContent}>
          <Text style={styles.reviewerName}>
            {item.userName}
          </Text>
          <View style={styles.reviewStars}>
            {renderReviewStars(item.rating)}
          </View>
          <Text style={styles.reviewText}>
            {item.comment}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <CustomHeader
          title="Reviews"
          onBackPress={GoBack}
          showCart={true}
          onCartPress={() => {}}
          showBorder={true}
        />
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item, index) => `review-${index}`}
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
  headerContainer: {
    paddingHorizontal: Spacing[5],
  },
  listContent: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[5],
    paddingTop: Spacing[3],
  },
  reviewItem: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[4],
    paddingBottom: Spacing[4],
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200] || '#E5E7EB',
  },
  avatarContainer: {
    width: r(50),
    height: r(50),
    borderRadius: r(25),
    borderWidth: r(2),
    borderColor: Colors.white,
    padding: r(2),
    backgroundColor: Colors.primaryLight,
  },
  reviewAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: r(23),
  },
  reviewContent: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: r(4),
  },
  reviewStars: {
    flexDirection: 'row',
    gap: r(2),
    marginBottom: r(4),
  },
  reviewText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    lineHeight: r(20),
  },
});

export default ReviewsScreen;

