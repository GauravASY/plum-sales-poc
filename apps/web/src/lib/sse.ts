export interface SseEvent {
  event: string;
  data: unknown;
}

export async function* readSseStream(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<SseEvent, void, void> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) break;
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIdx: number;
      while ((nlIdx = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, nlIdx);
        buffer = buffer.slice(nlIdx + 2);
        const evt = parseSseFrame(raw);
        if (evt) yield evt;
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // ignore
    }
  }
}

function parseSseFrame(raw: string): SseEvent | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    if (line.startsWith(":")) continue; // comment
    const colonIdx = line.indexOf(":");
    const field = colonIdx === -1 ? line : line.slice(0, colonIdx);
    const value =
      colonIdx === -1 ? "" : line.slice(colonIdx + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
  }
  if (dataLines.length === 0) return null;
  const dataRaw = dataLines.join("\n");
  let data: unknown = dataRaw;
  try {
    data = JSON.parse(dataRaw);
  } catch {
    // leave as raw string
  }
  return { event, data };
}
