async function getThumbnailStatus() {
    try {
        console.log("Fetching the thumbnail status")
        await fetch("http://localhost:3000/api/tasks/thumbnail-status/63", {
            signal: AbortSignal.timeout(1000)
        })
    } catch (err) {
        console.log("Error while polling for thumbnail status:", err)
        if (err.name.includes("TimeoutError")) {
            getThumbnailStatus()
        }
    }
}
getThumbnailStatus()