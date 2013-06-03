import device;


exports = Class(GC.Application, function () {

	var snake,food,score,fps,over,message,zoom,width,height,anim;


	this.initUI = function () {
		var Canvas = new device.get("Canvas");
		this.buffer = new Canvas({width: device.width, height: device.height});
		this.ctx = this.buffer.getContext("2d");

		this.snake = new Snake();
		this.food = new Food();

		this.score = 0;
		this.fps = 50;
		this.over = false;
		this.message = null;
		this.zoom = 8;
		this.width = device.width;
		this.height = device.height;
	    this.cellwidth=this.width/this.zoom;
	    this.cellheight=this.height/this.zoom;
		this.anim = 0;

		this.view.on('InputStart', bind(this, function (evt, pt) {
			if (this.over) 
				this.start();
			else {
      			this.food.x=parseInt(pt.x / this.zoom);
      			this.food.y=parseInt(pt.y / this.zoom);
      			if (this.food.x>this.cellwidth-1) this.food.x=this.cellwidth-1;
      			if (this.food.y>this.cellheight-1) this.food.y=this.cellheight-1;
		    }
		}));

	};

	this.start = function () {
	    this.over=false; // cambiar a this.stopLoop()?
	    this.score=0;
	    this.message='';
	    this.snake.init();
	    this.food.set();
	};

  	this.stop = function () {
    	this.over=true; // cambiar a this.startLoop()?
    	this.message = 'GAME OVER - TAP TO BEGIN';
  	};	

	this.drawScore = function (ctx) {
	    ctx.fillStyle='#3CA0D0';
	    ctx.font=(this.height)+'px Impact, sans-serif';
	    ctx.textAlign='center';
	    ctx.fillText(this.score,this.width/2,this.height*0.9);
	};

	this.drawMessage = function(ctx) {
	    if (this.message !== '') {
	      	ctx.fillStyle = '#086FA1';
	      	//ctx.strokeStyle = '#086FA1';
	      	ctx.font = (this.height / 10) + 'px Impact';
	      	ctx.textAlign = 'center';
	      	ctx.fillText(this.message, this.width/2, this.height/2);
	      	//ctx.strokeText(this.message, this.width/2, this.height/2);
	    }
	};

	this.drawBox = function (ctx,x,y,color) {
	    ctx.fillStyle=color;
	    ctx.fillRect(x*this.zoom,y*this.zoom,this.zoom,this.zoom);
	};

	this.drawBoxAnim = function (ctx,x,y,color) {
	    ctx.fillStyle=color;
	    var size=this.zoom/this.anim;
	    var initx=(x*this.zoom)+(this.zoom/2)-(size/2);
	    var inity=(y*this.zoom)+(this.zoom/2)-(size/2);
	    ctx.fillRect(initx,inity,size,size);
	};

	this.resetCanvas = function (ctx) {
	    ctx.fillStyle="#63ADD0";
	    ctx.fillRect(0,0,this.width,this.height);
	};

	this.tick = function (dt) {
		if (this.over === false) {
    		this.resetCanvas(this.ctx);
      		this.drawScore(this.ctx);
      		this.snake.ui4();
      		this.snake.move();
      		this.snake.draw();
      		this.snake.drawHead();
      		this.food.draw();
      		this.drawMessage(this.ctx);
  		}	
	};

	this.render = function (ctx) {
		ctx.drawImage(this.buffer, 0, 0);
	}

	this.launchUI = function () {
	};
});




var Snake = Class (function () {
	var x,y,color,direction;
	var sections = [];
	var inverseDirection = {
	  	'up':'down',
  		'left':'right',
  		'right':'left',
  		'down':'up'
	};

  	this.init = function () {
	    this.sections=[];
	    this.direction='left';
	    this.x=parseInt(GC.app.cellwidth/2);
	    this.y=parseInt(GC.app.cellheight/2);
	    for (i=this.x+5; i>=this.x; i--)
	      this.sections.push(i+','+this.y);
	};

  	this.move = function () {
	    switch (this.direction) {
	      case 'up' :
	        this.y--;
	        break;
	      case 'down' :
	        this.y++;
	        break;
	      case 'left' :
	        this.x--;
	        break;
	      case 'right' :
	        this.x++;
	        break;
	    }
	    this.checkCollision();
    	this.checkGrowth();
    	this.sections.push(this.x+','+this.y);
  	};

	this.draw = function () {
		//#9CDCFC
		//#034363
		var step=153/this.sections.length;
		var r,g,b;

	    for (i=0; i<this.sections.length-1; i++) {
	    	r=parseInt(156-step*i);
	    	g=parseInt(220-step*i);
	    	b=parseInt(252-step*i);

	      	//this.drawSection(this.sections[i].split(','),'hsl(200,94%,'+(i*(60/this.sections.length)+20)+'%)');
	      	this.drawSection(this.sections[i].split(','),'rgb('+r+','+g+','+b+')');
	    }
	};

  	this.drawSection = function (section,color) {
    	GC.app.drawBox(GC.app.ctx,parseInt(section[0]), parseInt(section[1]), color);
  	};

  	this.drawHead = function () {
      	var section=this.sections[this.sections.length-1].split(',');
      	GC.app.drawBox(GC.app.ctx,parseInt(section[0]), parseInt(section[1]), "#034363");
  	};

  	this.checkCollision = function () {
    	if (this.isCollision(this.x, this.y)===true)
      		GC.app.stop();
  	};

  	this.isCollision = function (x, y) {
    	if (x < 0 || x>GC.app.cellwidth-1 || y< 0 || y>GC.app.cellheight-1 || this.sections.indexOf(x+','+y)>=0 )
      		return true;
  	};

  	this.checkGrowth = function () {
    	if (this.x==GC.app.food.x && this.y==GC.app.food.y) {
      		GC.app.score++;
      	if (GC.app.score % 5 === 0 && GC.app.fps < 60) 
        	GC.app.fps++;
      	GC.app.food.set();
    	} else {
      		this.sections.shift();
    	}
  	};

  	this.ui1 = function () { 
    	var directions=['left','right','up','down'];
    	var olddir=this.direction;

    	this.direction=directions[Math.ceil(Math.random()*4)-1];
    	if (olddir===inverseDirection[this.direction])
      		this.direction=olddir;
  	};

  	this.ui2 = function () {
    	var directions=[];
    	if (!this.isCollision(this.x-1,this.y)) directions.push('left');
    	if (!this.isCollision(this.x+1,this.y)) directions.push('right');
    	if (!this.isCollision(this.x,this.y-1)) directions.push('up');
    	if (!this.isCollision(this.x,this.y+1)) directions.push('down');
    	this.direction=directions[Math.ceil(Math.random()*directions.length)-1];
  	};

  	this.calcDist = function (x1,y1,x2,y2) {
    	var dx=x2-x1;
    	var dy=y2-y1;
    	return Math.sqrt(dx*dx + dy*dy);
  	};

  	this.ui3 = function () {
    	var directions=[];
    	var distances=[];

    	if (!this.isCollision(this.x-1,this.y)) {
      		directions.push('left');
      		distances.push(this.calcDist(this.x-1,this.y,GC.app.food.x,GC.app.food.y));
    	}
	    if (!this.isCollision(this.x+1,this.y)) {
	      	directions.push('right');
	      	distances.push(this.calcDist(this.x+1,this.y,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y-1)) {
	      	directions.push('up');
	      	distances.push(this.calcDist(this.x,this.y-1,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y+1)) {
	      	directions.push('down');
	      	distances.push(this.calcDist(this.x,this.y+1,GC.app.food.x,GC.app.food.y));
	    }
	    var min=1000000000;
	    for (var i=0;i<directions.length;i++) {
	      	if (distances[i]<min) {
	        	min=distances[i];
	        	this.direction=directions[i];
	      	}
	    }
	};

  	this.isSnake = function (x, y) {
    	return ( this.sections.indexOf(x+','+y)>=0 )
  	};

  	this.isDeadend = function (x, y) {
  		var vertical = (this.isSnake(x-1,y) && this.isSnake(x+1,y));
	    var horizontal = (this.isSnake(x,y-1) && this.isSnake(x,y+1));
  		switch (this.direction) {
	      case 'up' :
	        return vertical;
	        break;
	      case 'down' :
	        return vertical;
	        break;
	      case 'left' :
	        return horizontal;
	        break;
	      case 'right' :
	        return horizontal;
	        break;
	    }
  	};

  	this.ui4 = function () {
    	var directions=[];
    	var distances=[];

    	if (!this.isCollision(this.x-1,this.y)&&!this.isDeadend(this.x-1,this.y)) {
      		directions.push('left');
      		distances.push(this.calcDist(this.x-1,this.y,GC.app.food.x,GC.app.food.y));
    	}
	    if (!this.isCollision(this.x+1,this.y)&&!this.isDeadend(this.x+1,this.y)) {
	      	directions.push('right');
	      	distances.push(this.calcDist(this.x+1,this.y,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y-1)&&!this.isDeadend(this.x,this.y-1)) {
	      	directions.push('up');
	      	distances.push(this.calcDist(this.x,this.y-1,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y+1)&&!this.isDeadend(this.x,this.y+1)) {
	      	directions.push('down');
	      	distances.push(this.calcDist(this.x,this.y+1,GC.app.food.x,GC.app.food.y));
	    }
	    var min=1000000000;
	    for (var i=0;i<directions.length;i++) {
	      	if (distances[i]<min) {
	        	min=distances[i];
	        	this.direction=directions[i];
	      	}
	    }
	};



});

var Food = Class(function() {
  this.x = null;
  this.y = null;
  this.color = "#0FF";

  this.set = function () {
    this.x=parseInt(Math.random()*GC.app.cellwidth);
    this.y=parseInt(Math.random()*GC.app.cellheight);
  },

  this.draw = function () {
    GC.app.drawBox(GC.app.ctx,this.x,this.y,this.color);
  }
});



/*
ui1: random 100%
ui2: random dir + collision dect 
ui3: euclidean distance + collision dect
ui4: euclidean distance + collision dect + deadend detection
*/
