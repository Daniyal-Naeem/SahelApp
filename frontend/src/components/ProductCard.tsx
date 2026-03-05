import React, {useState, useMemo} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {ItemDetails, VariationType} from '../constants/types';
import {useI18n} from '../contexts/I18nContext';
import {getLocalizedProduct} from '../utils/productTranslations';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {activeStar} from '../assets/svgs/activeStar';
import {EmptyStar} from '../assets/svgs/emptyStar';
import {halfStar} from '../assets/svgs/halfstar';

type ProductCardProps = {
  itemDetails: ItemDetails;
  showTotalItem?: boolean;
  totalItems?: number;
};

const ProductCard = ({itemDetails, showTotalItem = false, totalItems = 1}: ProductCardProps) => {
  const {language} = useI18n();
  const localizedProduct = useMemo(
    () => (itemDetails ? getLocalizedProduct(itemDetails, language) : null),
    [itemDetails, language],
  );
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderStars = (rating: number) => {
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

  // Get variation options (color variations)
  const getVariationOptions = () => {
    if (!itemDetails?.variations) return [];
    
    const colorVariation = itemDetails.variations.find(
      (v: VariationType) => v.type === 'color'
    );
    
    if (colorVariation?.options) {
      return colorVariation.options.map((opt: {label?: string; value?: string; isSelected?: boolean}) => ({
        label: opt?.label || opt?.value || '',
        value: opt?.value || opt?.label || '',
        isSelected: opt?.isSelected || false,
      }));
    }
    
    return [];
  };

  const variationOptions = getVariationOptions();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    variationOptions.find((opt: {isSelected?: boolean}) => opt?.isSelected)?.value || 
    (variationOptions.length > 0 ? variationOptions[0].value : null)
  );

  const getShortVariationName = (label: string) => {
    if (!label) return '';
    const trimmed = label.trim();
    const firstWord = trimmed.split(/\s+/)[0];
    if (firstWord.length === 1 && /[A-Za-z]/.test(firstWord)) {
      return firstWord.toUpperCase();
    }
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const currency = (itemDetails as any)?.currency || 'SAR';
  const productImage = itemDetails?.image?.[0] || '';
  const productTitle = localizedProduct?.title || itemDetails?.title || 'Product';
  const productVendor = itemDetails?.vendor || '';
  const rating = itemDetails?.stars || 0;
  const price = itemDetails?.price || 0;
  const priceBeforeDeal = itemDetails?.priceBeforeDeal || 0;
  const priceOff = itemDetails?.priceOff || '';
  
  // Calculate discount percentage if priceOff is not provided
  const discountPercentage = priceOff 
    ? (priceOff.includes('%') ? priceOff : `${priceOff}%`)
    : (priceBeforeDeal > price 
      ? `${Math.round(((priceBeforeDeal - price) / priceBeforeDeal) * 100)}%`
      : '');

  return (
    <View style={styles.productCard}>
      <View style={styles.productCardContent}>
        <FastImage
          source={{uri: productImage}}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{productTitle}</Text>
          {productVendor && (
            <View style={styles.vendorContainer}>
              <Text style={styles.vendorPrefix}>by </Text>
              <Text style={styles.vendorName}>{productVendor}</Text>
            </View>
          )}

          {/* Variations */}
          {variationOptions.length > 0 && (
            <View style={styles.variationsContainer}>
              <Text style={styles.variationsLabel}>Variations :</Text>
              <View style={styles.variationChips}>
                {variationOptions.map((opt: {label?: string; value?: string}, index: number) => {
                  const isSelected = opt.value === selectedVariation;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.variationChip,
                        isSelected && styles.variationChipSelected,
                      ]}
                      onPress={() => setSelectedVariation(opt.value || null)}
                    >
                      <Text
                        style={[
                          styles.variationChipText,
                          isSelected && styles.variationChipTextSelected,
                        ]}
                      >
                        {getShortVariationName(opt.label || opt.value || '')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{rating}</Text>
            <View style={styles.starsContainer}>
              {renderStars(rating)}
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.currentPrice}>
                  {currency} {formatNumber(price)}
                </Text>
              </View>
              <View style={styles.discountInfo}>
                {discountPercentage && (
                  <Text style={styles.discountText}>upto {discountPercentage} off</Text>
                )}
                {priceBeforeDeal > price && (
                  <Text style={styles.originalPrice}>
                    {currency} {formatNumber(priceBeforeDeal)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Total Order - Full width below image */}
      {showTotalItem && (
        <View style={styles.totalItemContainer}>
          <Text style={styles.totalItemLabel}>Total Order ({totalItems}) :</Text>
          <Text style={styles.totalItemPrice}>
            {currency} {formatNumber(price)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: r(8),
    padding: Spacing[3],
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: r(2)},
    shadowOpacity: 0.1,
    shadowRadius: r(4),
    elevation: 3,
  },
  productCardContent: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  productImage: {
    width: r(155),
    height: r(155),
    borderRadius: r(8),
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
  productTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: r(2),
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: r(4),
  },
  vendorPrefix: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
  },
  vendorName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.gray[700] || '#374151',
  },
  variationsContainer: {
    flexDirection: 'column',
    // alignItems: 'flex-start',
    marginBottom: r(4),
  },
  variationsLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginRight: Spacing[2],
    marginTop: r(2),
  },
  variationChips: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  variationChip: {
    paddingHorizontal: r(12),
    paddingVertical: r(6),
    borderRadius: r(4),
    borderWidth: r(1),
    borderColor: '#E5E7EB',
    backgroundColor: Colors.white,
  },
  variationChipSelected: {
    borderColor: '#828282',
    borderWidth: r(1),
  },
  variationChipText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  variationChipTextSelected: {
    fontFamily: FontFamilies.msemibold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    marginBottom: r(4),
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  starsContainer: {
    flexDirection: 'row',
    gap: r(2),
  },
  priceContainer: {
    marginBottom: r(4),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  priceBox: {
    borderWidth: r(1),
    borderColor: Colors.gray[300] || '#D1D5DB',
    borderRadius: r(8),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  discountInfo: {
    flexDirection: 'column',
    gap: r(2),
    justifyContent: 'center',
  },
  discountText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
    textDecorationLine: 'line-through',
  },
  totalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing[2],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
    width: '100%',
  },
  totalItemLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginRight: Spacing[2],
  },
  totalItemPrice: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginLeft: 'auto',
  },
});

export default ProductCard;

