// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

var UP = 0;
var RIGHT = 1;
var DOWN = 2;   
var LEFT = 3;

var getLine = function (grid, num) {
    return grid.cells.map(function (row) {
        return row[num] ? row[num].value : 0;
    });
};

var getCol = function (grid, num) {
    return grid.cells[num].map(function (cell) {
        return cell ? cell.value : 0;
    });
};

var print_grid = function (grid) {
    for (var i = 0; i < 4; i++) {
        console.log(getLine(grid, i));
    }
};

var simul = function () {
    return new GameManager(4, FakeInputManager, FakeHTMLActuator, FakeStorageManager);
};

var game2 = simul();

window.onload = function () {
    var btn = document.getElementById("cy-test").addEventListener('click', function (event) {

        var createRunner = function (state) {
            return function () {
                state.init && state.init();
                var inter = setInterval(function () {
                    var oldGridState = JSON.stringify(game.grid.cells);
                    if (!state.do()) {
                        clearInterval(inter);
                        return;
                    }
                    var gridState = JSON.stringify(game.grid.cells);
                    if (gridState === oldGridState) {
                        clearInterval(inter);
                        state.onSame && state.onSame();
                        return;
                    }
                    oldGridState = gridState;
                }, sleepTime);
                var onGameOver = function (event) {
                    clearInterval(inter);
                    document.body.removeEventListener('game.over', onGameOver);
                }
                document.body.addEventListener('game.over', onGameOver);
            }
        };

        var _over;
        Object.defineProperty(game, 'over', {
            get: function () {
                return _over;
            },
            set: function (value) {
                _over = value;
                document.body.dispatchEvent(new Event('game.over'));
            }
        });

        var sleepTime = 200;


        var s_left_up_loop = {
            mvt: LEFT,
            do: function () {
                game.inputManager.emit('move', this.mvt);
                if (this.mvt == LEFT) {
                    this.mvt = UP;
                } else if (this.mvt == UP) {
                    this.mvt = LEFT;
                }
                return true;
            },
            onSame: function () {
                gotoState('right_left');
            }
        };

        var s_right = {
            do: function () {
                game.inputManager.emit('move', RIGHT);
                if (getLine(game.grid, 0)[0] == 0) {
                    gotoState('left');
                } else {
                    gotoState('up_loop');
                }
                return false;
            }
        };

        var s_up_loop = {
            do: function () {
                game.inputManager.emit('move', UP);
            },
            onSame: function () {
                gotoState('left');
            }
        };

        var s_left = {
            do: function () {
                game.inputManager.emit('move', LEFT);
                gotoState('left_up_loop');
                return false;
            }
        }

        var s_right_left = {
            mvts: [RIGHT, UP, LEFT],
            cur: 0,
            init: function () {
                this.cur = 0;
            },
            do: function () {
                if (this.cur == this.mvts.length) {
                    gotoState('left_up_loop');
                    return false;
                } else {
                    if (this.mvts[this.cur] == UP) {
                        var line = getLine(game.grid, 0);
                        if (line[0] == 0) {
                            this.cur++;
                        }
                    }
                    game.inputManager.emit('move', this.mvts[this.cur]);
                    this.cur++;
                    return true;
                }
            },
            onSame: function () {
                gotoState('down_up');
            }
        };

        var s_down_up = {
            mvts: [DOWN, UP],
            cur: 0,
            init: function () {
                this.cur = 0;
            },
            do: function () {
                if (this.cur == this.mvts.length) {
                    return false;
                }
                game.inputManager.emit('move', this.mvts[this.cur]);
                gotoState('left_up_loop');
                return true;
            },
            onSame: function () {
                console.log('on est dans la merde');
            }
        };

        var states = {
            left_up_loop: createRunner(s_left_up_loop),
            right_left: createRunner(s_right_left),
            down_up: createRunner(s_down_up),
            right: createRunner(s_right),
            up_loop: createRunner(s_up_loop),
            left: createRunner(s_left)
        };

        var gotoState = function (stateName) {
            console.log('State: ', stateName);
            states[stateName]();
        };

        gotoState('left_up_loop');
    });
};
