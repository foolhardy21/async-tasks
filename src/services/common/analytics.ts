export async function sendAnalytics(eventMessage: string, payload: any) {
    try {
        const url = process.env.LOGFLARE_URL + "?source=" + process.env.LOGFLARE_SOURCE_TOKEN
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.LOGFLARE_API_KEY || "",
            },
            body: JSON.stringify({ event_message: eventMessage, ...payload }),
        })
        res = await res.json()
        console.log("Analytics sent:", res)
    } catch (err) {
        console.log("Error sending the anlytics:", err)
    }
}