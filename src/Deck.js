/*
 * File: /Users/michaelbeeson/Documents/VSCode/react-native-ud/swipe-playground/src/Deck.js
 */

import React, { Component } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = Dimensions.get("window").width * 0.25;
const SWIPE_OUT_DURATION = 250; // 250 milliseconds

export default class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    renderNoMoreCards: () => {}
  };

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();

    //  PanResponder docs:
    //    https://facebook.github.io/react-native/docs/panresponder.html#docsNav
    const panResponder = PanResponder.create({
      // Executed anytime user taps on screen. If returns true,
      // this instance will handle tap
      onStartShouldSetPanResponder: () => true,

      // Callback anytime user drags his finger around
      onPanResponderMove: (event, gesture) => {
        // use debugger to stop execute like a breakpoint
        // debugger;
        console.log("onPanResponderMove");

        // { ...gesture } use spread operator to grab properties off of object
        // console.log({ ...gesture });
        // Gesture Object:
        //   1. dx:-1.3333282470703125      //  dx/dy: total distance user moved finger
        //   2. dy:0
        //   3. moveX:125                   //  moveX/moveY: where user clicked down
        //   4. moveY:103.66665649414062
        //   5. numberActiveTouches:1       //  number of fingers on screen
        //   6. stateID:0.722296043020211
        //   7. vx:-1.471720311563222e-8    //  vx/vy: velocity of user movement / how quickly
        //   8. vy:0
        //   9. x0:126.33332824707031       //  similar to moveX/moveY
        //   10. y0:103.66665649414062

        position.setValue({ x: gesture.dx, y: gesture.dy });
      },

      // Callback after user removes finger from screen
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          console.log("swipe right");
          this.forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          console.log("swipe left");
          this.forceSwipe("left");
        } else {
          this.resetPosition();
        }
      }
    });

    //  most documentation assigns panResponder to state, but it's not necessary
    // to use pan responder and state together actually.
    this.state = { panResponder, position, index: 0 };
    // this.state.position = { panResponder, position };
  }

  componentWillReceiveProps(nextProps) {
    // if not exact set of data, we reset
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    // Following is needed for Android devices, if android (setLayoutAnimationEnabledExperimental), then call
    // setLayoutAnimationEnabledExperimental(true)
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);

    // Animate any changes to layout.
    //  Used for animating as cards moving up after swipe
    LayoutAnimation.spring();
  }

  forceSwipe(direction) {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x: x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => {
      this.onSwipeComplete(direction);
    });
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];
    direction === "right" ? onSwipeRight(item) : onSwipeLeft(item);
    this.setState({ index: this.state.index + 1 });
    this.state.position.setValue({ x: 0, y: 0 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {
    const { position } = this.state;

    const rotate = position.x.interpolate({
      // inputRange: [-500, 0, 500],
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"]
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data
      .map((item, cardIndex) => {
        //  if we already passed this card and swiped left or right
        if (cardIndex < this.state.index) {
          return null;
        }

        // if current card
        if (cardIndex === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
        } else {
          // else if this card is still coming up / not yet viewed
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardStyle,
                { top: 10 * (cardIndex - this.state.index) }
              ]}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
        }
      }) // Need last card to render first (on the bottom of the deck), so reverse
      .reverse();
  }

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    position: "absolute",
    //left: 0,
    //right: 0,
    width: SCREEN_WIDTH
  }
});
