const { WebSocket } = require("ws")

function Leaderboard() {
    this.connectionReady = false
    this.ws = null

    this.makeConnection = function () {
        const websocket = new WebSocket("ws://localhost:443/ws")
        this.ws = websocket
        this.ws.on("message", function (data) {
            const { type, payload } = JSON.parse(data)
            switch (type) {
                case "leaderboard.latest":
                    console.log("Leaderboard Standings:", payload)
                    break
                default: return
            }
        })
    }

    this.getStandings = function () {
        const data = { type: "leaderboard.latest" }
        const intervalId = setInterval(() => {
            if (this.ws.readyState === 1) {
                this.ws.send(JSON.stringify(data))
                clearInterval(intervalId)
            }
        }, 10)
    }
}

const leaderboard = new Leaderboard()
leaderboard.makeConnection()
leaderboard.getStandings()