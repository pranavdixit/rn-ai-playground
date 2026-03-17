const React = require('react');
const { View } = require('react-native');

const GestureHandlerRootView = ({ children, style }) =>
  React.createElement(View, { style }, children);

const GestureDetector = ({ children }) => children;

const Gesture = {
  Pan: () => ({
    activeOffsetX: function () { return this; },
    failOffsetY: function () { return this; },
    onUpdate: function () { return this; },
    onEnd: function () { return this; },
  }),
};

module.exports = {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
};
