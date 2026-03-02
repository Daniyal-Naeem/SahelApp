import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {clock, checkmarkIcon} from '../constants/icons';

export interface TrackingStep {
  status: string;
  title: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  deliveryPerson?: {
    name: string;
    phone: string;
    vehicleNumber?: string;
  };
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

interface DeliveryTimelineProps {
  steps: TrackingStep[];
  showDeliveryPerson?: boolean;
  showLocation?: boolean;
}

const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  steps,
  showDeliveryPerson = true,
  showLocation = true,
}) => {
  const renderStep = (step: TrackingStep, index: number) => {
    const isLast = index === steps.length - 1;

    return (
      <View key={index} style={styles.stepContainer}>
        <View style={styles.stepLeft}>
          <View
            style={[
              styles.stepIcon,
              step.isCompleted && styles.stepIconCompleted,
              step.isCurrent && styles.stepIconCurrent,
            ]}>
            {step.isCompleted ? (
              <SvgXml xml={checkmarkIcon} width={r(16)} height={r(16)} />
            ) : (
              <SvgXml xml={clock} width={r(16)} height={r(16)} />
            )}
          </View>
          {!isLast && (
            <View
              style={[
                styles.stepLine,
                step.isCompleted && styles.stepLineCompleted,
              ]}
            />
          )}
        </View>
        <View style={styles.stepContent}>
          <Text
            style={[
              styles.stepTitle,
              step.isCompleted && styles.stepTitleCompleted,
              step.isCurrent && styles.stepTitleCurrent,
            ]}>
            {step.title}
          </Text>
          <Text style={styles.stepDescription}>{step.description}</Text>

          {/* Delivery Person Info */}
          {showDeliveryPerson && step.isCurrent && step.deliveryPerson && (
            <View style={styles.deliveryPersonContainer}>
              <Text style={styles.deliveryPersonLabel}>Delivery Person:</Text>
              <Text style={styles.deliveryPersonName}>{step.deliveryPerson.name}</Text>
              {step.deliveryPerson.phone && (
                <Text style={styles.deliveryPersonPhone}>{step.deliveryPerson.phone}</Text>
              )}
              {step.deliveryPerson.vehicleNumber && (
                <Text style={styles.deliveryPersonVehicle}>
                  Vehicle: {step.deliveryPerson.vehicleNumber}
                </Text>
              )}
            </View>
          )}

          {/* Location Info */}
          {showLocation && step.location && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Location:</Text>
              <Text style={styles.locationAddress}>{step.location.address}</Text>
            </View>
          )}

          {step.date && (
            <Text style={styles.stepDate}>{step.date}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => renderStep(step, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing[2],
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
    minHeight: r(60),
  },
  stepLeft: {
    width: r(40),
    alignItems: 'center',
  },
  stepIcon: {
    width: r(32),
    height: r(32),
    borderRadius: r(16),
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepIconCompleted: {
    backgroundColor: Colors.green[500],
  },
  stepIconCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: r(2),
    borderColor: Colors.primaryLight,
  },
  stepLine: {
    width: r(2),
    backgroundColor: Colors.gray[200],
    flex: 1,
    marginTop: Spacing[2],
  },
  stepLineCompleted: {
    backgroundColor: Colors.green[500],
  },
  stepContent: {
    flex: 1,
    marginLeft: Spacing[4],
    paddingBottom: Spacing[2],
  },
  stepTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[1],
  },
  stepTitleCompleted: {
    color: Colors.green[600],
    fontFamily: FontFamilies.msemibold,
  },
  stepTitleCurrent: {
    color: Colors.primary,
    fontFamily: FontFamilies.msemibold,
  },
  stepDescription: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500],
    marginBottom: Spacing[2],
    lineHeight: r(18),
  },
  deliveryPersonContainer: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing[3],
    borderRadius: r(8),
    marginBottom: Spacing[2],
  },
  deliveryPersonLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
    marginBottom: Spacing[1],
  },
  deliveryPersonName: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  deliveryPersonPhone: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  deliveryPersonVehicle: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginTop: Spacing[1],
  },
  locationContainer: {
    backgroundColor: Colors.blue[50],
    padding: Spacing[3],
    borderRadius: r(8),
    marginBottom: Spacing[2],
  },
  locationLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.blue[600],
    marginBottom: Spacing[1],
  },
  locationAddress: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  stepDate: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[400],
    marginTop: Spacing[1],
  },
});

export default DeliveryTimeline;
