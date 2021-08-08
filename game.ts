import {
  addSpace,
  userPrompt,
  userPromptString,
  isValidNumericInput,
} from "./utils";
import { Board, Coordinates, Ship, ShipDirection, ShipList } from "./types";

// Constants
const DISPLAY_SPACE: number = 3;
const DISPLAY_SPACE_SHIP: number = 5;
const SHIP_DISPLAY_VALUE: string = "-";
const SHIP_DISPLAY_HIT_VALUE: string = "X";

// User Input
const boardSize = userPrompt("What board size board would you like?: ");
const numberOfShips = userPrompt("How many ships would you like to place?: ");

// Player variables
const playerGrid: Board = drawGrid(boardSize);
const playerShips: ShipList = [];

// Game control
let isGameRunning: boolean = true;
let isInputValid: boolean = false;

sanitizeInput();
initializeGame();

function initializeGame() {
  if (!isInputValid) {
    console.error(
      "Error! Please input valid numbers for board size and number of ships"
    );
    return;
  }
  drawShips({ board: playerGrid, ships: playerShips, numberOfShips });
  printGrid(playerGrid);
  startGame();
}

function sanitizeInput() {
  if (isValidNumericInput(boardSize) && isValidNumericInput(numberOfShips)) {
    isInputValid = true;
  }
}

function startGame() {
  console.log(`GAME STARTING -----------`);

  // Begin game loop
  while (isGameRunning) {
    const x: number = userPrompt("Please enter an X coordinate: ");
    const y: number = userPrompt("Please enter an Y coordinate: ");

    const hit = attack({ board: playerGrid, ships: playerShips, x, y });

    printGrid(playerGrid);

    if (!hit) {
      continue;
    }

    updateShipList({ ships: playerShips, x, y });

    const shipsEmpty = checkShips(playerShips);

    if (shipsEmpty) {
      console.log("You lose!");
      isGameRunning = false;
    }
  }
}

type UpdateShipListProps = Coordinates & {
  ships: ShipList;
};

function updateShipList({ ships, x, y }: UpdateShipListProps) {
  const coordinatePosition: string = `${x}-${y}`;

  // Remove ship coordinate where enemy has attacked
  ships.map((ship: Ship, index: number) => {
    ships[index] = ship.filter(
      (shipCoordinate) => shipCoordinate !== coordinatePosition
    );
  });
}

function printHeaderRow() {
  let headerRowString = addSpace(" ", DISPLAY_SPACE_SHIP);
  for (let i = 0; i < boardSize; i++) {
    headerRowString += `${i}${addSpace(" ", DISPLAY_SPACE_SHIP)}`;
  }

  console.log(headerRowString + " \n");
}

function printGrid(board: Board) {
  printHeaderRow();

  for (let i = 0; i < boardSize; i++) {
    const row = board[i];
    let rowString = `${i}${addSpace(" ", DISPLAY_SPACE)}`;
    for (let c of row) {
      const spaces =
        c === "X" || c === "-" ? DISPLAY_SPACE_SHIP : DISPLAY_SPACE;
      rowString += c + addSpace(" ", spaces);
    }
    console.log(rowString);
  }
}

function checkShips(ships: ShipList) {
  let isEmpty = true;

  for (const ship of ships) {
    if (ship.length !== 0) {
      isEmpty = false;
      break;
    }
  }

  return isEmpty;
}

type DrawShipsProps = {
  board: Board;
  ships: ShipList;
  numberOfShips: number;
};

function drawShips({ board, ships, numberOfShips }: DrawShipsProps) {
  for (let i = 0; i < numberOfShips; i++) {
    console.log(`DRAWING SHIP ${i + 1} -----------`);
    const x: number = userPrompt("Please enter an X coordinate: ");
    const y: number = userPrompt("Please enter an Y coordinate: ");
    const shipSize: number = userPrompt(
      "Please enter the length of your ship: "
    );
    const direction: ShipDirection =
      shipSize > 1
        ? userPromptString(
            "Please enter the direction of your ship - either 'right' or 'down': ",
            "right"
          )
        : "right";

    const newShip = drawShipToBoard({
      x,
      y,
      board,
      direction,
      ships,
      shipSize,
    });

    // Redo current interation of loop if unsuccessful
    // Could potentially look to implement a counter, and if > 3 error, exit the game
    if (!newShip) {
      console.error("Error! Need to re-draw ship");
      i = i - 1;
      continue;
    }

    ships.push(newShip);
  }
}

function drawGrid(boardSize: number) {
  let grid: Board = [];
  for (let i = 0; i < boardSize; i++) {
    grid[i] = [];
    for (let j = 0; j < boardSize; j++) {
      grid[i][j] = `${j}-${i}`;
    }
  }

  return grid;
}

// Ship Drawing Validation

function validateShipCoordinate(value: number) {
  return value < boardSize && isValidNumericInput(value);
}

type ShipValidationProps = Coordinates & {
  shipSize: number;
};

function isValidShipPosition({ x, y, shipSize }: ShipValidationProps) {
  if (!validateShipCoordinate(x)) {
    console.error("Ship X Coordinate invalid!");
    return false;
  }
  if (!validateShipCoordinate(y)) {
    console.error("Ship Y Coordinate invalid!");
    return false;
  }
  if (!validateShipCoordinate(shipSize)) {
    console.error("Ship size invalid!");
    return false;
  }

  return true;
}

type DrawShipsPropsToBoard = Coordinates & {
  board: Board;
  ships: ShipList;
  shipSize: number;
  direction: ShipDirection;
};

function drawShipToBoard({
  x,
  y,
  board,
  shipSize,
  direction = "right",
}: DrawShipsPropsToBoard) {
  const newShip = [];

  if (!isValidShipPosition({ x, y, shipSize })) {
    return;
  }

  // Check horizontal bounds
  if (direction === "right") {
    if (x + shipSize > boardSize) {
      console.error("Error! Your ship goes off the board horizontally");
      return;
    }

    /*
      Collision check - done in advance to avoid an edge case
      of the nth element being a collision after already updating 
      previous elements
    */
    for (let i = x; i < x + shipSize; i++) {
      if (board[y][i] === SHIP_DISPLAY_VALUE) {
        console.error(
          "Error! There's an existing ship at these coordinates. Please try again."
        );
        return;
      }
    }

    // Add ship to board
    for (let i = x; i < x + shipSize; i++) {
      board[y][i] = SHIP_DISPLAY_VALUE;
      newShip.push(`${i}-${y}`);
    }
  }

  // Check vertical bounds
  else if (direction === "down") {
    if (y + shipSize > boardSize) {
      console.error("Error! Your ship goes off the board vertically");
      return;
    }

    /*
      Collision check - done in advance to avoid an edge case
      of the nth element being a collision after already updating 
      previous elements
    */
    for (let i = y; i < y + shipSize; i++) {
      if (board[i][x] === SHIP_DISPLAY_VALUE) {
        console.error(
          "Error! There's an existing ship at these coordinates. Please try again."
        );
        return;
      }
    }

    // Add ship to board
    for (let i = y; i < y + shipSize; i++) {
      board[i][x] = SHIP_DISPLAY_VALUE;
      newShip.push(`${x}-${i}`);
    }
  }

  return newShip;
}

// Position Utils
type GetPositionProps = Coordinates & {
  board: Board;
};

function getPosition({ board, x, y }: GetPositionProps) {
  return board[y][x];
}

// Attack Utils
type AttackProps = Coordinates & {
  board: Board;
  ships: ShipList;
};

function isValidAttackCoordinates(x: number, y: number) {
  if (!validateShipCoordinate(x)) {
    console.error("Error! Please input a valid X attack coordinate");
    return false;
  }

  if (!validateShipCoordinate(y)) {
    console.error("Error! Please input a valid Y attack coordinate");
    return false;
  }

  return true;
}

function attack({ board, x, y }: AttackProps) {
  if (!isValidAttackCoordinates(x, y)) {
    return false;
  }

  console.log(`ATTACKING: ${x}-${y}`);
  const coordinateValue: string = getPosition({ board, x, y });

  if (coordinateValue === SHIP_DISPLAY_VALUE) {
    console.log("HIT");

    // Visual board Update
    board[y][x] = SHIP_DISPLAY_HIT_VALUE;
    return true;
  } else {
    console.log("MISSED");
    return false;
  }
}
