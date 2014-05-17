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
        switchStrategy(LeftUpLoopStrategy);
        runner();
    });
};

var currentStrategy = null;
var strategyStack = [];
var sleepTime = 100;
var runner = function () {
    var inter = setInterval(function () {
        var oldGridState = JSON.stringify(game.grid.cells);
        currentStrategy.do();
        var gridState = JSON.stringify(game.grid.cells);
        if (oldGridState == gridState) {
            currentStrategy.onSame();
        }
    }, sleepTime);
    var onGameOver = function (event) {
        clearInterval(inter);
        document.body.removeEventListener('game.over', onGameOver);
    }
    document.body.addEventListener('game.over', onGameOver);
};


var switchStrategy = function (strategy) {
    currentStrategy = new strategy();
    console.log('Switching to ' + currentStrategy.name);
};

var callStrategy = function (strategy, callId) {
    var strat = new strategy();
    console.log('Calling ' + strat.name);
    strategyStack.push({
        strategy: currentStrategy,
        callId: callId
    });
    currentStrategy = strat;
};

var returnStrategy = function () {
    if (!strategyStack.length) {
        throw new Error('No more strategy to pop');
    }
    var retStrategy = strategyStack[strategyStack.length - 1].strategy;
    var callId = strategyStack[strategyStack.length - 1].callId;
    currentStrategy = retStrategy;
    strategyStack.pop();
    console.log('Return ' + currentStrategy.name);
    currentStrategy.onReturn(callId);
};

var Strategy = function () {

};

Strategy.prototype.name = 'NO NAME STRATEGY';

Strategy.prototype.onSame = function () {
    throw new Error('Not implemented');
};

Strategy.prototype.do = function () {
    throw new Error('Not implemented');
};

Strategy.prototype.onReturn = function () {

};


var LeftUpLoopStrategy = function () {
    Strategy.call(this);
    this.mvt = LEFT;
};
LeftUpLoopStrategy.prototype = Object.create(Strategy.prototype);

LeftUpLoopStrategy.prototype.name = 'LeftUpLoopStrategy';

LeftUpLoopStrategy.prototype.do = function () {
    game.inputManager.emit('move', this.mvt);
    if (this.mvt == LEFT) {
        this.mvt = UP;
    } else if (this.mvt == UP) {
        this.mvt = LEFT;
    }
};

LeftUpLoopStrategy.prototype.onSame = function () {
    this.lastGridState = JSON.stringify(game.grid.cells);
    callStrategy(RightStrategy, 1);
};

LeftUpLoopStrategy.prototype.onReturn = function (callId) {
    switch (callId) {
        case 1:
            var gridState = JSON.stringify(game.grid.cells);
            if (this.lastGridState == gridState) {
                callStrategy(DownUpStrategy, 2);
            }
            break;
        case 2:

            break;
    }
};


var RightStrategy = function () {
    Strategy.call(this);
};
RightStrategy.prototype = Object.create(Strategy.prototype);

RightStrategy.prototype.name = 'RightStrategy';

RightStrategy.prototype.do = function () {
    game.inputManager.emit('move', RIGHT);
    returnStrategy();
};

RightStrategy.prototype.onSame = function () {

};



var UpLoopStrategy = function () {
    Strategy.call(this);
};
UpLoopStrategy.prototype = Object.create(Strategy.prototype);

UpLoopStrategy.prototype.name = 'UpLoopStrategy';

UpLoopStrategy.prototype.do = function () {
    game.inputManager.emit('move', UP);
};

UpLoopStrategy.prototype.onSame = function () {
    switchStrategy(LeftStrategy);
};



var LeftStrategy = function () {
    Strategy.call(this);
};
LeftStrategy.prototype = Object.create(Strategy.prototype);

LeftStrategy.prototype.name = 'LeftStrategy';

LeftStrategy.prototype.do = function () {
    game.inputManager.emit('move', LEFT);
    returnStrategy();
};

LeftStrategy.prototype.onSame = function () {
    
};



var DownUpStrategy = function () {
    Strategy.call(this);
    this.mvts = [DOWN, UP];
    this.cur = 0;
};
DownUpStrategy.prototype = Object.create(Strategy.prototype);

DownUpStrategy.prototype.name = 'DownUpStrategy';

DownUpStrategy.prototype.do = function () {
    if (this.cur == this.mvts.length) {
        returnStrategy();
        return;
    }
    game.inputManager.emit('move', this.mvts[this.cur]);
    this.cur++;
};

DownUpStrategy.prototype.onSame = function () {
    
};