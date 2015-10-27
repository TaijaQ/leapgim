#
# Action Controller
#
# Triggers mouse and keyboard actions based on configured recipes. Actions are idempotent operations.
#

feedback = window.feedback
config = window.config

class ActionController
    constructor: ->
        @actions = window.config.actions
        @robot = require 'robotjs'
        @position =
            x: undefined
            y: undefined

    mouseMove: (position) =>
        screenSize = @robot.getScreenSize()
        moveTo =
            x: position.x * screenSize.width
            y: position.y * screenSize.height
        @robot.moveMouse(moveTo.x, moveTo.y)

    # down: up|down, button: left|right
    #mouseButton: (buttonState, button) =>
    #    feedback = window.feedback
    #    if(buttonState == 'up')
    #        @robot.mouseToggle buttonState, button
    #        if(@mouseState.button != buttonState)
    #            window.feedback.audioNotification 'asset/audio/mouseup.ogg'
    #    else if(buttonState == 'down')
    #        if(@mouseState.button != buttonState)
    #            @robot.mouseToggle buttonState, button
    #            window.feedback.audioNotification 'asset/audio/mousedown.ogg'
    #    window.feedback.mouseStatus button, buttonState
    #    @mouseState.button = buttonState

    mouseClick: (button, amount) =>
        feedback = window.feedback
        if amount is 'one'
            @robot.mouseClick(button)
            status = "Left clicked!"
        else if amount is 'two'
            @robot.doubleClick(button)
            status = "Double left clicked!"
        window.feedback.mouseStatus status

    executeAction: (action) =>
        console.log "Execute action: ", action
        cmd = @actions[action]
        if(cmd.type == 'mouse')
            if(cmd.action == 'click')
                button = cmd.target
                amount = cmd.amount
                @mouseClick(button, amount)
            if(cmd.action == 'move')
                @mouseMove(@position)

window.ActionController = ActionController
