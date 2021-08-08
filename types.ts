export type Board = BoardRow[]; // [[], [], []]
export type BoardRow = any[];
export type Ship = string[];
export type ShipList = Ship[]; // [["4-0", "4-2"]]

export type ShipDirection = "right" | "down" | string;
export type Coordinates = {
  x: number;
  y: number;
};
