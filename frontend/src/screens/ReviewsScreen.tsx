import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {ReviewType, ScreenProps} from '../constants/types';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {EmptyStar} from '../assets/svgs/emptyStar';
import {activeStar} from '../assets/svgs/activeStar';
import {halfStar} from '../assets/svgs/halfstar';
import {CustomHeader} from '../components';
import {getReviews, Review} from '../services/reviewService';

const ReviewsScreen = ({route}: ScreenProps<'Reviews'>) => {
  const navigation = useNavigation<ScreenProps<'Reviews'>['navigation']>();
  const {reviews: routeReviews = [], productId, productTitle} = route.params || {};

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reviews from API if productId is provided
  useEffect(() => {
    const loadReviews = async () => {
      if (productId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await getReviews({ productId, limit: 50 });
          setReviews(response.reviews || []);
        } catch (err: any) {
          console.error('Error loading reviews:', err);
          setError('Failed to load reviews');
          // Fallback to route reviews if API fails
          if (routeReviews && routeReviews.length > 0) {
            setReviews(routeReviews as any);
          }
        } finally {
          setIsLoading(false);
        }
      } else if (routeReviews && routeReviews.length > 0) {
        // Use route reviews as fallback
        setReviews(routeReviews as any);
      }
    };

    loadReviews();
  }, [productId, routeReviews]);

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

  const renderReviewItem = ({item}: {item: Review | ReviewType}) => {
    // Handle both API Review format and legacy ReviewType format
    const userName = (item as Review).user?.name || (item as ReviewType).userName || 'Anonymous';
    const userAvatar = (item as Review).user?.avatar || (item as ReviewType).userAvatar;
    const rating = item.rating || 0;
    const comment = item.comment || '';
    const verifiedPurchase = (item as Review).verifiedPurchase;

    return (
      <View style={styles.reviewItem}>
        <View style={styles.avatarContainer}>
          <FastImage
            source={{
              uri: userAvatar || 
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
            }}
            style={styles.reviewAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        <View style={styles.reviewContent}>
          <View style={styles.reviewerHeader}>
            <Text style={styles.reviewerName}>
              {userName}
            </Text>
            {verifiedPurchase && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified Purchase</Text>
              </View>
            )}
          </View>
          <View style={styles.reviewStars}>
            {renderReviewStars(rating)}
          </View>
          {(item as Review).title && (
            <Text style={styles.reviewTitle}>{(item as Review).title}</Text>
          )}
          <Text style={styles.reviewText}>
            {comment}
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item, index) => (item as Review)._id || `review-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reviews yet</Text>
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
  reviewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: r(4),
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[2],
    paddingVertical: r(2),
    borderRadius: r(4),
  },
  verifiedText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
  },
  reviewTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: r(4),
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

export default ReviewsScreen;

