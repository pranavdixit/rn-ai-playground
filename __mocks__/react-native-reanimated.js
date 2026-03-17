const React = require('react');
const { View } = require('react-native');

const Animated = {
  View: View,
  Text: require('react-native').Text,
  ScrollView: require('react-native').ScrollView,
  Image: require('react-native').Image,
};

const useSharedValue = (init) => ({ value: init });
const useAnimatedStyle = (fn) => ({});
const withSpring = (toValue) => toValue;
const runOnJS = (fn) => fn;
const interpolate = (value, inputRange, outputRange) => outputRange[0];
const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };

module.exports = {
  __esModule: true,
  default: Animated,
  Animated,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
};
