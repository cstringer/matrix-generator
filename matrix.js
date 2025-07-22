/** Number of columns */
const NUM_COLS = 40;

/** Number of rows */
const NUM_ROWS = 25;

/** Main DOM element */
const matrix = document.getElementById('the_matrix');

/**
 *  Array to hold the columns.
 *  Each column is a DOM element that contains multiple cells:
 *  - Cells are created dynamically based on NUM_ROWS.
 *  - Each cell is a span element with a random character.
 *  - Cells are styled with CSS to create the matrix effect.
 *  - The cells are updated with random characters at intervals.
 */
const columns = [];

/**
 *  Array to hold the drops.
 *  Each drop is an object with properties:
 *  - columnIdx: index of the column where the drop is located
 *  - created: timestamp when the drop was created
 *  - lastUpdate: timestamp of the last update for the drop
 *  - rowIdx: current row index of the drop
 *  - size: size of the drop (how many rows it affects)
 *  - speed: speed of the drop (how often it updates)
 */
const drops = [];

/**
 * Flag to control animation state.
 * When true, the grid is animated with random characters and drops.
 */
let animationRunning = true;

/** Event listener for DOMContentLoaded.  */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  makeGrid();
  animateGrid();
});

/** Handle keyboard events */
document.addEventListener('keypress', (e) => {
  if (/^KeyF$/i.test(e.code)) {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      });
      return;
    } else {
      matrix.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  }
  if (/^Space$/i.test(e.code)) {
    animationRunning = !animationRunning;
  }
});

/**
 * Generates random number between 0 and scale (inclusive).
 * @param {number} scale 
 * @returns {number}
 */
function getRand(scale) {
  return Math.floor(Math.random() * (scale + 1));
}

/**
 * @returns {string}
 */
function getRandomChar() {
  return String.fromCharCode(getRand(92) + 65);
}

/**
 * @param {number} columnIdx
 * @param {number} rowIdx
 * @returns {HTMLSpanElement}
 */
function makeCell(columnIdx, rowIdx) {
  const cell = document.createElement('span');
  cell.classList.add('cell');
  cell.textContent = getRandomChar();
  return cell;
}

/**
 * @param {number} colIdx 
 * @returns {HTMLDivElement}
 */
function makeColumn(colIdx) {
const column = document.createElement('div');
  column.classList.add('column');
  return column;
}

/**
 * Creates the grid by generating columns and cells.
 * Each column is a div element containing multiple span elements (cells).
 * The number of columns is defined by NUM_COLS, and each column contains
 * NUM_ROWS cells.
 */
function makeGrid() {
  for (let ci = 0; ci < NUM_COLS; ci++) {
    const col = makeColumn(ci);
    columns.push(col);
    matrix.append(col);
    for (let ri = 0; ri < NUM_ROWS; ri++) {
      col.append(makeCell(ci, ri));
    }
  }
}

/**
 * Animates the grid by updating characters in cells and creating drops.
 * The animation runs in a loop, updating characters at intervals and
 *  managing drops that fall down the columns.
 * Each drop is represented by an object with properties that control its
 *  position, speed, and size.
 * The animation can be paused and resumed by toggling the animationRunning flag.
 * The animation uses requestAnimationFrame for smooth updates.
 * The function creates multiple drops initially and updates them based on
 *  timestamps to control their speed and position.
 * It also updates the last cell in each column with a new random character
 *  at regular intervals.
 */
function animateGrid() {
  let lastMixChars = 0;
  let lastCreateDrop = 0;
  let lastAnimateLast = 0;

  for (let d = 0; d < 5; d++) {
    createDrop();
  }

  const run = (timestamp) => {
    if (!animationRunning) {
      requestAnimationFrame(run);
      return;
    }

    timestamp = Math.floor(timestamp);

    const mcDiff =  timestamp - lastMixChars;
    const cdDiff =  timestamp - lastCreateDrop;
    const alDiff =  timestamp - lastAnimateLast;

    /* Update characters in the columns at intervals. */
    if (mcDiff >= 50) {
      lastMixChars = timestamp;

      columns.forEach((col) => {
        col.childNodes.forEach((cell) => {
          if (Math.random() < 0.2) {
            cell.textContent = getRandomChar();
          }
        });
      });
    }

    /* Create a new drop in a random column at intervals. */
    if (cdDiff >= getRand(750) + 250) {
      lastCreateDrop = timestamp;
      createDrop();
    }

    /* Update each drop in the drops array. */
    drops.forEach((drop, idx) => {
      if (timestamp - drop.lastUpdate >= drop.speed) {
        drop.lastUpdate = timestamp;
        const col = columns[drop.columnIdx];
        col.childNodes.forEach((cell, ci) => {
          cell.classList.remove('last');
          cell.classList.remove('hidden');
          if (ci === drop.rowIdx && drop.rowIdx < NUM_ROWS - 1) {
            cell.classList.add('last');
          } else if (ci > drop.rowIdx || ci < drop.rowIdx - drop.size) {
            cell.classList.add('hidden');
          } else {
            cell.style.opacity = ((100 / (drop.rowIdx + 1)) * ci) + '%';
          }
        });
        drop.rowIdx++;
      }
      if (drop.rowIdx >= NUM_ROWS) {
        drops.splice(idx, 1);
        createDrop({ columnIdx: drop.columnIdx });
        return;
      }
    });

    if (alDiff >= 100) {
      lastAnimateLast = timestamp;
      document.querySelectorAll('.last').forEach((cell) => {
        cell.textContent = getRandomChar();
      });
    }

    requestAnimationFrame(run);
  };

  requestAnimationFrame(run);
}

/**
 * Creates a new drop in a specified column or a random column.
 * - If a drop already exists in the specified column, it does not create a new one.
 * - If no column is specified, it randomly selects a column.
 * - The drop object contains properties such as:
 *   - columnIdx: index of the column where the drop is created
 *   - created: timestamp when the drop was created
 *   - lastUpdate: timestamp of the last update for the drop
 *   - rowIdx: current row index of the drop
 *   - size: size of the drop (how many rows it affects)
 *   - speed: speed of the drop (how often it updates)
 * - The drop is added to the drops array.
 * @param {object} options 
 * @param {number} [options.columnIdx] - Index of the column where the drop should be created.
 */
function createDrop({ columnIdx = null } = {}) {
  if (columnIdx === null) {
    columnIdx = getRand(NUM_COLS - 1);
  }

  const existingDrop = drops.find(drop => drop.columnIdx === columnIdx);
  if (existingDrop) {
    // Don't create a new drop if one already exists for this column
    return;
  }

  const drop = {
    columnIdx,
    created: Date.now(),
    lastUpdate: 0,
    rowIdx: getRand(NUM_ROWS - 1),
    size: getRand(NUM_ROWS - 1) + 1,
    speed: getRand(450) + 50
  };

  drops.push(drop);
}
