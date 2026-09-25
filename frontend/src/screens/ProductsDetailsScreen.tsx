import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useToast} from '../hooks/useToast';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import {SvgXml} from 'react-native-svg';
import {RouteStackParamList} from '../../App';
import {ProductItem, CustomHeader} from '../components';
import {DetailedProductData} from '../constants/data';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  VariationType,
  SpecificationType,
  DeliveryOptionType,
  ItemDetails,
} from '../constants/types';
import {useAppDispatch, useAppSelector} from '../store';
import {addToCart} from '../store/cartSlice';
import {requireCheckoutAuth} from '../utils/requireCheckoutAuth';
import {getProductById} from '../services/productService';
import {formatMoney} from '../utils/formatMoney';
import {activeStar} from '../assets/svgs/activeStar';
import {inactiveStar} from '../assets/svgs/inactiveStar';
import {halfStar} from '../assets/svgs/halfstar';
import {EmptyStar} from '../assets/svgs/emptyStar';
import {rightArrowWhite} from '../assets/svgs/rightArrowWhite';
import {returnPolicy} from '../assets/svgs/ReturnPolicy';
import {FeaturesData} from '../tabs/HomeTab';
import {nearestStore} from '../assets/svgs/nearestStore';
import {VIPIconNew} from '../assets/svgs/VIPIconNew';
import {sendGift} from '../assets/svgs/sendGift';
import {addtoCard} from '../assets/svgs/addtoCard';
import {buyNow} from '../assets/svgs/buyNow';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

const normalizeProduct = (raw: any): ItemDetails => {
  const vendor =
    typeof raw?.vendor === 'string'
      ? raw.vendor
      : raw?.vendor?.businessName || raw?.vendor?.name || '';
  const images = Array.isArray(raw?.image)
    ? raw.image.filter((img: unknown) => typeof img === 'string' && img.length > 0)
    : [];
  return {
    ...raw,
    vendor,
    image: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
    title: raw?.title || 'Product',
    description: raw?.description || '',
    price: Number(raw?.price) || 0,
    priceBeforeDeal: Number(raw?.priceBeforeDeal) || Number(raw?.price) || 0,
    priceOff: raw?.priceOff ?? '',
    stars: Number(raw?.stars) || 0,
    numberOfReview: Number(raw?.numberOfReview) || 0,
  } as ItemDetails;
};

type ScreenRouteProps = RouteProp<RouteStackParamList, 'ProductDetails'>;

const ProductsDetailsScreen = () => {
  const route = useRoute<ScreenRouteProps>();
  const productId =
    route.params?.productId || route.params?.itemDetails?._id || '';
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector(state => state.cart.itemCount);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const toast = useToast();

  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(
    route.params?.itemDetails
      ? normalizeProduct(route.params.itemDetails)
      : null,
  );
  const [loadingProduct, setLoadingProduct] = useState(!route.params?.itemDetails);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<
    number | null
  >(null);
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState<number>(-1);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!productId) {
        setLoadError('Product not found');
        setLoadingProduct(false);
        return;
      }
      setLoadingProduct(true);
      setLoadError(null);
      try {
        const raw = await getProductById(productId);
        if (cancelled) return;
        const normalized = normalizeProduct(raw);
        setItemDetails(normalized);
        if (normalized.variations?.length && normalized.variations[0]?.options?.length) {
          setSelectedVariationIndex(0);
        }
        if (normalized.deliveryOptions?.length) {
          setSelectedDeliveryIndex(0);
        }
        if (normalized.colorOptions?.length) {
          const idx =
            normalized.colorOptions.findIndex(
              (opt: {isSelected?: boolean}) => opt.isSelected,
            ) ?? -1;
          setSelectedColorIndex(idx >= 0 ? idx : 0);
        }
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err?.response?.data?.error || 'Failed to load product');
        }
      } finally {
        if (!cancelled) {
          setLoadingProduct(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const baseProductImages = useMemo(() => {
    const images = itemDetails?.image;
    if (Array.isArray(images) && images.length > 0) {
      return images;
    }
    return [PLACEHOLDER_IMAGE];
  }, [itemDetails?.image]);

  const currency = (itemDetails as any)?.currency || 'SAR';
  const screenWidth = Dimensions.get('window').width;
  const carouselWidth = screenWidth - Spacing[5] * 2;
  const availableButtonWidth = screenWidth - Spacing[5] * 2;

  const GoBack = () => {
    navigation.goBack();
  };

  const handleAddToCart = async () => {
    if (!itemDetails) return;

    const allVariationOptions =
      itemDetails?.variations?.flatMap((variation: VariationType) =>
        (variation?.options || []).map(
          (opt: {value?: string; label?: string; image?: string}) => ({
            value: opt?.value || '',
            label: opt?.label || '',
            image: opt?.image,
          }),
        ),
      ) || [];
    const displayedVariations = allVariationOptions.slice(0, 2);

    let selectedVariation: string | undefined;
    if (selectedVariationIndex !== null && displayedVariations[selectedVariationIndex]) {
      const selectedOption = displayedVariations[selectedVariationIndex];
      selectedVariation = selectedOption.value || selectedOption.label;
    }

    let selectedColor: string | undefined;
    if (selectedColorIndex !== null && itemDetails.colorOptions?.[selectedColorIndex]) {
      const selectedColorOption = itemDetails.colorOptions[selectedColorIndex];
      selectedColor = selectedColorOption.color || selectedColorOption.name;
    }

    let selectedDelivery: string | undefined;
    if (selectedDeliveryIndex >= 0 && itemDetails.deliveryOptions?.[selectedDeliveryIndex]) {
      const selectedDeliveryOption = itemDetails.deliveryOptions[selectedDeliveryIndex];
      selectedDelivery = selectedDeliveryOption.type || `${selectedDeliveryOption.duration} - ${selectedDeliveryOption.price}`;
    }

    const rawVendor = (itemDetails as any)?.vendor;
    const vendorLabel =
      typeof rawVendor === 'string'
        ? rawVendor
        : rawVendor?.businessName || rawVendor?.name || '';

    // Keep cart payloads light — avoid storing huge base64 blobs / nested objects.
    const images = Array.isArray(itemDetails.image)
      ? itemDetails.image
          .filter((img: unknown) => typeof img === 'string' && img.length > 0)
          .slice(0, 1)
          .map((img: string) =>
            img.startsWith('data:') && img.length > 200_000
              ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
              : img,
          )
      : [];

    const cartItem = {
      _id: itemDetails._id,
      title: itemDetails.title || 'Product',
      description: itemDetails.description || '',
      image: images.length
        ? images
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
      price: Number(itemDetails.price) || 0,
      priceBeforeDeal:
        Number(itemDetails.priceBeforeDeal) || Number(itemDetails.price) || 0,
      priceOff: String(itemDetails.priceOff ?? '0'),
      stars: Number(itemDetails.stars) || 0,
      numberOfReview: Number(itemDetails.numberOfReview) || 0,
      tags: itemDetails.tags || [],
      createdAt: itemDetails.createdAt || '',
      updatedAt: itemDetails.updatedAt || '',
      __v: itemDetails.__v || 0,
      vendor: vendorLabel,
      quantity: 1,
      selectedVariation,
      selectedColor,
      selectedDelivery,
    };

    dispatch(addToCart(cartItem as any));
    toast.showToast(`${itemDetails.title} has been added to your cart`);

    try {
      const {getItem} = await import('../utils/AsyncStorage');
      const token = await getItem('token');
      // Guests keep a local cart; sync to server only when signed in.
      if (!token) {
        return;
      }
      const {addCartItem} = await import('../services/cartService');
      await addCartItem({
        productId: itemDetails._id,
        quantity: 1,
        selectedVariation,
        selectedColor,
        selectedDelivery,
      });
    } catch (error: any) {
      toast.showToast(
        error?.response?.data?.error || 'Saved locally — sync when online',
      );
    }
  };

  const navigateToCartTab = () => {
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {
        screen: 'Cart',
      },
    });
  };

  const NavigateToCheckout = () => {
    if (!requireCheckoutAuth(isAuthenticated, navigation)) {
      return;
    }
    navigation.navigate('Checkout', {itemDetails: itemDetails!});
  };

  const NavigateToSendGift = () => {
    (navigation as any).navigate('HomeScreen', {
      screen: 'Gifts',
    });
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starsArray = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsArray.push(
          <SvgXml key={i} xml={activeStar} width={r(16)} height={r(16)} />,
        );
      } else if (i === fullStars && hasHalfStar) {
        starsArray.push(
          <SvgXml key={i} xml={halfStar} width={r(16)} height={r(16)} />,
        );
      } else {
        starsArray.push(
          <SvgXml key={i} xml={inactiveStar} width={r(16)} height={r(16)} />,
        );
      }
    }
    return starsArray;
  };

  const renderReviewStars = (rating: number) => {
    const normalizedRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const starsArray = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsArray.push(
          <SvgXml key={i} xml={activeStar} width={r(16)} height={r(16)} />,
        );
      } else if (i === fullStars && hasHalfStar) {
        starsArray.push(
          <SvgXml key={i} xml={halfStar} width={r(16)} height={r(16)} />,
        );
      } else {
        starsArray.push(
          <SvgXml key={i} xml={EmptyStar} width={r(16)} height={r(16)} />,
        );
      }
    }
    return starsArray;
  };

  const allVariationOptions =
    itemDetails?.variations?.flatMap((variation: VariationType) =>
      (variation?.options || []).map(
        (opt: {
          label?: string;
          isSelected?: boolean;
          image?: string | null;
          value?: string;
        }) => ({
          label: opt?.label || '',
          isSelected: opt?.isSelected || false,
          variationType: variation?.type || '',
          image: opt?.image || null,
          value: opt?.value || '',
        }),
      ),
    ) || [];

  const displayedVariations = allVariationOptions.slice(0, 2);
  const hasMoreVariations = allVariationOptions.length > 2;

  const getProductImages = () => {
    if (
      selectedVariationIndex !== null &&
      displayedVariations[selectedVariationIndex]
    ) {
      const selectedOption = displayedVariations[selectedVariationIndex];

      if (selectedOption?.image) {
        const variationImages =
          itemDetails?.variations?.flatMap((variation: VariationType) =>
            (variation?.options || [])
              .filter(
                (opt: {value?: string; label?: string}) =>
                  opt?.value === selectedOption.value ||
                  opt?.label === selectedOption.label,
              )
              .map((opt: {image?: string | null}) => opt?.image)
              .filter(Boolean),
          ) || [];

        if (variationImages.length > 0) {
          return variationImages as string[];
        }

        return [selectedOption.image, ...baseProductImages].filter(Boolean);
      }
    }
    return baseProductImages;
  };

  const productImages = (() => {
    const images = getProductImages();
    if (Array.isArray(images) && images.length > 0) {
      return images.filter(
        (img): img is string => typeof img === 'string' && img.length > 0,
      );
    }
    return [PLACEHOLDER_IMAGE];
  })();

  const getAllVariationImagesWithInfo = () => {
    const imagesWithInfo: Array<{
      image: string;
      variationValue: string;
      variationLabel: string;
    }> = [];

    itemDetails?.variations?.forEach((variation: VariationType) => {
      variation?.options?.forEach(
        (opt: {image?: string; value?: string; label?: string}) => {
          if (
            opt?.image &&
            typeof opt.image === 'string' &&
            opt.image.trim() !== ''
          ) {
            imagesWithInfo.push({
              image: opt.image,
              variationValue: opt?.value || '',
              variationLabel: opt?.label || '',
            });
          }
        },
      );
    });

    const uniqueImages = Array.from(
      new Map(imagesWithInfo.map(item => [item.image, item])).values(),
    );

    return uniqueImages;
  };

  const variationImagesWithInfo = getAllVariationImagesWithInfo();

  const displayVariationImages =
    variationImagesWithInfo.length > 0
      ? variationImagesWithInfo.map(item => item.image)
      : [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
          'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400',
        ];

  const isImageForSelectedVariation = (imageUrl: string) => {
    if (selectedVariationIndex === null) return false;

    const selectedOption = displayedVariations[selectedVariationIndex];
    if (!selectedOption) return false;

    return variationImagesWithInfo.some(
      item =>
        item.image === imageUrl &&
        (item.variationValue === selectedOption.value ||
          item.variationLabel === selectedOption.label),
    );
  };

  const handleVariationSelect = (index: number) => {
    if (index >= 0 && index < displayedVariations.length) {
      setSelectedVariationIndex(index);
      setCurrentImageIndex(0);
    }
  };

  const getShortVariationName = (label: string) => {
    if (!label) return '';

    const trimmed = label.trim();
    const firstWord = trimmed.split(/\s+/)[0];

    if (firstWord.length === 1 && /[A-Za-z]/.test(firstWord)) {
      return firstWord.toUpperCase();
    }

    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const handleViewAllVariations = () => {
  };

  if (loadingProduct) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomHeader showLogo onBackPress={GoBack} showBorder />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.statusText}>Loading product…</Text>
      </View>
    );
  }

  if (loadError || !itemDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomHeader showLogo onBackPress={GoBack} showBorder />
        <Text style={styles.statusText}>{loadError || 'Product not found'}</Text>
        <TouchableOpacity onPress={GoBack} style={styles.retryButton}>
          <Text style={styles.retryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <CustomHeader
        showLogo={true}
        onBackPress={GoBack}
        showCart={true}
        onCartPress={navigateToCartTab}
        cartCount={cartItemCount}
        showBorder={true}
      />

      {/* Image Carousel */}
      <View style={styles.carouselContainer}>
        <Carousel
          loop={false}
          width={carouselWidth}
          height={r(236)}
          data={productImages}
          scrollAnimationDuration={1000}
          onSnapToItem={index => setCurrentImageIndex(index)}
          renderItem={({item}: {item: string}) => (
            <FastImage
              source={{uri: item}}
              style={styles.carouselImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
        />
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {productImages.length <= 5
            ? productImages.map((_: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))
            : Array.from({length: 5}, (_, i) => {
                const startIndex =
                  currentImageIndex <= 2
                    ? 0
                    : currentImageIndex >= productImages.length - 3
                    ? productImages.length - 5
                    : currentImageIndex - 2;
                const index = startIndex + i;
                return (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                );
              })}
        </View>
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {currency} {formatMoney(itemDetails?.price)}
            </Text>
            <Text style={styles.priceBeforeDeal}>
              {currency} {formatMoney(itemDetails?.priceBeforeDeal)}
            </Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{itemDetails?.priceOff} Off</Text>
          </View>
        </View>
      </View>

      {/* Product Name and Subtitle */}
      <Text style={styles.productName}>{itemDetails?.title}</Text>
      <Text style={styles.subtitle}>{itemDetails?.subtitle}</Text>
      {itemDetails?.vendor && (
        <View style={styles.vendorContainer}>
          <Text style={styles.vendorPrefix}>by </Text>
          <Text style={styles.vendorName}>
            {typeof itemDetails.vendor === 'string'
              ? itemDetails.vendor
              : (itemDetails.vendor as any)?.businessName ||
                (itemDetails.vendor as any)?.name ||
                ''}
          </Text>
        </View>
      )}

      {/* Rating */}
      <View style={styles.ratingRow}>
        <View style={styles.starsContainer}>
          {renderStars(itemDetails?.stars || 0)}
        </View>
        <Text style={styles.reviewCount}>
          {formatNumber(itemDetails?.numberOfReview || 0)}
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.descriptionTitle}>Description:</Text>
        <Text
          style={styles.descriptionText}
          numberOfLines={isDescriptionExpanded ? undefined : 3}>
          {itemDetails?.description}
        </Text>
        <TouchableOpacity
          onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
          <Text style={styles.moreText}>
            {isDescriptionExpanded ? 'Less' : 'More'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Three Buttons: Nearest Store, VIP, Return policy */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.infoButton, {maxWidth: availableButtonWidth}]}>
          <SvgXml xml={nearestStore} />
          <Text
            style={styles.infoButtonText}
            numberOfLines={1}
            ellipsizeMode="tail">
            Nearest Store
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.infoButton, {maxWidth: availableButtonWidth}]}>
          <SvgXml xml={VIPIconNew} />
          <Text
            style={styles.infoButtonText}
            numberOfLines={1}
            ellipsizeMode="tail">
            VIP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.infoButton, {maxWidth: availableButtonWidth}]}>
          <SvgXml xml={returnPolicy} />
          <Text
            style={styles.infoButtonText}
            numberOfLines={1}
            ellipsizeMode="tail">
            Return policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Variations Section */}
      {itemDetails?.variations && allVariationOptions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.variationsHeader}>
            <Text style={styles.variationsTitle}>Variations</Text>
            <View style={styles.variationsChipsRow}>
              {displayedVariations.map(
                (
                  option: {label: string; isSelected: boolean; value: string},
                  index: number,
                ) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleVariationSelect(index)}
                    style={[
                      styles.variationChip,
                      selectedVariationIndex === index || option.isSelected
                        ? styles.variationChipSelected
                        : styles.variationChipUnselected,
                    ]}>
                    <Text style={styles.variationText} numberOfLines={1}>
                      {getShortVariationName(option.label)}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
            {hasMoreVariations && (
              <TouchableOpacity
                style={styles.variationArrowButton}
                onPress={handleViewAllVariations}>
                <SvgXml xml={rightArrowWhite} width={r(16)} height={r(16)} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.variationImagesContainer}>
            <FlatList
              data={displayVariationImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({item, index}) => {
                const isSelectedImage = isImageForSelectedVariation(item);

                return (
                  <View style={styles.variationImageWrapper}>
                    {index > 0 && (
                      <View style={styles.variationImageSeparator} />
                    )}
                    <View
                      style={[
                        styles.variationImageContainer,
                        isSelectedImage && styles.variationImageSelected,
                      ]}>
                      <FastImage
                        source={{uri: item}}
                        style={styles.variationImage}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  </View>
                );
              }}
              keyExtractor={(item, index) => `variation-${index}`}
              contentContainerStyle={styles.variationImagesList}
            />
          </View>
        </View>
      )}

      {/* Specifications Section */}
      {itemDetails?.specifications && itemDetails.specifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.specificationTitle}>Specifications</Text>
          <View style={styles.specificationsContent}>
            <Text style={styles.sectionTitle}>Material:</Text>
            <View style={styles.specificationsContainer}>
              {itemDetails.specifications
                .filter((spec: SpecificationType) => spec.label === 'Material')
                .map((spec: SpecificationType, index: number) => (
                  <View key={index} style={styles.specChip}>
                    <Text style={styles.specText}>{spec.value}</Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      )}

      {/* Delivery Section */}
      {itemDetails?.deliveryOptions &&
        itemDetails.deliveryOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery:</Text>
            <View style={styles.deliveryOptionsContainer}>
              {itemDetails.deliveryOptions.map(
                (option: DeliveryOptionType, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDeliveryIndex(index)}
                    style={[
                      styles.deliveryOption,
                      selectedDeliveryIndex >= 0 &&
                        selectedDeliveryIndex === index &&
                        styles.deliveryOptionSelected,
                    ]}>
                    <View style={styles.deliveryContent}>
                      <Text style={styles.deliveryType}>{option.type}</Text>
                      <View style={styles.deliveryDurationBadge}>
                        <Text style={styles.deliveryDuration}>
                          {option.duration}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.deliveryPrice}>
                      {currency} {formatMoney(option.price)}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        )}

      {/* Color Section */}
      {itemDetails?.colorOptions && itemDetails.colorOptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color:</Text>
          <View style={styles.colorContainer}>
            {itemDetails.colorOptions.map(
              (
                colorOption: {
                  color: string;
                  name: string;
                  isSelected?: boolean;
                },
                index: number,
              ) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedColorIndex(index)}
                  style={[
                    styles.colorSwatch,
                    selectedColorIndex === index && styles.colorSwatchSelected,
                  ]}>
                  <View
                    style={[
                      styles.colorSwatchInner,
                      {backgroundColor: colorOption.color},
                    ]}
                  />
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
      )}

      {/* Rating & Reviews Section */}
      {itemDetails?.reviews && itemDetails.reviews.length > 0 && (
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Rating & Reviews</Text>
            {itemDetails.reviews.length > 1 && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Reviews', {
                    reviews: itemDetails.reviews || [],
                    productTitle: itemDetails?.title || '',
                  });
                }}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.ratingDisplay}>
            <View style={styles.starsContainer}>
              {renderReviewStars(itemDetails.stars || 0)}
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingNumber}>{itemDetails.stars}/5</Text>
            </View>
          </View>
          <View style={styles.reviewItem}>
            <FastImage
              source={{
                uri:
                  itemDetails.reviews[0]?.userAvatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
              }}
              style={styles.reviewAvatar}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewerName}>
                {itemDetails.reviews[0].userName}
              </Text>
              <View style={styles.reviewStars}>
                {renderReviewStars(itemDetails.reviews[0].rating)}
              </View>
              <Text style={styles.reviewText} numberOfLines={3}>
                {itemDetails.reviews[0].comment}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.sendGiftButton}
          onPress={NavigateToSendGift}>
          <SvgXml xml={sendGift} />
          <Text style={styles.sendGiftText}>Send as Gift</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}>
          <SvgXml xml={addtoCard} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.buyNowButton}
        onPress={NavigateToCheckout}>
        <SvgXml xml={buyNow} />
        <Text style={styles.buyNowText}>Buy Now</Text>
      </TouchableOpacity>

      {/* Similar Items Section */}
      <View style={styles.similarSection}>
        <View style={styles.similarHeader}>
          <Text style={styles.similarTitle}>Similar Items</Text>
          <View style={styles.similarActions}>
            {FeaturesData.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.similarActionButton}>
                <Text style={styles.similarActionText}>{item.title}</Text>
                {item.svg ? (
                  <SvgXml xml={item.svg} width={r(16)} height={r(16)} />
                ) : (
                  <FastImage
                    source={item.image as any}
                    style={styles.similarActionIcon}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.similarProductsContainer}>
          <FlatList
            data={DetailedProductData.filter(
              item => item._id !== itemDetails?._id,
            ).slice(0, 5)}
            renderItem={({item}) => (
              <ProductItem
                image={item.image[0]}
                title={item.title}
                description={item.description}
                price={item.price}
                priceBeforeDeal={item.priceBeforeDeal}
                priceOff={item.priceOff}
                stars={item.stars}
                numberOfReview={item.numberOfReview}
                itemDetails={item}
                currency={(item as any).currency}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={<View style={styles.separator} />}
            ListHeaderComponent={<View style={styles.separator} />}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[3],
  },
  statusText: {
    marginTop: Spacing[4],
    color: Colors.gray?.[500] || '#666',
    fontFamily: FontFamilies.mregular,
    textAlign: 'center',
    paddingHorizontal: Spacing[4],
  },
  retryButton: {
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.primary,
    borderRadius: r(8),
  },
  retryText: {
    color: Colors.white,
    fontFamily: FontFamilies.mmedium,
  },
  carouselContainer: {
    marginTop: Spacing[3],
    marginBottom: Spacing[4],
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: r(12),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: r(6),
    marginTop: Spacing[4],
  },
  paginationDot: {
    width: r(12),
    height: r(12),
    borderRadius: r(6),
    backgroundColor: Colors.gray[300] || '#D3D3D3',
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: r(12),
    height: r(12),
    borderRadius: r(6),
  },
  priceSection: {
    marginBottom: Spacing[4],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  price: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  discountBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: r(12),
    paddingVertical: r(6),
    borderRadius: r(6),
  },
  discountText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
  },
  priceBeforeDeal: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  vendorPrefix: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
  },
  vendorName: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(2),
  },
  reviewCount: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#9CA3AF',
  },
  section: {
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  descriptionTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  descriptionText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: '#4B5563',
    lineHeight: r(22),
    marginBottom: Spacing[2],
  },
  variationsTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  specificationTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  moreText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginBottom: Spacing[5],
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(8),
    paddingVertical: r(12),
    paddingHorizontal: r(14),
    borderRadius: r(8),
    borderWidth: r(0.7),
    borderColor: '#828282',
    backgroundColor: Colors.white,
    minWidth: 0,
    flexShrink: 1,
  },
  infoButtonIcon: {
    width: r(20),
    height: r(20),
  },
  infoButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: '#828282',
    flexShrink: 1,
    minWidth: 0,
  },
  variationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: Spacing[3],
    gap: Spacing[3],
  },
  variationsChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  variationArrowButton: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  variationChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: r(12),
    paddingVertical: r(8),
    borderRadius: r(8),
    borderWidth: r(1),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: r(36),
  },
  variationChipSelected: {
    borderColor: '#828282',
  },
  variationChipUnselected: {
    borderColor: Colors.gray[300] || '#D1D5DB',
  },
  variationText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    textAlign: 'center',
  },
  variationImagesContainer: {
    marginTop: Spacing[2],
  },
  variationImagesList: {
    paddingRight: Spacing[5],
  },
  variationImageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variationImageContainer: {
    borderRadius: r(8),
    borderWidth: r(2),
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  variationImageSelected: {
    borderColor: '#828282',
  },
  variationImage: {
    width: r(100),
    height: r(100),
    borderRadius: r(6),
  },
  variationImageSeparator: {
    width: Spacing[2],
  },
  noVariationImagesText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingVertical: Spacing[2],
  },
  specificationsContent: {
    marginTop: Spacing[3],
  },
  specificationLabel: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  specChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: r(12),
    paddingVertical: r(8),
    borderRadius: r(8),
  },
  specText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  deliveryOptionsContainer: {
    gap: Spacing[3],
  },
  deliveryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: r(0.5),
    borderColor: '#828282',
    borderRadius: r(8),
    padding: r(12),
  },
  deliveryOptionSelected: {
    borderWidth: r(1),
    borderColor: Colors.primary,
  },
  deliveryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  deliveryType: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  deliveryDurationBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: r(8),
    paddingVertical: r(4),
    borderRadius: r(4),
  },
  deliveryDuration: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.primary,
  },
  deliveryPrice: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  colorContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  colorSwatch: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    borderWidth: r(2),
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: r(3),
  },
  colorSwatchSelected: {
    borderColor: Colors.black[100],
  },
  colorSwatchInner: {
    width: '100%',
    height: '100%',
    borderRadius: r(17),
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  ratingBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: r(10),
    paddingVertical: r(6),
    borderRadius: r(6),
  },
  ratingNumber: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  reviewItem: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  reviewAvatar: {
    width: r(50),
    height: r(50),
    borderRadius: r(25),
    backgroundColor: Colors.primaryLight,
    borderWidth: r(2),
    borderColor: Colors.white,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  sendGiftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(8),
    backgroundColor: '#009220',
    paddingVertical: r(18),
    borderRadius: r(12),
  },
  sendGiftText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(8),
    backgroundColor: Colors.primary,
    paddingVertical: r(14),
    borderRadius: r(12),
  },
  actionButtonIcon: {
    width: r(20),
    height: r(20),
  },
  addToCartText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
  buyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: r(8),
    borderWidth: r(1),
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    paddingVertical: r(14),
    borderRadius: r(12),

    marginBottom: Spacing[5],
  },
  buyNowText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  similarSection: {
    marginBottom: Spacing[8],
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  similarTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  similarActions: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  similarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    paddingVertical: r(6),
    paddingHorizontal: r(10),
    borderRadius: r(8),
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D3D3D3',
    backgroundColor: Colors.white,
  },
  similarActionIcon: {
    width: r(16),
    height: r(16),
  },
  similarActionText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
  },
  similarProductsContainer: {
    marginTop: Spacing[3],
  },
  separator: {
    width: Spacing[2],
  },
});

export default ProductsDetailsScreen;
