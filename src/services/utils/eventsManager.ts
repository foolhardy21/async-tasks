
class EventsManager {
    #eventsMap: Record<string, Function> = {}

    constructor() {
        this.#eventsMap = {}
    }

    subscribe(event: string, handler: Function) {
        console.log("Event subscribed:", event)
        this.#eventsMap[event] = handler
    }

    fire(event: string, ...args: any) {
        console.log("Event handler invoked:", event)
        this.#eventsMap[event].call(this, ...args)
    }
}

const eventsManager = new EventsManager()

export default eventsManager