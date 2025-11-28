import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SvgXml} from 'react-native-svg';
import {clock} from '../assets/svgs/clock';
import {rightArrow} from '../assets/svgs/rightArrow';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import { calender } from '../assets/svgs/calender';

type DealBannerProps = {
  title: string;
  timeRemaining?: string;
  lastDate?: string;
  buttonText?: string;
  onButtonPress?: () => void;
};

const DealBanner = ({
  title,
  timeRemaining,
  lastDate,
  buttonText = 'View all',
  onButtonPress,
}: DealBannerProps) => {
  const showLastDate = !!lastDate;
  const showTimeRemaining = !!timeRemaining;

  return (
    <LinearGradient
      colors={['#FFCA28', '#F1D534']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
        {showTimeRemaining && (
          <View style={styles.timeContainer}>
            <View style={styles.clockIconContainer}>
              <SvgXml xml={clock} width={r(20)} height={r(20)} />
            </View>
            <Text style={styles.timeText}>{timeRemaining}</Text>
          </View>
        )}
        {showLastDate && (
          <View style={styles.timeContainer}>
              
            <SvgXml xml={calender} />
             
            <Text style={styles.timeText}>Last Date {lastDate}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.viewAllButton} onPress={onButtonPress}>
        <Text style={styles.viewAllText}>{buttonText}</Text>
        <View style={styles.rightArrowContainer}>
          <SvgXml xml={rightArrow} width={r(14)} height={r(14)} />
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: r(12),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing[5],
    paddingRight: Spacing[3],
    paddingVertical: Spacing[5],
    marginTop: Spacing[1],
    marginBottom: Spacing[5],
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    color: Colors.black[100],
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    fontWeight: '700',
    textAlign: 'left',
  },
  timeContainer: {
    flexDirection: 'row',
    marginTop: Spacing[2],
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: r(6),
  },
  clockIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: r(20),
    height: r(20),
  },
  timeText: {
    color: Colors.black[100],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.pregular,
    fontWeight: '400',
    lineHeight: FontSizes.base * 1.2,
    textAlignVertical: 'center',
  },
  viewAllButton: {
    borderRadius: r(8),
    borderWidth: r(1),
    borderColor: Colors.black[100] || '#000000',
    backgroundColor: 'transparent',
    height: r(40),
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    gap: r(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    color: Colors.black[100],
    fontFamily: FontFamilies.pregular,
    fontSize: FontSizes.base,
    fontWeight: '400',
    lineHeight: FontSizes.base * 1.2,
    textAlignVertical: 'center',
  },
  rightArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: r(14),
    height: r(14),
  },
});

export default DealBanner;

