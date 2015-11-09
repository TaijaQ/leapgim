// Generated by CoffeeScript 1.10.0
(function() {
  var FrameController, Leap,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Leap = require('leapjs');

  FrameController = (function() {
    FrameController.prototype.config = {
      interval: 50,
      stabilize: true
    };

    FrameController.prototype.nameMap = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky'];

    function FrameController(config, gestureController) {
      this.processFrame = bind(this.processFrame, this);
      this.findPinchingFingerType = bind(this.findPinchingFingerType, this);
      this.model = [];
      this.config = config;
      this.gestureController = gestureController;
      console.log("Frame Controller initialized");
    }

    FrameController.prototype.findPinchingFingerType = function(hand) {
      var closest, current, distance, f, pincher, pincherName;
      pincher = void 0;
      closest = 500;
      f = 1;
      while (f < 5) {
        current = hand.fingers[f];
        distance = Leap.vec3.distance(hand.thumb.tipPosition, current.tipPosition);
        if (current !== hand.thumb && distance < closest) {
          closest = distance;
          pincher = current;
        }
        f++;
      }
      pincherName = this.nameMap[pincher.type];
      console.log("Pincher type: ", pincher.type);
      console.log("Pincher: " + pincherName);
      return pincherName;
    };


    /*
     * Produce x and y coordinates for a leap pointable.
     */

    FrameController.prototype.relative3DPosition = function(frame, leapPoint) {
      var iBox, normalizedPoint, x, y, z;
      iBox = frame.interactionBox;
      normalizedPoint = iBox.normalizePoint(leapPoint, false);
      x = normalizedPoint[0];
      y = 1 - normalizedPoint[1];
      z = normalizedPoint[2];
      if (x < 0) {
        x = 0;
      }
      if (x > 1) {
        x = 1;
      }
      if (y < 0) {
        y = 0;
      }
      if (y > 1) {
        y = 1;
      }
      if (z < -1) {
        z = -1;
      }
      if (z > 1) {
        z = 1;
      }
      return {
        x: x,
        y: y,
        z: z
      };
    };

    FrameController.prototype.processFrame = function(frame) {
      var circleVector, gesture, gestureModel, hand, handModel, i, j, len, len1, palmPosition, pinchStrength, pinchingFinger, position, ref, ref1, ref2, ref3, ref4, ref5, ref6;
      if (!frame.valid || frame.hands === null || frame.hands.length === 0) {

      } else {
        this.model = {
          hands: [],
          gestures: [],
          timestamp: frame.timestamp
        };
        ref = frame.hands;
        for (i = 0, len = ref.length; i < len; i++) {
          hand = ref[i];
          if (this.config.stabilize) {
            console.log("Stabilized position in use!");
            position = hand.stabilizedPalmPosition;
          } else {
            position = hand.palmPosition;
          }
          palmPosition = this.relative3DPosition(frame, position);
          pinchStrength = hand.pinchStrength;
          if (pinchStrength > 0) {
            pinchingFinger = this.findPinchingFingerType(hand);
          } else {
            pinchingFinger = null;
          }
          handModel = {
            type: hand.type,
            visible: hand.timeVisible,
            confidence: hand.confidence,
            extendedFingers: {
              thumb: (ref1 = hand.thumb) != null ? ref1.extended : void 0,
              indexFinger: (ref2 = hand.indexFinger) != null ? ref2.extended : void 0,
              middleFinger: (ref3 = hand.middleFinger) != null ? ref3.extended : void 0,
              ringFinger: (ref4 = hand.ringFinger) != null ? ref4.extended : void 0,
              pinky: (ref5 = hand.pinky) != null ? ref5.extended : void 0
            },
            position: palmPosition,
            grabStrength: hand.grabStrength,
            pinchStrength: pinchStrength,
            pinchingFinger: pinchingFinger,
            speed: hand.palmVelocity,
            pitch: hand.pitch,
            roll: hand.roll,
            direction: hand.direction
          };
          this.model.hands.push(handModel);
        }
        ref6 = frame.gestures;
        for (j = 0, len1 = ref6.length; j < len1; j++) {
          gesture = ref6[j];
          if (gesture.type === "circle") {
            circleVector = frame.pointable(gesture.pointableIds[0]).direction;
            console.log("Circle vector", circleVector);
            console.log("Cirlce normal", gesture.normal);
            gesture.direction = Leap.vec3.dot(circleVector, gesture.normal);
          }
          gestureModel = {
            type: gesture.type,
            duration: gesture.duration,
            progress: gesture.progress,
            state: gesture.state,
            radius: gesture.radius,
            center: gesture.center,
            hands: gesture.handIds,
            speed: gesture.speed,
            startPosition: gesture.startPosition,
            position: gesture.position,
            direction: gesture.direction
          };
          this.model.gestures.push(gestureModel);
        }
        this.emit('update', this.model);
      }
    };

    return FrameController;

  })();

  if (window) {
    window.FrameController = FrameController;
  }

}).call(this);