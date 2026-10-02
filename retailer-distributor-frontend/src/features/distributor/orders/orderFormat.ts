// Full order ids are UUIDs; the first block is enough to tell orders apart on screen.
export const shortOrderId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

export const formatOrderDate = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
