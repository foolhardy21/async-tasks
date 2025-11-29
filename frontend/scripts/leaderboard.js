
function Leaderboard() {
    this.connectionReady = false
    this.socket = null
    this.serverEvents = null

    this.makeConnection = function () {
        const { io } = require("socket.io-client")
        const socket = io("http://localhost:3000", {})
        this.socket = socket
        this.socket.on("message", function (data) {
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
        this.socket.send(JSON.stringify(data))
    }

    this.makeEventsConnection = function () {
        const events = new EventSource("http://localhost:3000/server-events")
        this.serverEvents = events
        this.serverEvents.onmessage = function ({ data }) {
            console.log(data)
        }
    }
}

const leaderboard = new Leaderboard()
leaderboard.makeEventsConnection()