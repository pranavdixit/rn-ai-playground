import { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureDetector, GestureHandlerRootView, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_HEIGHT = 300;
const STACK_OFFSET = 12;
const SPRING = { damping: 22, stiffness: 200 };

const CARDS = [
  { id: '1', text: 'Swipe right for next.\nSwipe left to go back.', color: '#FF6B6B' },
  { id: '2', text: 'Card Two', color: '#4ECDC4' },
  { id: '3', text: 'Card Three', color: '#45B7D1' },
  { id: '4', text: 'Card Four', color: '#96CEB4' },
  { id: '5', text: 'Last card', color: '#DDA0DD' },
];

const BUTTONS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack'];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Shared values live outside React tree — no stale closure issues
  const translateX = useSharedValue(0);
  const bgProgress = useSharedValue(0); // 0 = fully stacked, 1 = risen
  const indexSV = useSharedValue(0);

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          [-8, 0, 8],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  // Background cards animate driven by bgProgress, not translateX
  // → no snap/glitch when translateX resets after state update
  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(bgProgress.value, [0, 1], [0.95, 1], Extrapolation.CLAMP) },
      { translateY: interpolate(bgProgress.value, [0, 1], [STACK_OFFSET, 0], Extrapolation.CLAMP) },
    ],
  }));

  const secondCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(bgProgress.value, [0, 1], [0.9, 0.95], Extrapolation.CLAMP) },
      { translateY: interpolate(bgProgress.value, [0, 1], [STACK_OFFSET * 2, STACK_OFFSET], Extrapolation.CLAMP) },
    ],
  }));

  // useMemo keeps the same gesture object across re-renders so GestureDetector
  // never tears down the active recogniser mid-swipe (fixes unresponsive-after-swipe bug)
  const pan = useMemo(() =>
    Gesture.Pan()
      .activeOffsetX([-10, 10])
      .failOffsetY([-10, 10])
      .onUpdate((e) => {
        translateX.value = e.translationX;
        bgProgress.value = Math.min(Math.abs(e.translationX) / (SCREEN_WIDTH * 0.4), 1);
      })
      .onEnd((e) => {
        const canGoNext = e.translationX > SWIPE_THRESHOLD && indexSV.value < CARDS.length - 1;
        const canGoPrev = e.translationX < -SWIPE_THRESHOLD && indexSV.value > 0;

        if (canGoNext || canGoPrev) {
          const direction = canGoNext ? 1 : -1;
          const targetX = direction * SCREEN_WIDTH * 1.5;
          const nextIdx = indexSV.value + direction;

          bgProgress.value = withSpring(1, SPRING);
          translateX.value = withSpring(targetX, SPRING, () => {
            // Reset shared values BEFORE runOnJS so new cards render in correct positions
            translateX.value = 0;
            bgProgress.value = 0;
            indexSV.value = nextIdx;
            runOnJS(setCurrentIndex)(nextIdx);
          });
        } else {
          translateX.value = withSpring(0, SPRING);
          bgProgress.value = withSpring(0, SPRING);
        }
      }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const ci = currentIndex;

  const buttonRows: string[][] = [];
  for (let i = 0; i < BUTTONS.length; i += 3) {
    buttonRows.push(BUTTONS.slice(i, i + 3));
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* ── Card deck ── */}
        <View style={styles.deckWrapper}>
          <View style={styles.deckContainer}>

            {/* Second background card */}
            {ci + 2 < CARDS.length && (
              <Animated.View
                style={[styles.card, { backgroundColor: CARDS[ci + 2].color, zIndex: 8 }, secondCardStyle]}
              >
                <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.cardText}>{CARDS[ci + 2].text}</Text>
                </ScrollView>
              </Animated.View>
            )}

            {/* First background card (next) */}
            {ci + 1 < CARDS.length && (
              <Animated.View
                style={[styles.card, { backgroundColor: CARDS[ci + 1].color, zIndex: 9 }, nextCardStyle]}
              >
                <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.cardText}>{CARDS[ci + 1].text}</Text>
                </ScrollView>
              </Animated.View>
            )}

            {/* Top card — swipeable */}
            <GestureDetector gesture={pan}>
              <Animated.View
                style={[styles.card, { backgroundColor: CARDS[ci].color, zIndex: 10 }, topCardStyle]}
              >
                <ScrollView contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.cardText}>{CARDS[ci].text}</Text>
                </ScrollView>
              </Animated.View>
            </GestureDetector>

          </View>
          <Text style={styles.counter}>{ci + 1} / {CARDS.length}</Text>
        </View>

        {/* ── Buttons ── */}
        <ScrollView
          style={styles.buttonsScroll}
          contentContainerStyle={styles.buttonsContent}
          showsVerticalScrollIndicator={false}
        >
          {buttonRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.buttonRow}>
              {row.map((name) => (
                <TouchableOpacity key={name} style={styles.circleButton} activeOpacity={0.75}>
                  <Text style={styles.buttonText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 60,
  },
  deckWrapper: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  deckContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + STACK_OFFSET * 2 + 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  counter: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  buttonsScroll: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E5',
  },
  buttonsContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
});
