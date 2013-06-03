import device;


exports = Class(GC.Application, function () {

	var snake,food,score,fps,over,message,width,height,anim;


	this.initUI = function () {
		var Canvas = new device.get("Canvas");
		this.buffer = new Canvas({width: device.width, height: device.height});
		this.ctx = this.buffer.getContext("2d");

		this.score = 0;
		this.over = false;
		this.message = '';
		this.zoom = 8;

		this.width = device.width;
		this.height = device.height;
	    this.cellwidth=60; //this.width/this.zoom;
	    this.cellheight=40; //this.height/this.zoom;
	    this.zoomx = this.width/this.cellwidth;
	    this.zoomy = this.height/this.cellheight;
		this.anim = 0;

		this.snake = new Snake();
		this.food = new Food();

		this.view.on('InputStart', bind(this, function (evt, pt) {
			if (this.over) 
				this.start();
			else {
      			this.food.x=parseInt(pt.x / this.zoomx);
      			this.food.y=parseInt(pt.y / this.zoomy);
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
    	this.message = 'Game Over - Tap to Begin';
  	};	

	this.drawScore = function (ctx) {
	    ctx.fillStyle='#3CA0D0';
	    ctx.font=(this.height)+'px isonorm';
	    ctx.textAlign='center';
	    ctx.fillText(this.score,this.width/2,this.height*0.9);
	};

	this.drawMessage = function(ctx) {
	    if (this.message !== '') {
	      	ctx.fillStyle = '#086FA1';
	      	//ctx.strokeStyle = '#086FA1';
	      	ctx.font = (this.height / 10) + 'px isonorm';
	      	ctx.textAlign = 'center';
	      	ctx.fillText(this.message, this.width/2, this.height*0.15);
	      	//ctx.strokeText(this.message, this.width/2, this.height/2);
	    }
	};

	this.drawBox = function (ctx,x,y,color) {
	    ctx.fillStyle=color;
	    ctx.fillRect(x*this.zoomx,y*this.zoomy,this.zoomx,this.zoomy);
	};

	this.drawBoxAnim = function (ctx,x,y,color) {
	    ctx.fillStyle=color;
	    var sizex=this.zoomx/this.anim;
	    var sizey=this.zoomy/this.anim;
	    var initx=(x*this.zoomx)+(this.zoomx/2)-(sizex/2);
	    var inity=(y*this.zoomy)+(this.zoomy/2)-(sizey/2);
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
      		this.snake.move();
      		this.snake.draw();
      		this.snake.drawHead();
      		this.food.draw();
      		this.snake.ui5();
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

  	this.distEuclidean = function (x1,y1,x2,y2) {
    	var dx=x2-x1;
    	var dy=y2-y1;
    	return Math.sqrt(dx*dx + dy*dy);
  	};

  	this.distManhattan = function (x1,y1,x2,y2) {
    	var dx=Math.abs(x2-x1);
    	var dy=Math.abs(y2-y1);
    	return dx+dy;
  	};

  	this.ui3 = function () {
    	var directions=[];
    	var distances=[];

    	if (!this.isCollision(this.x-1,this.y)) {
      		directions.push('left');
      		distances.push(this.distManhattan(this.x-1,this.y,GC.app.food.x,GC.app.food.y));
    	}
	    if (!this.isCollision(this.x+1,this.y)) {
	      	directions.push('right');
	      	distances.push(this.distManhattan(this.x+1,this.y,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y-1)) {
	      	directions.push('up');
	      	distances.push(this.distManhattan(this.x,this.y-1,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y+1)) {
	      	directions.push('down');
	      	distances.push(this.distManhattan(this.x,this.y+1,GC.app.food.x,GC.app.food.y));
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
  		var i = this.sections.indexOf(x+','+y);
    	return ( (i>=0) && (i<this.sections.length-1) );
  	};

  	this.isDeadend = function (x, y) {
  		var vertical =   ( this.isSnake(x-1,y) && this.isSnake(x+1,y) );
	    var horizontal = ( this.isSnake(x,y-1) && this.isSnake(x,y+1) );

		if (horizontal || vertical)
		  		GC.app.drawBox(GC.app.ctx,x,y, 'red');

		return (horizontal || vertical);
  	};

  	this.ui4 = function () {
    	var directions=[];
    	var distances=[];

    	if (!this.isCollision(this.x-1,this.y)&&!this.isDeadend(this.x-1,this.y)) {
      		directions.push('left');
      		distances.push(this.distManhattan(this.x-1,this.y,GC.app.food.x,GC.app.food.y));
    	}
	    if (!this.isCollision(this.x+1,this.y)&&!this.isDeadend(this.x+1,this.y)) {
	      	directions.push('right');
	      	distances.push(this.distManhattan(this.x+1,this.y,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y-1)&&!this.isDeadend(this.x,this.y-1)) {
	      	directions.push('up');
	      	distances.push(this.distManhattan(this.x,this.y-1,GC.app.food.x,GC.app.food.y));
	    }
	    if (!this.isCollision(this.x,this.y+1)&&!this.isDeadend(this.x,this.y+1)) {
	      	directions.push('down');
	      	distances.push(this.distManhattan(this.x,this.y+1,GC.app.food.x,GC.app.food.y));
	    }
	    var min=1000000000;
	    for (var i=0;i<directions.length;i++) {
	      	if (distances[i]<min) {
	        	min=distances[i];
	        	this.direction=directions[i];
	      	}
	    }
	};

	this.floodFill = function (x,y,fill) {
		if (!this.isCollision(x,y) && fill.indexOf(x+','+y)<0) {
			fill.push(x+','+y);
			      		//GC.app.drawBox(GC.app.ctx,x,y, 'green');

			if (fill.length<this.sections.length*1.2) 
				this.floodFill(x+1,y,fill);
			if (fill.length<this.sections.length*1.2) 
				this.floodFill(x-1,y,fill);
			if (fill.length<this.sections.length*1.2) 
				this.floodFill(x,y+1,fill);
			if (fill.length<this.sections.length*1.2) 
				this.floodFill(x,y-1,fill);
			
		}
	}

	this.calcArea = function (x,y) {
		var fill = [];
		this.floodFill(x,y,fill);
		return fill.length;
	};

	this.checkDirection = function (x,y,distances,directions,direction) {
    	
    	if ( !this.isCollision(x,y) ) { //&& !this.isDeadend(x,y) ) {
    		
    		if ( this.calcArea(x,y) > (this.sections.length*1.1) ) {
      			
      			directions.push(direction);
      			distances.push(this.distManhattan(x,y,GC.app.food.x,GC.app.food.y));
      		
      		} else
      		GC.app.drawBox(GC.app.ctx,x,y, 'red');
    	}

	}

  	this.ui5 = function () {
    	var directions=[];
    	var distances=[];
    	
    	this.checkDirection(this.x-1,this.y,distances,directions,'left');
    	this.checkDirection(this.x+1,this.y,distances,directions,'right');
    	this.checkDirection(this.x,this.y-1,distances,directions,'up');
    	this.checkDirection(this.x,this.y+1,distances,directions,'down');

	    var min=1000000000;
	    for (var i=0;i<directions.length;i++) {
	      	if (distances[i]<min) {
	        	min=distances[i];
	        	this.direction=directions[i];
	      	}
	    }
	};

	this.heuristic = function(current_node, destination) {
		// This is the Manhattan distance
		var x = current_node.x-destination.x;
		var y = current_node.y-destination.y;
		return x*x+y*y;
	}

	this.ui6 = function () {
		var node = function (x,y,parent_i,g,h,f) {
			this.x=x;
			this.y=y;
			this.parent_i=parent_i;
			this.g=g;
			this.h=h;
			this.f=f;
		}
  		var section=this.sections[this.sections.length-1].split(',');
  		var start=new node(GC.app.food.x,GC.app.food.y,-1,-1,-1,-1);
  		var destination= new node(parseInt(section[0]),parseInt(section[1]),-1,-1,-1,-1);

  		var open=[];
  		var closed=[];

  		var g=0;
  		var h=this.heuristic(start,destination);
  		var f=g+h;

  		open.push(start);


  		while (open.length>0) {
  		
  			var best_cost = open[0].f;
  			var best_node = 0;

  			for (var i=1;i<open.length;i++) {
  				if (open[i].f<best_cost) {
  					best_cost=open[i].f;
  					best_node=i;
  				}
  			}

  			var current_node=open[best_node];

  			if (current_node.x===destination.x && current_node.y===destination.y) {

				var curr = current_node;
				var prev = closed[current_node.parent_i];

				var dx=curr.x-prev.x;
				var dy=curr.y-prev.y;

				if ((dx===0)&&(dy===1)) this.direction='up';
				if ((dx===0)&&(dy===-1)) this.direction='down';
				if ((dx===1)&&(dy===0)) this.direction='left';
				if ((dx===-1)&&(dy===0)) this.direction='right';
				console.log(curr,prev,"Found!",this.direction);
  			}

  			open.splice(best_node, 1);
  			closed.push(current_node);

  			for (var new_node_x=Math.max(0,current_node.x-1); new_node_x<=Math.min(GC.app.cellwidth-1,current_node.x+1); new_node_x++)
  				for (var new_node_y=Math.max(0,current_node.y-1); new_node_y<=Math.min(GC.app.cellheight-1,current_node.y+1); new_node_y++) {
					if (new_node_x != current_node.x && new_node_y != current_node.y)
						continue;
  					if (!this.isCollision(new_node_x,new_node_y) || (destination.x===new_node_x && destination.y===new_node_y)) {
  						var found_in_closed=false;
  						for (var i in closed) 
  							if (closed[i].x===new_node_x && closed[i].y===new_node_y) {
  								found_in_closed=true;
  								break;
  							}
  						if (found_in_closed)
  							continue;

  						var found_in_open = false;
  						for (var i in open)
  							if (open[i].x===new_node_x && open[i].y===new_node_y) {
  								found_in_open=true;
  								break;
  							}

  						if (!found_in_open) {
  							var new_node=new node(new_node_x,new_node_y,closed.length-1,-1,-1,-1);
  							new_node.g=current_node.g+this.heuristic(new_node,current_node);
  							new_node.h=this.heuristic(new_node,destination);
  							new_node.f=new_node.g+new_node.h;
  							open.push(new_node);
  						}
  					}
  				}
  		}
		
	};


});

var Food = Class(function() {
  this.x = 0;
  this.y = 0;
  this.color = "#0FF";

  this.init = function () {
  	this.set();
  }

  this.set = function () {
  	var finish=false;
  	while (!finish) {
    	this.x=parseInt(Math.random()*GC.app.cellwidth);
    	this.y=parseInt(Math.random()*GC.app.cellheight);
    	finish=(GC.app.snake.sections.indexOf(this.x+','+this.y)<0);
    }
  };

  this.draw = function () {
    GC.app.drawBox(GC.app.ctx,this.x,this.y,this.color);
  }
});




/*
ui1: random 100%
ui2: random dir + collision dect 
ui3: euclidean distance + collision dect
ui4: euclidean distance + collision dect + deadend detection
ui5: euclidean distance + collision dect + area calculation 
ui6: a star
*/
