import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';
import {CustomHeader, CustomButton, FormField} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {createProduct, getCategories} from '../services/productService';
import {useAppSelector} from '../store';

const VendorAddProductScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector(state => state.auth.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceBeforeDeal: '',
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.openPicker({
        multiple: true,
        maxFiles: 4,
        mediaType: 'photo',
        includeBase64: true,
        // Keep payloads under Vercel’s ~4.5MB body limit.
        compressImageQuality: 0.45,
        compressImageMaxWidth: 900,
        compressImageMaxHeight: 900,
      });
      const list = Array.isArray(result) ? result : [result];
      const encoded = list
        .filter(img => img.data)
        .map(img => `data:${img.mime};base64,${img.data}`)
        .filter(dataUrl => dataUrl.length < 900_000);
      if (encoded.length === 0) {
        Alert.alert(
          'Images too large',
          'Please pick smaller photos (under ~1MB each) and try again.',
        );
        return;
      }
      setImages(prev => [...prev, ...encoded].slice(0, 4));
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Image picker', error?.message || 'Could not pick images');
      }
    }
  };

  const handleSubmit = async () => {
    if (user?.vendorStatus !== 'approved') {
      Alert.alert('Pending approval', 'Wait for admin to approve your vendor account.');
      return;
    }
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      Alert.alert('Missing fields', 'Title, description, and price are required.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Images required', 'Add at least one product image.');
      return;
    }

    const price = Number(form.price);
    const before = form.priceBeforeDeal ? Number(form.priceBeforeDeal) : price;
    if (Number.isNaN(price) || price <= 0) {
      Alert.alert('Invalid price', 'Enter a valid price.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct({
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        priceBeforeDeal: before,
        priceOff: Math.max(0, before - price),
        image: images,
        category: selectedCategory || undefined,
        status: {icon: '🆕', name: 'New'},
        tags: ['vendor'],
      });
      Alert.alert('Product created', 'Your product is now live for buyers.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('VendorProducts'),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Upload failed',
        error?.response?.data?.error || error?.message || 'Please try again',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Add Product"
        onBackPress={() => navigation.goBack()}
        showBorder
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormField
          title="Title"
          value={form.title}
          setError={() => {}}
          error=""
          handleChangeText={(e: string) => setForm({...form, title: e})}
          placeholder="Product title"
          otherStyles={styles.field}
        />
        <FormField
          title="Description"
          value={form.description}
          setError={() => {}}
          error=""
          handleChangeText={(e: string) => setForm({...form, description: e})}
          placeholder="Describe the product"
          otherStyles={styles.field}
        />
        <FormField
          title="Price (SAR)"
          value={form.price}
          setError={() => {}}
          error=""
          handleChangeText={(e: string) => setForm({...form, price: e})}
          placeholder="89.99"
          otherStyles={styles.field}
          keyboardType="decimal-pad"
        />
        <FormField
          title="Price before deal (optional)"
          value={form.priceBeforeDeal}
          setError={() => {}}
          error=""
          handleChangeText={(e: string) => setForm({...form, priceBeforeDeal: e})}
          placeholder="129.99"
          otherStyles={styles.field}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {categories.map((cat: any) => {
            const id = String(cat._id);
            const active = selectedCategory === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(id)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat.name || cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Images ({images.length}/4)</Text>
        <View style={styles.imageRow}>
          {images.map((uri, index) => (
            <Image key={index} source={{uri}} style={styles.thumb} />
          ))}
          {images.length < 4 && (
            <TouchableOpacity style={styles.addImage} onPress={pickImages}>
              <Text style={styles.addImageText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <CustomButton
          title="Publish Product"
          handlePress={handleSubmit}
          isLoading={isSubmitting}
          containerStyle={styles.submit}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  content: {padding: Spacing[5], paddingBottom: Spacing[12]},
  field: {marginBottom: Spacing[4]},
  label: {
    fontFamily: FontFamilies.msemibold,
    fontSize: FontSizes.sm,
    marginBottom: Spacing[2],
    color: Colors.black[100],
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[5]},
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: r(20),
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  chipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  chipText: {color: Colors.gray[600], fontFamily: FontFamilies.mmedium},
  chipTextActive: {color: Colors.white},
  imageRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[6]},
  thumb: {width: r(72), height: r(72), borderRadius: r(8)},
  addImage: {
    width: r(72),
    height: r(72),
    borderRadius: r(8),
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {fontSize: FontSizes['2xl'], color: Colors.primary},
  submit: {marginTop: Spacing[2]},
});

export default VendorAddProductScreen;
