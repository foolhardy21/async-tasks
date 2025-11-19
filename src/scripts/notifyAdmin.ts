
function handleNotifyAdmin() {
    console.log("handleNotifyAdmin")
    setTimeout(() => {
        console.log("Notified admin:", workerData)
        parentPort?.postMessage({ data: workerData })
    }, 2 * 1000)
}

handleNotifyAdmin()