export const EVENTS = {
    IMAGE_UPLOAD: "upload-image",
}

export const EVENT_TASKS_MAP = {
    [EVENTS.IMAGE_UPLOAD]: ["generate-thumbnail", "log-upload", "notify-admin"]
}