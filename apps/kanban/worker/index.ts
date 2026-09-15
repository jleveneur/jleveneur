import handler from "vinext/server/app-router-entry"

export { BoardRoom } from "./board-room.ts"

export default {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith("/api/realtime/")) {
      const boardId = url.pathname.slice("/api/realtime/".length)
      if (boardId === "") {
        return new Response("Missing board", { status: 400 })
      }
      const stub = env.BOARD_ROOM.getByName(boardId)
      return stub.fetch(request)
    }

    return handler.fetch(request)
  }
}
