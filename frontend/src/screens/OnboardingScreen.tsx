import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useState, useRef} from 'react';
import {SplashData} from '../constants/data';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {setItem, getItem} from '../utils/AsyncStorage';
import {RouteStackParamList} from '../../App';

type Props = {};
export type RootStackParamList = {
  Login: {id: number} | undefined;
};

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const OnboardingScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleDone = async () => {
    await setItem('onboarded', 200);
    // Check if user has a token
    const token = await getItem('token');
    if (token) {
      // User is authenticated, go to HomeScreen
      navigation.navigate('HomeScreen');
    } else {
      // No token, go to LoginScreen
      navigation.navigate('Login');
    }
  };

  const handleNext = () => {
    if (currentIndex < SplashData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    } else {
      handleDone();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({index: prevIndex, animated: true});
      setCurrentIndex(prevIndex);
    }
  };

  const handleSkip = () => {
    handleDone();
  };

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({item}: {item: any; index: number}) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <FastImage source={item.image} style={styles.image} resizeMode={FastImage.resizeMode.contain} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {SplashData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageIndicator}>
          {currentIndex + 1}/{SplashData.length}
        </Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        ref={flatListRef}
        data={SplashData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={true}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity onPress={handlePrev} style={styles.prevButton}>
            <Text style={styles.prevButtonText}>Prev</Text>
          </TouchableOpacity>
        )}
        {currentIndex === 0 && <View style={styles.prevButton} />}
        {renderPagination()}
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 10,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  skipButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: 400,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 40,
    paddingTop: 20,
  },
  prevButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    opacity: 1,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  prevButtonTextDisabled: {
    color: '#999999',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
  },
  paginationDotActive: {
    width: 28,
    height: 6,
    backgroundColor: '#000000',
  },
  nextButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EB3030',
  },
});

export default OnboardingScreen;
