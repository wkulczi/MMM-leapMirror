Module.register("MMM-leapmirror", {
    defaults: {},
    start: function () { },

    defaults: {
        foo: "I'm alive!"
    },
    start: function () {
        this.count = 0
    },

    getDom: function () {
        var element = document.createElement("div")
        element.className = "myContent"
        element.innerHTML = "Hello, World! " + this.config.foo
        var subElement = document.createElement("p")
        subElement.innerHTML = "Count:" + this.count
        subElement.id = "COUNT"
        element.appendChild(subElement)
        return element
    },


    notificationReceived: function (notification, payload, sender) {
        switch (notification) {
            case "DOM_OBJECTS_CREATED":
                var timer = setInterval(() => {
                    //   this.updateDom()
                    var countElm = document.getElementById("COUNT")
                    countElm.innerHTML = "Count:" + this.count
                    this.count++
                }, 1000)
                Leap.loop(function (frame) {
                    console.log(frame.hands.length); //gitara
                });
                break
        }
    },

    // https://forum.magicmirror.builders/topic/1515/how-to-load-a-script-src-script-into-my-mirror/2
    getScripts: function () {
        return [
            // 'https://js.leapmotion.com/leap-1.1.0.min.js',  // to by śmigało ale tego nie chcemy
            this.file('./node_modules/leapjs/leap-1.1.1.min.js'), //file from module folder
        ]
    },

    socketNotificationReceived: function () { },
})