const { io } = require("socket.io-client")

function Leaderboard() {
    this.connectionReady = false
    this.socket = null

    this.makeConnection = function () {
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
}

const leaderboard = new Leaderboard()
leaderboard.makeConnection()
leaderboard.getStandings()