(function( global ) {
  "use strict";

  function Cell( config ) {
    this.$el = config.$element;
    this.x = config.x;
    this.y = config.y;
  }

  function Grid( config ) {
    this.grid = [];
    this.cells = [];
    this.rowsCount = config.rows;
    this.colsCount = config.cols;
    this.rows = [];
    this.cols = [];
    if (config.render) {
      this.placeholder = config.render.placeholder;
      this.render();
    }
  }
  Grid.prototype = {
    createCell: function( config ) {
      return new Cell(config);
    },
    getCellAt: function( x, y ) {
      if (!this.grid[y]) {
        console.warn("No such Y coordinate: %i (grid size is: x[%i], y[%i])", y, this.colsCount, this.rowsCount);
        return false;
      }
      if (!this.grid[y][x]) {
        console.warn("No such X coordinate: %i (grid size is: x[%i], y[%i])", x, this.colsCount, this.rowsCount);
        return false;
      }
      return this.grid[y][x];
    },
    render: function( options ) {
      if (options && options.placeholder) {
        this.placeholder = options.placeholder;
      }
      this.$placeholder = $(this.placeholder);
      if (!this.placeholder || this.$placeholder.length === 0) {
        console.error('Placeholder is not present');
        return;
      }
      var i, j, $row, $cell, cell, cellId = 0;
      for (i = 0; i < this.rowsCount; i += 1) {
        this.grid[i] = [];
        $row = $('<div class="row"></div>').prependTo(this.$placeholder);
        for (j = 0; j < this.colsCount; j += 1) {
          $cell = $('<div class="cell"></div>').appendTo($row);
          cell = this.createCell({$element: $cell, x: j, y: i});
          this.grid[i].push(cell);
          this.cells.push(cell);
        }
      }
      // rows
      var self = this;
      this.grid.forEach(function( row ) {
        self.rows.push(row);
      });
    }
  };

  global.Grid = Grid;

}( window ));

var food = null

(function() {
    "use strict";

    var grid = new Grid({
      rows: 40,
      cols: 40,
      render: {
          placeholder: ".grid"
      }
    });

    var snake = {
      body: [[20, 20], [19, 20], [18, 20]],
      direction: 'r'
    };
    snake.head = snake.body[0];

    for (var i = 0; i < snake.body.length; i += 1) {
      grid.getCellAt(snake.body[i][0], snake.body[i][1]).$el.css('background', 'red');
    }

    function Food(location) {
      this.location = location;
    }
    function generate_location(snake) {
      var food_location = [Math.floor(Math.random()*40), Math.floor(Math.random()*40)];
        while (contains(snake.body, food_location)) {
          food_location = [Math.floor(Math.random()*40), Math.floor(Math.random()*40)];
      }
      return food_location
    }

    function contains(haystack, needle){
      var i, j, current;
      for(i = 0; i < haystack.length; ++i){
        if(needle.length === haystack[i].length){
          current = haystack[i];
          for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
          if(j === needle.length)
            return true;
        }
      }
      return false;
    }

    Array.prototype.compare = function(testArr) {
      if (this.length != testArr.length) return false;
      for (var i = 0; i < testArr.length; i++) {
          if (this[i].compare) { //To test values in nested arrays
              if (!this[i].compare(testArr[i])) return false;
          }
          else if (this[i] !== testArr[i]) return false;
      }
      return true;
    }

    const draw = function draw(x, y) {
      grid.getCellAt(x, y).$el.css('background', 'red');
    };

    const remove = function remove(x, y) {
      grid.getCellAt(x, y).$el.css('background', 'white');
    };

    const eaten = function eaten(snake, food) {
      if (food != null) {
        if (snake.body[0].compare(food.location)) {
          snake.body.push(food.location)
          draw(food.location[0], food.location[1])
          var food_location = generate_location(snake)
          food.location = food_location
          grid.getCellAt(food.location[0], food.location[1]).$el.css('background', 'green');
        }
      }
    }

    const reset = function reset() {
      for (var i=0; i < 40; i++) {
        for (var j=0; j < 40; j++) {
          remove(i, j);
        }
      }
    }

    const valid = function valid(x, y, grid) {
      if (grid.getCellAt(x, y) == false) {
        reset();
        var food_location = generate_location(snake)
        food = new Food(food_location)
        grid.getCellAt(food.location[0], food.location[1]).$el.css('background', 'green');
        alert("Your score is " + snake.body.length)
        return false;
      }
      if (contains(snake.body.slice(1), [x, y]) == true) {
        reset();
        var food_location = generate_location(snake)
        food = new Food(food_location)
        grid.getCellAt(food.location[0], food.location[1]).$el.css('background', 'green');
        alert("Your score is " + snake.body.length)
        return false;
      }
      return true
    }

    const move = function move(snake) {
      switch(snake.direction) {
      case 'l':
        if (valid(snake.body[0][0], snake.body[0][1], grid) == false) {
          snake.body = [[20, 20], [19, 20], [18, 20]];
          snake.direction = 'r';
        } else {
          remove(snake.body[(snake.body.length) - 1][0], snake.body[(snake.body.length) - 1][1]);
          eaten(snake, food);
          snake.body.pop();
          snake.body.unshift([snake.body[0][0] - 1, snake.body[0][1]]);
          draw(snake.body[0][0], snake.body[0][1]);
        }
        break;
      case 'u':
        if (valid(snake.body[0][0], snake.body[0][1], grid) == false) {
          snake.body = [[20, 20], [19, 20], [18, 20]];
          snake.direction = 'r';
        } else {
          remove(snake.body[(snake.body.length) - 1][0], snake.body[(snake.body.length) - 1][1]);
          eaten(snake, food);
          snake.body.pop();
          snake.body.unshift([snake.body[0][0], snake.body[0][1] + 1]);
          draw(snake.body[0][0], snake.body[0][1]);
        }
        break;
      case 'r':
        if (valid(snake.body[0][0], snake.body[0][1], grid) == false) {
          snake.body = [[20, 20], [19, 20], [18, 20]];
          snake.direction = 'r';
        } else {
          remove(snake.body[(snake.body.length) - 1][0], snake.body[(snake.body.length) - 1][1]);
          eaten(snake, food);
          snake.body.pop();
          snake.body.unshift([snake.body[0][0] + 1, snake.body[0][1]]);
          draw(snake.body[0][0], snake.body[0][1]);
        }
        break;
      case 'd':
        if (valid(snake.body[0][0], snake.body[0][1], grid) == false) {
          snake.body = [[20, 20], [19, 20], [18, 20]];
          snake.direction = 'r';
        } else {
          remove(snake.body[(snake.body.length) - 1][0], snake.body[(snake.body.length) - 1][1]);
          eaten(snake, food);
          snake.body.pop();
          snake.body.unshift([snake.body[0][0], snake.body[0][1] - 1]);
          draw(snake.body[0][0], snake.body[0][1]);
        }
      }
    }

    $(function() {
      $(window).keydown(function(e) {
        var key = e.which;
        switch(key) {
          case 37:
            if (snake.direction != 'r') {
              snake.direction = 'l';
            }
            break;
          case 38:
            if (snake.direction != 'd') {
              snake.direction = 'u';
            }
            break;
          case 39:
            if (snake.direction != 'l') {
              snake.direction = 'r';
            }
            break;
          case 40:
            if (snake.direction != 'u') {
              snake.direction = 'd';
            }
            break;
        }
      })
    })

    $(function() {
      setInterval(function() {
        move(snake)
        if (food == null) {
          var food_location = generate_location(snake)
          food = new Food(food_location)
          grid.getCellAt(food.location[0], food.location[1]).$el.css('background', 'green');
          }
      }, 130 - (snake.body.length * 10));
    })
}());
