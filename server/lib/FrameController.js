// Generated by CoffeeScript 1.10.0
(function() {
  var EventEmitter, FrameController, Leap, YAML, config, consume, frameController, leapController, socket, zmq,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  Leap = require('leapjs');

  zmq = require('zmq');

  YAML = require('yamljs');

  config = YAML.load('etc/config.yml');

  FrameController = (function(superClass) {
    extend(FrameController, superClass);

    FrameController.prototype.nameMap = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky'];

    function FrameController() {
      this.processFrame = bind(this.processFrame, this);
      this.findPinchingFingerType = bind(this.findPinchingFingerType, this);
      this.model = [];
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
      console.log("Processing frame...");
      if (!frame.valid || frame.hands === null || frame.hands.length === 0) {
        console.log("Invalid frame or no hands detected");
      } else {
        console.log("Gestures: ", frame.gestures);
        this.model = {
          hands: [],
          gestures: [],
          timestamp: frame.timestamp
        };
        ref = frame.hands;
        for (i = 0, len = ref.length; i < len; i++) {
          hand = ref[i];
          if (config.stabilize) {
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
      console.log("Processed frame: ", frame.id);
    };

    return FrameController;

  })(EventEmitter);

  socket = zmq.socket('pub');

  socket.on('connect', function(fd, ep) {
    console.log('connect, endpoint:', ep);
  });

  socket.on('connect_delay', function(fd, ep) {
    console.log('connect_delay, endpoint:', ep);
  });

  socket.on('connect_retry', function(fd, ep) {
    console.log('connect_retry, endpoint:', ep);
  });

  socket.on('listen', function(fd, ep) {
    console.log('listen, endpoint:', ep);
  });

  socket.on('bind_error', function(fd, ep) {
    console.log('bind_error, endpoint:', ep);
  });

  socket.on('accept', function(fd, ep) {
    console.log('accept, endpoint:', ep);
  });

  socket.on('accept_error', function(fd, ep) {
    console.log('accept_error, endpoint:', ep);
  });

  socket.on('close', function(fd, ep) {
    console.log('close, endpoint:', ep);
  });

  socket.on('close_error', function(fd, ep) {
    console.log('close_error, endpoint:', ep);
  });

  socket.on('disconnect', function(fd, ep) {
    console.log('disconnect, endpoint:', ep);
  });

  console.log('Start monitoring...');

  socket.monitor(500, 0);

  socket.bindSync(config.socket);

  frameController = new FrameController;

  frameController.on('update', function(model) {
    console.log("Frame Controller update", model);
    socket.send(['update', JSON.stringify(model)]);
  });

  leapController = new Leap.Controller({
    inBrowser: false,
    enableGestures: true,
    frameEventName: 'deviceFrame',
    background: true,
    loopWhileDisconnected: false
  });

  console.log("Connecting Leap Controller");

  leapController.connect();

  console.log("Leap Controller connected");

  consume = function() {
    var frame;
    frame = leapController.frame();
    if (frame === null) {
      return;
    }
    frameController.processFrame(frame);
    return console.log("Consumed frame ", frame.id);
  };

  setInterval(consume, config.interval);

}).call(this);