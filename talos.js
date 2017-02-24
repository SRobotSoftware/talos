/* Turn off annoying eslint rules that don't apply here */

/* eslint no-prototype-builtins: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */

/* For some reason `document` isn't recognized as a global */

/* global document */




/* Grid functions TODO: turn into class */

function Grid(rows, columns) {
  this.area = new Array(rows)
    .fill(null, 0, rows)
    .map(() => new Array(columns)
      .fill(null, 0, columns)
      .map(() => ({})));


  this.isEmpty = (x, y) => {
    // Returns true if a given space is empty or false if not
    const target = this.area[y][x];
    return !(target.hasOwnProperty('contains') && target.contains);
  };

  this.getEmptyLength = () => {
    // Returns the number of empty cells left in the grid__cell
    return this.area.reduce((emptyCellCount, row) =>
      (emptyCellCount += row.reduce((emptyCells, cell) => {
        return (!cell.hasOwnProperty('contains') || cell.contains === null) ? ++emptyCells : emptyCells;
      }, 0)
    ), 0);
  };

  this.getAllEmpty = () => {
    const availableSpaces = [];
    this.area.forEach(row => {
      row.forEach(cell => {
        if (!cell.hasOwnProperty('contains') || cell.contains === null) {
          availableSpaces.push(cell);
        }
      });
    });
    return availableSpaces;
  };

  this.getRandomEmpty = () => {
    // Returns a cell if a space is available
    // Returns false if not
    const availableSpaces = this.getAllEmpty();

    if (availableSpaces.length === 0) return false;

    const result = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];

    return result;
  };


  return this;
}

function setBoundary(grid) {
  grid.area = grid.area.map((row, rowIndex) => row.map((cell, cellIndex) => {
    cell.x = cellIndex;
    cell.y = rowIndex;
    if (
      rowIndex === 0 ||
      rowIndex === grid.area.length - 1 ||
      cellIndex === 0 ||
      cellIndex === row.length - 1
    ) {
      cell.contains = 'wall';
    }
    return cell;
  }));
}

const grid = new Grid(10, 10);

console.groupCollapsed('Grid Testing');
console.log(grid.area);
console.log(grid.isEmpty(0, 0));

setBoundary(grid);

console.log(grid.area);
console.log(grid.isEmpty(1, 1));
console.groupEnd('Grid Testing');

// Add a few random plants
function seedEntities(targetGrid, entity, numberOfEntities) {
  const availableSpaces = targetGrid.getEmptyLength();

  if (numberOfEntities > availableSpaces) {
    console.warn('Error: seedEntities: Not enough available space in grid: Entities Requested: %i, Spaces Available: %i', numberOfEntities, availableSpaces);
    return false;
  }

  const placedEntities = [];

  function getPlot() {
    const plot = targetGrid.getRandomEmpty();
    return (placedEntities.some(planted => planted.x === plot.x && planted.y === plot.y)) ? getPlot() : plot;
  }

  while (numberOfEntities--) {
    const plot = getPlot();
    plot.contains = entity;
    placedEntities.push(plot);
  }
  return true;
}

seedEntities(grid, 'plant', 5);
seedEntities(grid, 'animal', 5);




/* Page Rendering stuff */

console.group('HTML Doc Testing');
const pageGrid = document.getElementsByClassName('js-grid')[0];
console.log('pageGrid found: %o', pageGrid);
grid.area.forEach(row => {
  const pageGridRow = document.createElement('tr');
  row.forEach(cell => {
    const pageGridCell = document.createElement('td');
    pageGridCell.className = `grid__cell ${cell.contains}`;
    pageGridRow.appendChild(pageGridCell);
  });
  pageGrid.appendChild(pageGridRow);
});
console.groupEnd('HTML Doc Testing');
