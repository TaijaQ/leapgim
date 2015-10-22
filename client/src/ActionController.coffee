#
# Action Controller
#
# Action controller's job is to recieve "leapgim frames" from the frame
# controller.
#
class ActionController
    constructor: ->
        @config = window.config
        @robot = require 'robotjs'
        @signRecord = {}
        ## TODO TODO
        #for own sign Object.keys(config.signs)
        @mouseState =
            left : "up",
            right : "up"
        # Microseconds. Timestamp from previous message.
        @serverTimestamp = false
        # Milliseconds. Release mouse buttons if no new data is received during this time frame.
        @timeout = @config.timeout
        # UTC timestamp in milliseconds
        @clientTimestamp
        # Timeout event listener ID
        @timeoutID = false
        @tearDownQueue = []

    assertSign: (sign, frameData) =>

        #console.log "Assert sign: ", sign, frameData

        # Assert true unless a filter statement is found
        sign_ok = true

        for handModel in frameData.hands
            #console.log "handModel: ", handModel
            if(sign.grab)
                grabStrength = handModel.grabStrength
                if(sign.grab.min)
                    if(grabStrength < sign.grab.min)
                        sign_ok = false
                if(sign.grab.max)
                    if(grabStrength > sign.grab.max)
                        sign_ok = false
            if(sign.pinch)
                pinchStrength = handModel.pinchStrength
                pincher = handModel.pinchingFinger

                if(sign.pinch.pincher)
                    if (sign.pinch.pincher != pincher)
                        sign_ok = false
                if(sign.pinch.min)
                    if(pinchStrength < sign.pinch.min)
                        sign_ok = false
                if(sign.pinch.max)
                    if(pinchStrength > sign.pinch.max)
                        sign_ok = false
            if(sign.extendedFingers)
                extendedFingers = sign.extendedFingers
                if(extendedFingers.indexFinger is not undefined)
                    if extendedFingers.indexFinger != handModel.extendedFingers.indexFinger
                        sign_ok = false
                if(extendedFingers.middleFinger is not undefined)
                    if extendedFingers.middleFinger != handModel.extendedFingers.middleFinger
                        sign_ok = false
                if(extendedFingers.ringFinger is not undefined)
                    if extendedFingers.ringFinger != handModel.extendedFingers.ringFinger
                        sign_ok = false
                if(extendedFingers.pinky is not undefined)
                    if extendedFingers.pinky != handModel.extendedFingers.ringFinger
                        sign_ok = false
                if(extendedFingers.thumb is not undefined)
                    if extendedFingers.thumb != handModel.extendedFingers.thumb
                        sign_ok = false
        return sign_ok

    audioNotification: (clip) ->
        audio = new Audio(clip)
        audio.play()

    mouseMove: (position) =>
        screenSize = @robot.getScreenSize()
        moveTo =
            x: position.x * screenSize.width
            y: position.y * screenSize.height
        @robot.moveMouse(moveTo.x, moveTo.y)

    # down: up|down, button: left|right
    mouseButton: (down, button) =>

        if(@mouseState.button != down)
            if(down == 'down')
                @audioNotification 'asset/audio/mousedown.ogg'
            else
                @audioNotification 'asset/audio/mouseup.ogg'
            @mouseState.button = down
            @robot.mouseToggle down, button

        # Extra mouse up
        if(down == 'up')
            @robot.mouseToggle down, button

    executeAction: (cmd) =>
        console.log "Execute action: ", cmd
        if(cmd.type == 'mouse')
            if(cmd.action == 'hold')
                button = cmd.target
                @mouseButton 'down', button
            if(cmd.action == 'release')
                button = cmd.target
                @mouseButton 'up', button
            if(cmd.action == 'move')
                console.log "Moooove"
                console.log "Position: ", @position
                @mouseMove(@position)

    parseGestures: (model) =>

        console.log "Parsing gestures.."
        #console.log "model: ", model
        #console.log "config.signs: ", @config.signs

        # Mouse tracking quick'n'dirty
        @position = model.hands[0].position

        #@timestamp = model.timestamp
        # TODO: Implement processSign and properly figure out this shit
        # Timeout handling
        #if(@timer)
        #    clearTimeout(@timer)
        #@timer = setTimeout()

        validSigns = []

        for signName,signData of @config.signs
            #console.log "Assert " + signName
            if(@assertSign(signData, model))
                console.log "Assert ok for " + signName
                validSigns.push signName

        # TODO: Figure out tear down mechanism

        for recipeName, recipe of @config.recipes
            if(recipe.sign in validSigns)
                console.log "Trigger recipe action: " + recipe.action
                console.log "Config actions: ", @config.actions
                action = @config.actions[recipe.action]
                console.log "Interpolated: ", action
                @executeAction(action)
                @tearDownQueue.push(action.tearDown)


window.ActionController = ActionController