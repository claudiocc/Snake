var game, snake, food;

game = {
  score: 0,
  fps: 50,
  over: false,
  message: null,
  zoom: 16,
  width: 640/16,
  height: 480/16,
  anim: 0,

  start: function () {
    game.over=false;
    game.score=0;
    game.message=null;
    snake.init();
    food.set();
  },

  stop: function () {
    game.over=true;
    game.message = 'GAME OVER - TAP TO BEGIN';
  },

  drawScore: function () {
    a.fillStyle='#3CA0D0';
    a.font=(c.height)+'px Impact, sans-serif';
    a.textAlign='center';
    a.fillText(game.score,c.width/2,c.height*.9);
  },

  drawMessage: function() {
    if (game.message !== null) {
      a.fillStyle = '#086FA1';
      a.strokeStyle = '#086FA1';
      a.font = 'bold '+(c.height / 10) + 'px Impact';
      a.textAlign = 'center';
      a.fillText(game.message, c.width/2, c.height/2);
      a.strokeText(game.message, c.width/2, c.height/2);
    }
  },

  drawBox: function (x,y,color) {
    a.fillStyle=color;
    a.fillRect(x*game.zoom,y*game.zoom,game.zoom,game.zoom);
  },

  drawBoxAnim: function (x,y,color) {
    a.fillStyle=color;
    var size=game.zoom/game.anim;
    var initx=(x*game.zoom)+(game.zoom/2)-(size/2);
    var inity=(y*game.zoom)+(game.zoom/2)-(size/2);
    a.fillRect(initx,inity,size,size);
  },

  resetCanvas: function () {
    a.fillStyle="#63ADD0";
    a.fillRect(0,0,c.width,c.height);
    game.width=c.width/game.zoom;
    game.height=c.height/game.zoom;
  }
};          

snake = {
  x: -1,
  y: -1,
  color: '#3CA0D0',
  direction: 'left',
  sections: [],

  init: function () {
    snake.sections=[];
    snake.direction='left';
    snake.x=game.width/2;
    snake.y=game.height/2;
    for (i=snake.x+5; i>=snake.x; i--)
      snake.sections.push(i+','+snake.y);

  },

  move: function () {
    switch (snake.direction) {
      case 'up':
        snake.y--;;
        break;
      case 'down':
        snake.y++;
        break;
      case 'left':
        snake.x--;
        break;
      case 'right':
        snake.x++;
        break
    }
    snake.checkCollision();
    snake.checkGrowth();
    snake.sections.push(snake.x+','+snake.y);
  },

  draw: function () {
    for (i=0; i<snake.sections.length-1; i++)
      snake.drawSection(snake.sections[i].split(','),'hsl(200,94%,'+(i*(60/snake.sections.length)+20)+'%)');
  },

  drawSection: function (section,color) {
      game.drawBox(parseInt(section[0]), parseInt(section[1]), color);
  },

  drawHead: function () {
      var section=snake.sections[snake.sections.length-1].split(',');
      game.drawBox(parseInt(section[0]), parseInt(section[1]), 'hsl(200,94%,'+(snake.sections.length*(60/snake.sections.length)+20)+'%)');
  },

  checkCollision: function () {
    if (snake.isCollision(snake.x, snake.y)===true)
      game.stop();
  },

  isCollision: function (x, y) {
    if (x < 0 || x>game.width-1 || y< 0 || y>game.height-1 || snake.sections.indexOf(x+','+y)>=0 )
      return true;
  },

  checkGrowth: function () {
    if (snake.x==food.x && snake.y==food.y) {
      game.score++;
      if (game.score % 5 == 0 && game.fps < 60) 
        game.fps++;
      food.set();
    } else {
      snake.sections.shift();
    }
  },

  ui1: function () { 
    var directions=['left','right','up','down'];
    var olddir=snake.direction;

    snake.direction=directions[Math.ceil(Math.random()*4)-1];
    if (olddir===inverseDirection[snake.direction])
      snake.direction=olddir;
  },

  ui2: function () {
    var directions=[];
    if (!snake.isCollision(snake.x-1,snake.y)) directions.push('left');
    if (!snake.isCollision(snake.x+1,snake.y)) directions.push('right');
    if (!snake.isCollision(snake.x,snake.y-1)) directions.push('up');
    if (!snake.isCollision(snake.x,snake.y+1)) directions.push('down');
    snake.direction=directions[Math.ceil(Math.random()*directions.length)-1];
  },

  calcDist: function (x1,y1,x2,y2) {
    var dx=x2-x1;
    var dy=y2-y1;
    return Math.sqrt(dx*dx + dy*dy);
  },

  ui3: function () {
    var directions=[];
    var distances=[];

    if (!snake.isCollision(snake.x-1,snake.y)) {
      directions.push('left');
      distances.push(snake.calcDist(snake.x-1,snake.y,food.x,food.y));
    }
    if (!snake.isCollision(snake.x+snake.size,snake.y)) {
      directions.push('right');
      distances.push(snake.calcDist(snake.x+1,snake.y,food.x,food.y));
    }
    if (!snake.isCollision(snake.x,snake.y-1)) {
      directions.push('up');
      distances.push(snake.calcDist(snake.x,snake.y-1,food.x,food.y));
    }
    if (!snake.isCollision(snake.x,snake.y+1)) {
      directions.push('down');
      distances.push(snake.calcDist(snake.x,snake.y+1,food.x,food.y));
    }
    var min=1000000000;
    for (var i=0;i<directions.length;i++) {
      if (distances[i]<min) {
        min=distances[i];
        snake.direction=directions[i];
      }
    }
  },

};

food = {
  x:null,
  y:null,
  color:'#0FF',

  set: function () {
    food.x=parseInt(Math.random()*game.width);
    food.y=parseInt(Math.random()*game.height);
  },

  draw: function () {
    game.drawBox(food.x,food.y,food.color);
  }
};

keys = {
  up: [38, 75, 87],
  down: [40, 74, 83],
  left: [37, 65, 72],
  right: [39, 68, 76],
  start_game: [13, 32]
};

inverseDirection = {
  'up':'down',
  'left':'right',
  'right':'left',
  'down':'up'
};

Object.prototype.getKey = function(value){
  for(var key in this){
    if(this[key] instanceof Array && this[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
};


// Keyboard
addEventListener("keydown", function (e) {
    lastKey = keys.getKey(e.keyCode);
    if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0
        && lastKey != inverseDirection[snake.direction]) {
      snake.direction = lastKey;
    } else if (['start_game'].indexOf(lastKey) >= 0 && game.over) {
      game.start();
    }
}, false);

//mouse or touch
addEventListener("mousedown", function (e) {
    var rect = c.getBoundingClientRect();
    var x=e.clientX - rect.left;
    var y=e.clientY - rect.top;

    if (game.over) game.start() 
    else {
      food.x=parseInt(x / game.zoom);
      food.y=parseInt(y / game.zoom);
      if (food.x>game.width-1) food.x=game.width-1;
      if (food.y>game.height-1) food.y=game.height-1;

    }
}, false);




var requestAnimationFrame =  window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;


// GAME LOOP
function loop() {
  if (game.over === false) {
      game.resetCanvas();
      game.drawScore();
      snake.ui3();
      snake.move();
      snake.draw();
      snake.drawHead();
      food.draw();
      game.drawMessage();
  }
  setTimeout(function() {
    requestAnimationFrame(loop);
  }, 1000 / game.fps);
};

requestAnimationFrame(loop);


/*
ui1: random 100%
ui2: random dir + collision dect 
ui3: euclidean distance
ui4: a star
*/
