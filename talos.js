/* Turn off annoying eslint rules that don't apply here */

/* eslint no-prototype-builtins: 0 */ // <== This one I don't actually get at all...
/* eslint no-console: 0 */ // <== Buggy personal project, it's gonna have console logs.
/* eslint no-plusplus: 0 */ // <== Frankly this one is just dumb anyways. I get the logic, but I disagree.

/* eslint no-confusing-arrow: 0 */ // <== These two are turned off for a sort function I did.
/* eslint no-nested-ternary: 0 */ //      I really don't like those red squigglies.

/* global document */ // <== For some reason `document` isn't recognized as a global



/* Utility Functions */

/**
 * Sleep function that effectively pauses the code for ms milliseconds.
 * @param {number} ms Number of milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Function to choose a number psuedorandomly between minimum and maximum.
 * @param {number} max Maximum - inclusive
 * @param {number} min Minimum - inclusive
 */
function randomBetween(max = 1, min = 0) {
  return Math.floor(Math.random() * max) + min;
}


/* Brains and junk */

class Entity {
  constructor(name) {
    this.name = name;
  }
}

class Terrain extends Entity {}

class LivingEntity extends Entity {
  constructor() {
    super();
    this.age = 0;
    this.alive = true;
    this.logic = () => {};
  }
}

class Plant extends LivingEntity {
  constructor() {
    super();
    this.name = 'Plant';
    this.logic = (grid, x, y) => {
      this.age++;
      if (!this.alive) {
        // Decay after 3-15 ticks
        if (this.age >= randomBetween(12, 3)) grid.area[y][x].contains = null;
        return;
      }
      // Every 5 ticks, grow
      if (this.age % 5 === 0) {
        const availableCells = grid.getAdjacentEmpty(x, y);
        if (availableCells.length) availableCells[randomBetween(availableCells.length)].contains = new Plant();
      }
      // Die after 5-15 ticks
      if (this.age >= randomBetween(10, 5)) {
        this.alive = false;
        this.age = 0;
      }
    };
  }
}

class Animal extends LivingEntity {
  constructor(life) {
    super();
    this.name = 'Animal';
    this.food = 'Plant';
    this.life = life;
  }
}

class Herbivore extends Animal {
  constructor(life) {
    super();
    this.life = life;
    this.name = 'Herbivore';
    this.logic = (grid, x, y) => {
      if (!this.alive) return;
      console.groupCollapsed('Animal Thoughts');
      // Look for food
      const foodSources = grid.getAdjacent(x, y).filter(cell => cell.hasOwnProperty('contains') && cell.contains !== null && cell.contains.name === this.food);
      if (foodSources.length) {
        console.info('YAY FOOD: %i', this.life);
        const consume = foodSources[randomBetween(foodSources.length)];
        this.life += consume.contains.alive ? 2 : 1;
        grid.setCellContent(consume.x, consume.y, null);
      }
      if (this.life) {
        // Think about moving
        // filter out other animals, walls, and plants
        const adjacent = grid.getAdjacent(x, y).filter(cell => !cell.hasOwnProperty('contains') || cell.contains === null);
        if (adjacent.length) {
          console.info('I CAN MOVE TO: %o', adjacent);
          const destination = adjacent[randomBetween(adjacent.length)];
          console.info('GONNA MOVE TO: %o', destination);
          grid.setCellContent(destination.x, destination.y, this);
          grid.setCellContent(x, y, null);
          this.life--;
        }
        this.age++;
      } else {
        console.info('I HAVE DIED');
        this.alive = false;
      }
      console.groupEnd('Animal Thoughts');
    };
  }
}

// Look up table is required for programmatically new'ing the classes
const entities = { Terrain, Herbivore, Plant };


class Grid {
  constructor(rows, columns) {
    this.area = new Array(rows)
      .fill(null, 0, rows)
      .map(() => new Array(columns)
        .fill(null, 0, columns)
        .map(() => ({})));
    this.pageGrid = document.getElementsByClassName('js-grid')[0];
  }

  getCellContent(x, y) {
    return this.area[y][x].hasOwnProperty('contains') ? this.area[y][x].contains : undefined;
  }

  setCellContent(x, y, content) {
    this.area[y][x].contains = content;
  }

  isEmpty(x, y) {
    // Returns true if a given space is empty or false if not
    const target = this.area[y][x];
    return !(target.hasOwnProperty('contains') && target.contains);
  }

  getEmptyLength() {
    // Returns the number of empty cells left in the grid__cell
    return this.area.reduce((emptyCellCount, row) =>
      (emptyCellCount += row.reduce((emptyCells, cell) => {
        return (!cell.hasOwnProperty('contains') || cell.contains === null) ? ++emptyCells : emptyCells;
      }, 0)
    ), 0);
  }

  getAdjacent(x, y) {
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
  }

  getAdjacentEmpty(x, y) {
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
  }

  getAllEmpty() {
    const availableSpaces = [];
    this.area.forEach(row => {
      row.forEach(cell => {
        if (!cell.hasOwnProperty('contains') || cell.contains === null) {
          availableSpaces.push(cell);
        }
      });
    });
    return availableSpaces;
  }

  getAllEntities(excludes) {
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
  }

  getRandomEmpty() {
    // Returns a cell if a space is available
    // Returns false if not
    const availableSpaces = this.getAllEmpty();

    if (availableSpaces.length === 0) return false;

    const result = availableSpaces[randomBetween(availableSpaces.length)];

    return result;
  }

  setBoundary() {
    this.area = this.area.map((row, rowIndex) => row.map((cell, cellIndex) => {
      cell.x = cellIndex;
      cell.y = rowIndex;
      if (
        rowIndex === 0 ||
        rowIndex === this.area.length - 1 ||
        cellIndex === 0 ||
        cellIndex === row.length - 1
      ) {
        cell.contains = new Terrain('Wall');
      }
      return cell;
    }));
  }

  render() {
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
  }

  getEmptyPlot(placedEntities) {
    const plot = this.getRandomEmpty();
    return (placedEntities.some(planted => planted.x === plot.x && planted.y === plot.y)) ? this.getEmptyPlot() : plot;
  }

  seedEntities(entity, numberOfEntities, ...args) {
    const availableSpaces = this.getEmptyLength();

    if (numberOfEntities > availableSpaces) {
      console.warn('Error: seedEntities: Not enough available space in grid: Entities Requested: %i, Spaces Available: %i', numberOfEntities, availableSpaces);
      return false;
    }

    const placedEntities = [];


    while (numberOfEntities--) {
      const plot = this.getEmptyPlot(placedEntities);
      const MyEntity = entities[entity];
      plot.contains = new MyEntity(...args);
      placedEntities.push(plot);
    }
    return true;
  }

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

class Simulation {
  constructor(grid) {
    this.grid = grid;
    this.ticks = 1;
    this.tick = () => {
      console.groupCollapsed('Simulation Tick: %i', this.ticks);
      const currentEntities = this.grid
        .getAllEntities(['Wall'])
        // no-nested-ternary and no-confusing-arrow can bite me. It's a shorthanded property sort.
        .sort((a, b) => (a.contains.name < b.contains.name) ? -1 : (a.contains.name > b.contains.name) ? 1 : 0);
      currentEntities.forEach(entity => {
        if (entity.contains === null) return console.info('ENTITY MISSING');
        console.log('Entity: %s found: %o', entity.contains.name, entity);
        if (entity.contains.hasOwnProperty('logic')) {
          console.log('Logic Found');
          entity.contains.logic(this.grid, entity.x, entity.y);
        }
      });
      console.groupEnd('Simulation Tick: %i', this.ticks);
      this.grid.render();
      this.renderStats();
      this.ticks++;
    };

    this.live = async (steps, ms) => {
      while (steps--) {
        this.tick();
        if (this.grid.getAllEntities(['Wall', 'Plant']).filter(e => e.contains.alive).length) await sleep(ms);
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
  }
}


/* Put everything to use */

const grid = new Grid(40, 40);

console.groupCollapsed('Grid Testing');
console.log(grid.area);
console.log(grid.isEmpty(0, 0));

grid.setBoundary();

console.log(grid.area);
console.log(grid.isEmpty(1, 1));
console.groupEnd('Grid Testing');


console.groupCollapsed('Entity Seeding');
grid.seedEntities('Herbivore', 20, 10);
grid.seedEntities('Plant', 100);
console.log('Found Entities on Grid: %o', grid.getAllEntities(['Wall']));
console.groupEnd('Entity Seeding');


const mySimulation = new Simulation(grid);
// ~5 second simulation - Each tick is 50ms
mySimulation.live(100, 50);
