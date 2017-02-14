function Grid(rows, columns) {
  this.area = new Array(rows)
    .fill(null, 0, rows)
    .map(() => new Array(columns)
      .fill(null, 0, columns)
      .map(() => ({})));
  this.isEmpty = (x, y) => {
    const target = this.area[y][x];
    return !(target.hasOwnProperty('contains') && target.contains);
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

console.log(grid.area);
console.log(grid.isEmpty(0, 0));

setBoundary(grid);

console.log(grid.area);
console.log(grid.isEmpty(1, 1));
