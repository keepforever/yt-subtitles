export interface Event {
  segs?: Array<{ utf8?: string }>;
}

export interface JsonData {
  events: Event[];
}

export function extractUtf8(jsonData: JsonData): string {
  let result = "";

  jsonData.events.forEach((event) => {
    if (event.segs) {
      event.segs.forEach((segment) => {
        if (segment.utf8) {
          result += segment.utf8;
        }
      });
    }
  });

  return result;
}
