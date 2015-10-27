#
# Feedback Controller
#
# Relies visual and auditory feedback to the user.
#

config = window.config

class FeedbackController
    constructor: ->
        console.log "Feedback control ready"

    audioNotification: (clip) ->
        audio = new Audio(clip)
        audio.play()

    mouseStatus: (status) ->
        document.getElementById('left').innerHTML = status

    time: (elapsed) ->
        document.getElementById('timer').innerHTML = elapsed

    handVisible: (visible)->
        document.getElementById('handVisible').innerHTML = visible

window.FeedbackController = FeedbackController