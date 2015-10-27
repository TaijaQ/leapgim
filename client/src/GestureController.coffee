#
# Gesture Controller
#
# Parses signs (leapgim's own gestures) and triggers actions based on recipes.
#

config = window.config
manager = window.actionHero

class GestureController
    constructor: ->
        @signs = window.config.signs
        @recipes = window.config.recipes
        @startTime = null
        @timestamp = null
        # Milliseconds. Release mouse buttons if no new data is received during this time frame.
        #@timeout = window.config.timeout

    assertSign: (sign, frameData) =>
        # Assert true unless a filter statement is found

        sign_ok = true

        for handModel in frameData.hands
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


    parseGestures: (model) =>

        #console.log "Model: ", model

        feedback = window.feedback
        manager = window.actionHero
        manager.position = model.hands[0].position

        #@currentFrame = model.frame().id

        # If this is the first time, record the timestamp
        if !@startTime?
            @startTime = model.timestamp
        else
            @timestamp = model.timestamp

        # Time elapsed in ms since the start
        elapsedMS = @timestamp - @startTime 
        elapsedSeconds = elapsedMS / 1000000

        window.feedback.time elapsedSeconds

        visible = model.hands[0].visible

        window.feedback.handVisible visible

        validSigns = []
        for signName,signData of @signs
            if(@assertSign(signData, model))
                validSigns.push signName

        # TODO: Figure out tear down mechanism
        for recipeName, recipe of @recipes
            if(recipe.sign in validSigns)
                manager = window.actionHero
                manager.executeAction(recipe.action)

window.GestureController = GestureController
