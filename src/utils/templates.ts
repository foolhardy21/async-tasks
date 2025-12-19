import { QueueTask } from "../services/queueManager"

export function failedImageResizeTasksMail(tasks: Array<QueueTask | undefined>) {
    const rows = tasks
        .map((task, index) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${index + 1}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${task?.type}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${task?.data?.userId ?? "—"}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${task?.data?.path ?? "—"}
          </td>
        </tr>`)
        .join("")

    const body = `<div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="margin-bottom: 8px;">Background Task Failures</h2>
        <p style="margin-top: 0;">
          The following background tasks failed and require attention:
        </p>
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="border-collapse: collapse; margin-top: 16px;"
        >
          <thead>
            <tr>
              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">
                #
              </th>
              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">
                Event Type
              </th>
              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">
                User ID
              </th>
              <th align="left" style="padding: 8px; border-bottom: 2px solid #ddd;">
                Path
              </th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>`
    return {
        subject: `Failed Background Tasks (${tasks.length})`,
        body,
    }
}