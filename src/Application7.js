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
				var x=parseInt(pt.x / this.zoomx);
				var y=parseInt(pt.y / this.zoomy);
				if (GC.app.snake.sections.indexOf(x+','+y)<0) {
      				this.food.x=x;
      				this.food.y=y;
      				if (this.food.x>this.cellwidth-1) this.food.x=this.cellwidth-1;
      				if (this.food.y>this.cellheight-1) this.food.y=this.cellheight-1;
      			}
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

	this.drawBoxText = function (ctx,x,y,text) {
	    ctx.fillStyle='white';
	    ctx.font = '6px isonorm';
	    ctx.fillText(text,x*this.zoomx+5,y*this.zoomy+5);
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
	var x,y,color,direction,weights;
	var sections = [];
	var grid=[];
	var areasizes=[]; // size of areas
	var areamax; // max area
	var inverseDirection = {
	  	'up':'down',
  		'left':'right',
  		'right':'left',
  		'down':'up'
	};

  	this.init = function () {
	    this.sections=[];
	    this.direction='left';
	    this.weights=[21.18,16.6,15.5];  // distance, edges, perimeter,
	    this.x=parseInt(GC.app.cellwidth/2);
	    this.y=parseInt(GC.app.cellheight/2);
	    for (i=this.x+5; i>=this.x; i--)
	      this.sections.push(i+','+this.y);

	  	this.grid=[];
		for (var i=0;i<GC.app.cellwidth;i++) {
			this.grid[i]=[];
			for (var j=0;j<GC.app.cellheight;j++) {
				this.grid[i][j]=0;
			}
		}
		this.areasizes=[];
		this.maxarea=0;
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

	// recursive floodFill
	this.floodFill = function (x,y,count) {
		if (!this.isCollision(x,y) && this.grid[x][y]!=count) {
			this.grid[x][y]=count;
			//GC.app.drawBoxText(GC.app.ctx,x,y,count);
			this.areasizes[count]++;
			this.floodFill(x+1,y,count);
			this.floodFill(x-1,y,count);
			this.floodFill(x,y+1,count);
			this.floodFill(x,y-1,count);
		}
	}

	// linear floodFill
	this.floodFill2 = function (x,y,count) {
		Qx=[];
		Qy=[];
		Qx.push(x);
		Qy.push(y);
		while (Qx.length) {
			var i=Qx.pop();
			var j=Qy.pop();
			if (!this.isCollision(i,j) && this.grid[i][j]!=count) {	
				this.grid[i][j]=count;
				//GC.app.drawBoxText(GC.app.ctx,x,y,count);
				this.areasizes[count]++;
				Qx.push(i+1); Qy.push(j);
				Qx.push(i-1); Qy.push(j);
				Qx.push(i); Qy.push(j+1);
				Qx.push(i); Qy.push(j-1);
			}
		}
	}



	// simple flood fill (not working)
	// this.calcArea = function () {
	// 	var this.areasizes = [];
	// 	this.floodFill(x,y,this.areasizes);
	// };

	// two-pass with flood fill
	this.calcArea2 = function () {
		var width=GC.app.cellwidth;
		var height=GC.app.cellheight;
		var count=0;

		this.areasizes=[];

		for (var i=0;i<width;i++) {
			for (var j=0;j<height;j++) {
				this.grid[i][j]=-1;
			}
		}

		for (var i=0;i<width;i++) {
			for (var j=0;j<height;j++) {			
				if (this.sections.indexOf(i+','+j)<0 && this.grid[i][j]<0) {
					this.areasizes[count]=0;
					this.floodFill2(i,j,count);
					count++;
					//console.log(i,j,count);
				} 
			}
		}

		// if (count>1) 
		// 	this.maxarea=Math.max.apply(Math,this.areasizes);
		// else
		// 	this.maxarea=this.areasizes[0];
		//console.log(this.maxarea,count,this.areasizes);
	};

	this.unionCoords = function (x,y,x2,y2) {
		if (y2<GC.app.cellheight && x2<GC.app.cellwidth && this.isCollision(x,y) && this.isCollision(x2,y2)) {
			var a=y*GC.app.cellwidth+x;
			var b=y2*GC.app.cellwidth+x2;
			while (this.areasizes[a]!=a)
				a=this.areasizes[a];
			while (this.areasizes[b]!=b)
				b=this.areasizes[b];
			this.areasizes[b]=a;
		}

	};

	// union find connected components
	this.calcArea3 = function () {
		var width=GC.app.cellwidth;
		var height=GC.app.cellheight;
		var count=0;

		this.areasizes=[];

		for (var i=0;i<width*height;i++)
			this.areasizes[i]=i;

		for (var i=0;i<width;i++) {
			for (var j=0;j<height;j++) {
				this.unionCoords(i,j,i+1,j);
				this.unionCoords(i,j,i,j+1);
			}
		}

		// for (var j=0;j<height;j++) {
		// 	for (var i=0;i<width;i++) {
		// 		var c=i*height+j;
		// 		while (this.areasizes[c]!=c) 
		// 			c=this.areasizes[c];
		// 			console.log('a'+c);
		// 	}
		// }		
		console.log(count,this.areasizes);
	};

	this.getAdjacent = function (x,y) {
		var count=0;
		if (!this.isCollision(x+1,y)) count++;
		if (!this.isCollision(x-1,y)) count++;
		if (!this.isCollision(x,y+1)) count++;
		if (!this.isCollision(x,y-1)) count++;
		return count;
	};

	this.checkDirection = function (x,y,areas,directions,scores,direction) {
		var score=0;

		// if the movement reach the food, we got it!
		if ((x===GC.app.food.x) && (y===GC.app.food.y)) {
			score=1000000;
			// send the direction
			directions.push(direction);
			scores.push(score); 
			return 1;
		} 

    	// if the movement kill the snake, discard it
    	if (this.isCollision(x,y)) score=-1;

    	if (score!=-1) {
	      	// if the movement decrease the manhattan distance, score is higher
	      	var distance=this.distManhattan(x,y,GC.app.food.x,GC.app.food.y);
	      	score+=(GC.app.cellwidth+GC.app.cellheight-distance)*this.weights[0];

	      	if (x===0 || x===(GC.app.cellwidth-1) || y===0 || y===(GC.app.cellheight-1)) {
	      		score-=this.weights[1];
	      		if (score<-1) score=1;
	      	}

			// if the movement reduce the snake perimeter, score is higher
			if (this.sections.length>(GC.app.cellwidth*GC.app.cellheigth*0.16)) {
				if (this.getAdjacent(x,y)>1) 
					score+=weights[2];	
			}

		    // if the movement goes to the larger area, score is higher
		    var val=this.grid[x][y];
		   	var area=this.areasizes[val];
		   	areas.push(area);
		      	
			// send the direction
			directions.push(direction);
			scores.push(score); 
			return 1;
		}
	}

  	this.ui5 = function () {
    	var directions=[];
    	var scores=[];
    	var distances=[];
    	var areas=[];

    	this.calcArea3();
    	//var olddistance=this.distManhattan(this.x,this.y,GC.app.food.x,GC.app.food.y);

    	this.checkDirection(this.x-1,this.y,areas,directions,scores,'left');
    	this.checkDirection(this.x+1,this.y,areas,directions,scores,'right');
    	this.checkDirection(this.x,this.y-1,areas,directions,scores,'up');
    	this.checkDirection(this.x,this.y+1,areas,directions,scores,'down');

    	// area max score!
    	if (this.areasizes.length>1) {
		    var max=0;
	    	for (var i=0;i<directions.length;i++) {
	      		if (areas[i]>=max) {
	        		max=areas[i];
		      	}
	    	}
	    	for (i=0;i<directions.length;i++) {
	      		if (areas[i]===max) {
	        		scores[i]+=10000;
		      	}
	    	}
    	
	    }

	//	console.log("head:"+[this.x,this.y],"food:"+[GC.app.food.x,GC.app.food.y],"dirs:"+directions,"scores:"+scores,"areas:"+areas);
	    var max=0;
	    for (var i=0;i<directions.length;i++) {
	      	if (scores[i]>=max) {
	        	max=scores[i];
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
