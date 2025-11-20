import { EVENTS } from "./eventsUtils";

export const ALLOWED_BACKGROUND_TASKS = {
    [EVENTS.IMAGE_UPLOAD]: ["generate-thumbnail", "log-upload", "notify-admin"]
}