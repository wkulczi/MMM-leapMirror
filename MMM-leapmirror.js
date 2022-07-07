Module.register("MMM-leapmirror", {
    controller: undefined,
    leapControllerOptions: {
        enableGestures: true,
    },
	frameBuffer: [],
	gestureLock: false,

    defaults: {
        foo: "I'm alive!",
        actions: {
            isAnyHand: true, //take left or right hand and set is as the main
            leftHandActions: {
                isAnyFinger: true,
                finger0: {
                    keyTap: "",
                    screenTap: "",
                    circleClockwise: "",
                    circleCounterclockwise: "",
                    swipeUp: "",
                    swipeDown: "",
                    swipeLeft: "PAGE_DECREMENT",
                    swipeRight: "PAGE_INCREMENT",
                },
                // finger1: {},
                // finger2: {},
                // finger3: {},
                // finger4: {},
            },
            // rightHandActions: {
            // anyFinger: false,
            // finger0: {},
            // finger1: {},
            // finger2: {},
            // finger3: {},
            // finger4: {},
            // },
        }
    },

    start: function () {
        const isAnyHand = !!this.config.actions.isAnyHand;
        if (isAnyHand) {
            if (this.config.actions.leftHandActions) {
                this.config.actions.anyHandActions = this.config.actions.leftHandActions;
            }
            else {
                this.config.actions.anyHandActions = this.config.actions.rightHandActions;
            }
        }
    },

    getDom: function () {
        var element = document.createElement("div")
        element.className = "myContent"
        element.innerHTML = "Hello, World! " + this.config.foo
        var handElement = document.createElement("p")
        handElement.innerHTML = "Hand:";
        handElement.id = "HAND";
        var fingerElement = document.createElement("p")
        fingerElement.innerHTML = "Finger:";
        fingerElement.id = "FINGER";
        var gestureElement = document.createElement("p")
        gestureElement.innerHTML = "Gesture:";
        gestureElement.id = "GESTURE";
		var gestureLockElement = document.createElement("p")
		gestureLockElement.innerHTML = "Lock: OFF";
		gestureLockElement.id = "GESTURE_LOCK"
        element.appendChild(handElement)
        element.appendChild(gestureElement)
        element.appendChild(fingerElement)
		element.appendChild(gestureLockElement)
        return element
    },


    notificationReceived: function (notification, payload, sender) {
        switch (notification) {
            case "DOM_OBJECTS_CREATED":

            this.sendNotification("PAUSE_ROTATION") //should not be here, mmm-pages seems to lack a setting for that

                this.controlller = Leap.loop((frame) => {
					this.updateGestureTilt();
					if (!this.gestureLock){
						if (frame.hands.length){
							this.frameBuffer.push(frame)
							const hasAnyGestures = this.frameBuffer.map(value => value.gestures.length).some((gestureCounter) => gestureCounter > 0);
							if (hasAnyGestures) {
								this.parseGesture();
								this.gestureLock = true;
								setTimeout(() => {
									this.frameBuffer = [];
									this.gestureLock = false;
								}, 1000) //arbitrarily chosen number
							}
						}
					}
                });
                this.controlller.setBackground(true);
                break
        }
    },

    useLeapGesture: function (frameGestureInfo) {
        let possibleActions = {};
        let isAnyFinger = false;
        if (!this.config.actions.isAnyHand) {
            if (frameGestureInfo.hand === 'left') {
                possibleActions = this.config.actions.leftHandActions;
                isAnyFinger = !!this.config.actions.leftHandActions.isAnyFinger
            }
            else {
                possibleActions = this.config.actions.rightHandActions;
                isAnyFinger = !!this.config.actions.rightHandActions.isAnyFinger
            }
        } else {
            possibleActions = this.config.actions.anyHandActions;
            isAnyFinger = this.config.actions.anyHandActions.isAnyFinger;
        }
        if (!isAnyFinger) {
            possibleActions = possibleActions[`finger${frameGestureInfo.finger}`]
        } else {
            possibleActions = possibleActions['finger0']
        }
        console.log(`executinngAction -[${frameGestureInfo.direction}]: ${possibleActions[frameGestureInfo.direction]}`)
        this.sendNotification(possibleActions[frameGestureInfo.direction]);
    },

    updateModuleView: function (frameGestureInfo) {
        var handElm = document.getElementById("HAND")
        handElm.innerHTML = "Hand:" + frameGestureInfo.hand;

        var fingerElm = document.getElementById("FINGER")
        fingerElm.innerHTML = "Finger:" + frameGestureInfo.finger;

        var gestureElm = document.getElementById("GESTURE")
        gestureElm.innerHTML = "Gesture:" + frameGestureInfo.direction;
    },

	updateGestureTilt: function (){
		var handElm = document.getElementById("GESTURE_LOCK")
		handElm.innerHTML = `Lock: ${this.gestureLock ? 'ON' : 'OFF'}`
	},

    parseGesture: function () {
            const handInfo = LeapHelper.parseHandInfo(this.frameBuffer)

            LeapHelper.addGestureDirection(this.frameBuffer);
            const dedupedGestures = LeapHelper.dedupContinuousMoves(this.frameBuffer.map(value => value.gestures).flat());

            for (const gesture of dedupedGestures) {
                const gestureInfo = LeapHelper.parseGestureInfo(gesture, handInfo);
                this.useLeapGesture(gestureInfo);
                this.updateModuleView(gestureInfo);
            }
    },

    getScripts: function () {
        return [
            this.file('./node_modules/leapjs/leap-1.0.0.min.js'), //file from module folder
            this.file('./leapHelper.js'),
            this.file('./node_modules/lodash/lodash.min.js')
        ]
    },

    socketNotificationReceived: function () { },
})
