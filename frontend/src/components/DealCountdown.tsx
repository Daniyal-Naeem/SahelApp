import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';

interface DealCountdownProps {
  endDate: string;
  onExpired?: () => void;
  showLabels?: boolean;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const DealCountdown: React.FC<DealCountdownProps> = ({
  endDate,
  onExpired,
  showLabels = true,
  compact = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false,
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpired]);

  if (timeRemaining.expired) {
    return (
      <View style={styles.container}>
        <Text style={styles.expiredText}>Expired</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {timeRemaining.days > 0 && (
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{String(timeRemaining.days).padStart(2, '0')}</Text>
          {showLabels && <Text style={styles.timeLabel}>Days</Text>}
        </View>
      )}
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{String(timeRemaining.hours).padStart(2, '0')}</Text>
        {showLabels && <Text style={styles.timeLabel}>Hours</Text>}
      </View>
      <View style={styles.separator}>
        <Text style={styles.separatorText}>:</Text>
      </View>
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{String(timeRemaining.minutes).padStart(2, '0')}</Text>
        {showLabels && <Text style={styles.timeLabel}>Mins</Text>}
      </View>
      <View style={styles.separator}>
        <Text style={styles.separatorText}>:</Text>
      </View>
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{String(timeRemaining.seconds).padStart(2, '0')}</Text>
        {showLabels && <Text style={styles.timeLabel}>Secs</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: r(40),
  },
  timeValue: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    lineHeight: FontSizes.lg * 1.2,
  },
  timeLabel: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginTop: Spacing[1],
  },
  separator: {
    marginHorizontal: Spacing[1],
  },
  separatorText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  compactText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  expiredText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.red[500],
  },
});

export default DealCountdown;
