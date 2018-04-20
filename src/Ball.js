/*
 * File: /Users/michaelbeeson/Documents/VSCode/react-native-ud/swipe-playground/src/Ball.js
 */

import React, { Component } from "react";
import { View, Text, Animated } from "react-native";

export default class Ball extends Component {
  componentWillMount() {
    //  start position
    this.position = new Animated.ValueXY(0, 0);

    //  animation from start position to end position
    Animated.spring(this.position, {
      toValue: { x: 200, y: 500 }
    }).start();
  }

  render() {
    return (
      <Animated.View style={this.position.getLayout()}>
        <View style={styles.ball} />
      </Animated.View>
    );
  }
}

const styles = {
  ball: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 30,
    borderColor: "black"
  }
};
