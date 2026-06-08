import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Props = {
  width?: number;
};

const DURATION = 2500;

export function BookshelfLoader({ width = 300 }: Props) {
  const cycle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cycle.setValue(0);
    const animation = Animated.loop(
      Animated.timing(cycle, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [cycle]);

  const books = Array.from({ length: 12 }, (_, index) => index);

  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={styles.booksArea}>
        {books.map((index) => {
          const variantIndex = index % bookVariants.length;
          const phaseOffset = index / books.length;
          const phase = Animated.modulo(Animated.add(cycle, phaseOffset), 1);

          return (
          <Animated.View
            key={`book-${index}`}
            style={[
              styles.book,
              bookVariants[variantIndex],
              {
                opacity: phase.interpolate({
                  inputRange: [0, 0.095, 0.835, 0.9, 1],
                  outputRange: [0, 0, 1, 0, 0],
                }),
                transform: [
                  {
                    translateX: phase.interpolate({
                      inputRange: [0, 0.065, 0.088, 0.1, 0.176, 0.45, 0.495, 0.615, 0.67, 0.76, 0.835, 0.9, 1],
                      outputRange: [width, width * 0.93, width * 0.912, width * 0.9, width * 0.825, width * 0.55, width * 0.505, width * 0.385, width * 0.33, width * 0.24, width * 0.165, width * 0.09, 0],
                    }),
                  },
                  {
                    rotateZ: phase.interpolate({
                      inputRange: [0, 0.065, 0.088, 0.1, 0.176, 0.45, 0.495, 0.615, 0.67, 0.76, 0.835, 0.9, 1],
                      outputRange: ['0deg', '0deg', '0deg', '0deg', '-30deg', '-30deg', '-45deg', '-45deg', '-60deg', '-60deg', '-90deg', '-90deg', '-90deg'],
                    }),
                  },
                  {
                    scaleY: phase.interpolate({
                      inputRange: [0, 0.065, 0.088, 0.1, 0.176, 0.45, 0.495, 0.615, 0.67, 0.76, 0.835, 0.9, 1],
                      outputRange: [1, 1.1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <BookDecoration variant={variantIndex} />
          </Animated.View>
          );
        })}
      </View>
      <View style={styles.shelf} />
      <View style={styles.shadowRow}>
        <View style={styles.shadowLine} />
        <View style={[styles.shadowLine, styles.shadowLineOffset]} />
      </View>
    </View>
  );
}

function BookDecoration({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <>
        <View style={styles.edgeLineTop} />
        <View style={styles.edgeLineBottom} />
      </>
    );
  }

  if (variant === 1 || variant === 4) {
    return (
      <>
        <View style={styles.bandOuter} />
        <View style={styles.bandOuterBottom} />
      </>
    );
  }

  if (variant === 2) {
    return (
      <>
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />
      </>
    );
  }

  if (variant === 3) {
    return <View style={styles.midBand} />;
  }

  if (variant === 5) {
    return (
      <>
        <View style={styles.lowLine} />
        <View style={styles.circleBottomRight} />
      </>
    );
  }

  return null;
}

const bookVariants = [
  { top: -112, height: 140, left: 0 },
  { top: -96, height: 120, left: 0 },
  { top: -96, height: 120, left: 0 },
  { top: -104, height: 130, left: 0 },
  { top: -74, height: 100, left: 0 },
  { top: -112, height: 140, left: 0 },
] as const;

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    height: 210,
    overflow: 'visible',
    justifyContent: 'flex-end',
  },
  booksArea: {
    position: 'relative',
    height: 180,
    paddingTop: 18,
    overflow: 'visible',
  },
  book: {
    position: 'absolute',
    width: 40,
    right: 0,
    borderWidth: 5,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
  },
  shelf: {
    width: '100%',
    height: 5,
    backgroundColor: '#111',
  },
  shadowRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 5,
    height: 14,
  },
  shadowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(17, 17, 17, 0.08)',
  },
  shadowLineOffset: {
    top: 7,
    left: 6,
    right: 6,
  },
  edgeLineTop: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#111',
  },
  edgeLineBottom: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#111',
  },
  bandOuter: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 17,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderColor: '#111',
    backgroundColor: 'transparent',
  },
  bandOuterBottom: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 17,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderColor: '#111',
    backgroundColor: 'transparent',
  },
  circleTop: {
    position: 'absolute',
    top: 10,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 5,
    borderColor: '#111',
    backgroundColor: 'transparent',
  },
  circleBottom: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 5,
    borderColor: '#111',
    backgroundColor: 'transparent',
  },
  midBand: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    height: 17,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderColor: '#111',
    backgroundColor: 'transparent',
  },
  lowLine: {
    position: 'absolute',
    bottom: 31,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#111',
  },
  circleBottomRight: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 5,
    borderColor: '#111',
    backgroundColor: 'transparent',
  },
});
