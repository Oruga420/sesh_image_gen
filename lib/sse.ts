export class SSEWriter {
  private encoder = new TextEncoder();

  constructor(private controller: ReadableStreamDefaultController) {}

  write(data: string) {
    this.controller.enqueue(this.encoder.encode(`data: ${data}\n\n`));
  }

  close() {
    this.controller.close();
  }
}

export function createSSEResponse() {
  const stream = new ReadableStream({
    start(controller) {
      return new SSEWriter(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}