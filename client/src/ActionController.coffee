robot = require 'robotjs'
zmq = require 'zmq'
YAML = require 'yamljs'
fs = require 'fs'

config = YAML.parse fs.readFileSync('etc/config.yml', 'utf8')

console.log "Config: ", config

#
# Action Controller
#
# Action controller's job is to recieve "leapgim frames" from the frame 
# controller. 
#
class ActionController
    constructor: ->
        @robot = require 'robotjs'
        @keyboardModel = 
            test: false
        @mouseState = 
            left : "up",
            right : "down"
        
    audioNotification: (clip) ->
        audio = new Audio(clip)
        audio.play()

    mouseMove: (handModel) =>
        screenSize = @robot.getScreenSize()
        moveTo = 
            x: handModel.position.x * screenSize.width
            y: handModel.position.y * screenSize.height
        @robot.moveMouse(moveTo.x, moveTo.y)

    # down: up|down, button: left|right
    mouseButton: (down, button) =>
        if(@mouseState.button != down)
            @mouseState.button = down
            @robot.mouseToggle down, button
            if(down == 'down')
                @audioNotification 'asset/audio/mousedown.wav'
            else
                @audioNotification 'asset/audio/mouseup.wav'

    keyboardTest: (down) =>
        audio = 'asset/audio/soft_delay.ogg'
        if(down == 'down')
            if(@keyboardModel.test is false)
                @keyboardModel.test = true
                @robot.keyToggle 't', 'down', 'command'
                @robot.keyToggle 't', 'up', 'command'
                @audioNotification(audio)
        else if(down is 'up')
            if(@keyboardModel.test is true)
                @keyboardModel.test = false

    parseGestures: (model) =>

        console.log "Parsing gestures.."
        console.log "Keyboard model test mutex: " + @keyboardModel.test
        #console.log "model: ", model

        handModel = model[0]
        for handModel in model
            console.log "handModel: ", handModel

            # Demo mouse clicking
            checkClick = (button, pinchingFinger) =>
                if (handModel.pinchStrength >  0.5 and handModel.pinchingFinger == pinchingFinger)
                    @mouseButton "down", button
                    console.log "Mouse button " + button + "down"
                else if (handModel.pinchStrength < 0.5)
                    @mouseButton "up", button
                    console.log "Mouse button " + button + "up"
                return
            checkClick 'left', 'indexFinger'
            checkClick 'right', 'ringFinger'

            if (handModel.pinchStrength >  0.5 and handModel.pinchingFinger =='pinky')
                @keyboardTest('down')
                console.log "Keyboard test down"
            else if (handModel.pinchStrength < 0.5)
                @keyboardTest('up')
                console.log "Keyboard test up"


            # Mouse Move test
            position = handModel.position

            # Mouse Lock
            if (handModel.grabStrength > 0.3)
                holdMouse = true

            frameIsEmpty = model is null or model.length is 0
            unless holdMouse is true or frameIsEmpty 
                @mouseMove(handModel)

actionController = new ActionController

socket = zmq.socket('sub')

socket.on 'connect_delay', (fd, ep) ->
    console.log 'connect_delay, endpoint:', ep
    return
socket.on 'connect_retry', (fd, ep) ->
    console.log 'connect_retry, endpoint:', ep
    return
socket.on 'listen', (fd, ep) ->
    console.log 'listen, endpoint:', ep
    return
socket.on 'bind_error', (fd, ep) ->
    console.log 'bind_error, endpoint:', ep
    return
socket.on 'accept', (fd, ep) ->
    console.log 'accept, endpoint:', ep
    return
socket.on 'accept_error', (fd, ep) ->
    console.log 'accept_error, endpoint:', ep
    return
socket.on 'close', (fd, ep) ->
    console.log 'close, endpoint:', ep
    return
socket.on 'close_error', (fd, ep) ->
    console.log 'close_error, endpoint:', ep
    return
socket.on 'disconnect', (fd, ep) ->
    console.log 'disconnect, endpoint:', ep
    return

socket.on 'connect', (fd, ep) ->
    console.log 'connect, endpoint:', ep
    socket.subscribe 'update'
    socket.on 'message', (topic, message) ->
        str_topic = topic.toString()
        str_message = message.toString()

        if(topic.toString() == 'update')
            model = JSON.parse str_message
            actionController.parseGestures(model)
        return
    return

console.log('Start monitoring...');
socket.monitor 500, 0

console.log "Connect to " + config.socket
socket.connect config.socket

window.actionController = actionController