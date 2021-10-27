export type Station = { id: string; name: string };

export type Stop = { from: Station; to: Station; dateTime: Date };

export type Meeting = { dateTime: Date; station: Station };
