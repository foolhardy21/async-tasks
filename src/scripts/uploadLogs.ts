
function handleUploadLog() {
    console.log("handleUploadLog")
    setTimeout(() => {
        console.log("Uploaded logs:", workerData)
        parentPort?.postMessage({ data: workerData })
    }, 1 * 1000)
}

handleUploadLog()