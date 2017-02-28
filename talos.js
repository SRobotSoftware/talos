/* Turn off annoying eslint rules that don't apply here */

/* eslint no-prototype-builtins: 0 */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */

/* eslint no-confusing-arrow: 0 */
/* eslint no-nested-ternary: 0 */

/* For some reason `document` isn't recognized as a global */

/* global document */



/* Brains and junk */

const entities = {
  animal: {
    name: 'animal',
    food: 'plant',
    life: 10,
    alive: true,
    age: 0,
    logic: (grid, self, x, y) => {
      if (!self.alive) return;
      console.groupCollapsed('Animal Thoughts');
      // Look for food
      const foodSources = grid.getAdjacent(x, y).filter(cell => cell.hasOwnProperty('contains') && cell.contains !== null && cell.contains.name === self.food);
      if (foodSources.length) {
        console.info('YAY FOOD: %i', self.life);
        const consume = foodSources[Math.floor(Math.random() * foodSources.length)];
        self.life += consume.contains.alive ? 2 : 1;
        grid.area[consume.y][consume.x].contains = null;
      }
      if (self.life) {
        // Think about moving
        // filter out other animals, walls, and plants
        const adjacent = grid.getAdjacent(x, y).filter(cell => !cell.hasOwnProperty('contains') || cell.contains === null);
        if (adjacent.length) {
          console.info('I CAN MOVE TO: %o', adjacent);
          const destination = adjacent[Math.floor(Math.random() * adjacent.length)];
          console.info('GONNA MOVE TO: %o', destination);
          grid.area[destination.y][destination.x].contains = self;
          grid.area[y][x].contains = null;
          self.life--;
        }
        self.age++;
      } else {
        console.info('I HAVE DIED');
        self.alive = false;
      }
      console.groupEnd('Animal Thoughts');
    },
  },

  plant: {
    name: 'plant',
    age: 0,
    alive: true,
    logic: (grid, self, x, y) => {
      self.age++;
      if (!self.alive) {
        // Decay after 3-15 ticks
        if (self.age >= Math.floor(Math.random() * 12) + 3) grid.area[y][x].contains = null;
        return;
      }
      // Every 5 ticks, grow
      if (self.age % 5 === 0) {
        const availableCells = grid.getAdjacentEmpty(x, y);
        if (availableCells.length) {
          const growth = Object.assign({}, self);
          growth.age = 0;
          availableCells[Math.floor(Math.random() * availableCells.length)].contains = growth;
        }
      }
      // Die after 5-15 ticks
      if (self.age >= Math.floor(Math.random() * 10) + 5) {
        self.alive = false;
        self.age = 0;
      }
    },
  },

  wall: {
    name: 'wall',
  },
};


/* Grid functions TODO: turn into class */

function Grid(rows, columns) {
  this.area = new Array(rows)
    .fill(null, 0, rows)
    .map(() => new Array(columns)
      .fill(null, 0, columns)
      .map(() => ({})));
  this.pageGrid = document.getElementsByClassName('js-grid')[0];


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

  this.getAdjacent = (x, y) => {
    const adjacentArray = [
      this.area[Math.max(y - 1, 0)][Math.max(x - 1, 0)],
      this.area[Math.max(y - 1, 0)][x],
      this.area[Math.max(y - 1, 0)][Math.min(x + 1, this.area[0].length - 1)],
      this.area[y][Math.max(x - 1, 0)],
      this.area[y][Math.min(x + 1, this.area[0].length - 1)],
      this.area[Math.min(y + 1, this.area.length - 1)][Math.max(x - 1, 0)],
      this.area[Math.min(y + 1, this.area.length - 1)][x],
      this.area[Math.min(y + 1, this.area.length - 1)][Math.min(x + 1, this.area[0].length - 1)],
    ];
    return adjacentArray;
  };

  this.getAdjacentEmpty = (x, y) => {
    const adjacentArray = [
      this.area[Math.max(y - 1, 0)][Math.max(x - 1, 0)],
      this.area[Math.max(y - 1, 0)][x],
      this.area[Math.max(y - 1, 0)][Math.min(x + 1, this.area[0].length - 1)],
      this.area[y][Math.max(x - 1, 0)],
      this.area[y][Math.min(x + 1, this.area[0].length - 1)],
      this.area[Math.min(y + 1, this.area.length - 1)][Math.max(x - 1, 0)],
      this.area[Math.min(y + 1, this.area.length - 1)][x],
      this.area[Math.min(y + 1, this.area.length - 1)][Math.min(x + 1, this.area[0].length - 1)],
    ];
    return adjacentArray.filter(cell => !cell.hasOwnProperty('contains') || cell.contains === null);
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

  this.getAllEntities = excludes => {
    if (!excludes) excludes = [];
    const availableEntities = [];
    this.area.forEach(row => {
      row.forEach(cell => {
        if (cell.hasOwnProperty('contains') && cell.contains !== null && !excludes.some(e => cell.contains.name === e)) {
          availableEntities.push(cell);
        }
      });
    });
    return availableEntities;
  };

  this.getRandomEmpty = () => {
    // Returns a cell if a space is available
    // Returns false if not
    const availableSpaces = this.getAllEmpty();

    if (availableSpaces.length === 0) return false;

    const result = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];

    return result;
  };

  this.setBoundary = entity => {
    this.area = this.area.map((row, rowIndex) => row.map((cell, cellIndex) => {
      cell.x = cellIndex;
      cell.y = rowIndex;
      if (
        rowIndex === 0 ||
        rowIndex === this.area.length - 1 ||
        cellIndex === 0 ||
        cellIndex === row.length - 1
      ) {
        cell.contains = entity;
      }
      return cell;
    }));
  };

  this.render = () => {
    while (this.pageGrid.hasChildNodes()) {
      this.pageGrid.removeChild(this.pageGrid.lastChild);
    }
    this.area.forEach(row => {
      const pageGridRow = document.createElement('tr');
      row.forEach(cell => {
        const pageGridCell = document.createElement('td');
        pageGridCell.className = `grid__cell ${cell.hasOwnProperty('contains') && cell.contains !== null ? `${cell.contains.name} ${cell.contains.alive ? 'alive' : 'dead'}` : ''}`;
        pageGridRow.appendChild(pageGridCell);
      });
      this.pageGrid.appendChild(pageGridRow);
    });
  };

  this.getEmptyPlot = placedEntities => {
    const plot = this.getRandomEmpty();
    return (placedEntities.some(planted => planted.x === plot.x && planted.y === plot.y)) ? this.getEmptyPlot() : plot;
  };

  this.seedEntities = (entity, numberOfEntities) => {
    const availableSpaces = this.getEmptyLength();

    if (numberOfEntities > availableSpaces) {
      console.warn('Error: seedEntities: Not enough available space in grid: Entities Requested: %i, Spaces Available: %i', numberOfEntities, availableSpaces);
      return false;
    }

    const placedEntities = [];


    while (numberOfEntities--) {
      const plot = this.getEmptyPlot(placedEntities);
      plot.contains = Object.assign({}, entity);
      placedEntities.push(plot);
    }
    return true;
  };

  return this;
}


/* IT LIVES */

/*
** So, the idea here will be to have a Simulate function
** that will run through all entities in the grid and Simulate
** some very simple AI. We can then use a Step function to cycle
** through a Simulation "tick" with lots of logging information
** or we can run a "living" simulation that will run a "tick" every
** second or so.
*/

/* Utility sleep function to make `live` easier to display */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Simulation(grid, entities) {
  // Grid is a preset grid to simulate on
  // Entities is an array of entity objects that contain a name, and logic function
  this.grid = grid;
  this.entities = entities;
  this.ticks = 1;

  this.tick = () => {
    console.groupCollapsed('Simulation Tick: %i', this.ticks);
    const currentEntities = this.grid
      .getAllEntities(['wall'])
      // no-nested-ternary and no-confusing-arrow can bite me. It's a shorthanded property sort.
      .sort((a, b) => (a.contains.name < b.contains.name) ? -1 : (a.contains.name > b.contains.name) ? 1 : 0);
    currentEntities.forEach(entity => {
      if (entity.contains === null) return console.info('ENTITY MISSING');
      console.log('Entity: %s found: %o', entity.contains.name, entity);
      if (entity.contains.hasOwnProperty('logic')) {
        console.log('Logic Found');
        entity.contains.logic(this.grid, entity.contains, entity.x, entity.y);
      }
    });
    console.groupEnd('Simulation Tick: %i', this.ticks);
    this.grid.render();
    this.renderStats();
    this.ticks++;
  };

  this.live = async steps => {
    while (steps--) {
      this.tick();
      if (this.grid.getAllEntities(['wall', 'plant']).filter(e => e.contains.alive).length) await sleep(50);
      else {
        steps = 0;
        console.warn('Simulation has ended after %i ticks. All entities are dead.', --this.ticks);
      }
    }
  };

  this.renderStats = () => {
    const tickCounter = document.getElementsByClassName('js-ticks')[0];
    tickCounter.innerHTML = this.ticks;
  };

  this.grid.render();
  this.renderStats();

  return this;
}


const grid = new Grid(20, 20);

console.groupCollapsed('Grid Testing');
console.log(grid.area);
console.log(grid.isEmpty(0, 0));

grid.setBoundary(entities.wall);

console.log(grid.area);
console.log(grid.isEmpty(1, 1));
console.groupEnd('Grid Testing');


console.groupCollapsed('Entity Seeding');
grid.seedEntities(entities.plant, 50);
grid.seedEntities(entities.animal, 10);
console.log('Found Entities on Grid: %o', grid.getAllEntities(['wall']));
console.groupEnd('Entity Seeding');


const mySimulation = new Simulation(grid, entities);
// ~5 second simulation - Each tick is 50ms
mySimulation.live(100);
