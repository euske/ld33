// scene.js
// Scene object takes care of every in-game object and the scrollable map.

function Scene(game)
{
  this.game = game;
  this.music = null;
  this.changed = new Slot(this);
}

Scene.prototype.init = function ()
{
};

Scene.prototype.update = function ()
{
};

Scene.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.game.screen.width, this.game.screen.height);
};

Scene.prototype.move = function (vx, vy)
{
};

Scene.prototype.action = function (action)
{
};

Scene.prototype.mousedown = function (x, y, button)
{
};

Scene.prototype.mouseup = function (x, y, button)
{
};

Scene.prototype.mousemove = function (x, y)
{
};


//  Title
//
function Title(game)
{
  Scene.call(this, game);
}

Title.prototype = Object.create(Scene.prototype);

Title.prototype.init = function (text)
{
  var frame = this.game.frame;
  var e = this.game.addElement(
    new Rectangle(frame.width/8, frame.height/4,
		  3*frame.width/4, frame.height/2));
  e.align = 'left';
  e.style.padding = '10px';
  e.style.color = 'black';
  e.style.background = 'white';
  e.style.border = 'solid black 2px';
  e.innerHTML = text;
  var changed = this.changed;
  e.onmousedown = (function (e) { changed.signal(); });
};

Title.prototype.mousedown = function (x, y, button)
{
  this.changed.signal();
};

Title.prototype.action = function (action)
{
  if (action) {
    this.changed.signal();
  }
};


//  Level
// 
function Level(game)
{
  Scene.call(this, game);
  
  this.tilesize = game.tilesize;
  this.window = new Rectangle(0, 0, game.screen.width, game.screen.height);
  this.world = new Rectangle(0, 0, game.screen.width, game.screen.height);
}

Level.prototype = Object.create(Scene.prototype);
  
Level.prototype.init = function ()
{
  // [OVERRIDE]
  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;

  this.tilemap = new TileMap(this.tilesize, Levels.LEVEL1);
  this.world.width = this.tilemap.width * this.tilesize;
  this.world.height = this.tilemap.height * this.tilesize;
  this.window.width = Math.min(this.world.width, this.window.width);
  this.window.height = Math.min(this.world.height, this.window.height);
    
  var game = this.game;
  var scene = this;
  var tilemap = this.tilemap;
  var f = function (x,y) {
    var c = tilemap.get(x,y);
    if (T.isActor(c)) {
      var rect = tilemap.map2coord(new Vec2(x,y));
      var obj;
      // EnemyStill(rect, tileno, health[, attack, hostility, maxphase])
      switch (c) {
      case T.BABY:
	obj = new Baby(rect, 1000);
	scene.player = obj;
	break;
      case T.REALDOOR:
	obj = new EnemyStill(rect, S.DOOR, 1000);
	break;
      case T.TV:
	obj = new EnemyStill(rect, S.TV, 10, 0, -1, 2);
	break;
      case T.SOFA_R:
	obj = new EnemyStill(rect, S.SOFA_R, 30);
	break;
      case T.SOFA_L:
	obj = new EnemyStill(rect, S.SOFA_L, 30);
	break;
      case T.TABLE:
	obj = new EnemyStill(rect, S.TABLE, 20);
	break;
      case T.CLEANER:
	obj = new EnemyCleaner(rect, 20, 2, 10);
	break;
      case T.MICROWAVE:
	obj = new EnemyStill(rect, S.MICROWAVE, 30, 1, 20, 2);
	break;
      case T.WASHER:
	obj = new EnemyWasher(rect, 30, 5, 20);
	break;
      case T.CLOCK:
	obj = new EnemyStill(rect, S.CLOCK, 20, 1, 10, 2);
	break;
      case T.PHONE:
	obj = new EnemyStill(rect, S.PHONE, 10, 0, 5, 2);
	break;
      case T.COOKER:
	obj = new EnemyStill(rect, S.COOKER, 20, 2, 1, 2);
	break;
      case T.PLANT:
	obj = new EnemyStill(rect, S.PLANT, 10);
	break;
      case T.FISHBOWL:
	obj = new EnemyStill(rect, S.FISHBOWL, 5, 0, -1, 2);
	break;
      case T.FRIDGE:
	obj = new EnemyStill(rect, S.FRIDGE, 20);
	break;
      }
      scene.addObject(obj);
      tilemap.set(x, y, T.CARPET);
    }
  };
  this.tilemap.apply(null, f);

  this.target = null;
};

Level.prototype.update = function ()
{
  // [OVERRIDE]
  this.updateObjects(this.tasks);
  this.cleanObjects(this.tasks);
  this.cleanObjects(this.sprites);
  this.cleanObjects(this.colliders);
  var rect = this.player.bounds.inflate(this.window.width/2, this.window.height/2);
  this.setCenter(rect);
  this.ticks++;
};

Level.prototype.setCenter = function (rect)
{
  if (this.window.width < rect.width) {
    this.window.x = (rect.width-this.window.width)/2;
  } else if (rect.x < this.window.x) {
    this.window.x = rect.x;
  } else if (this.window.x+this.window.width < rect.x+rect.width) {
    this.window.x = rect.x+rect.width - this.window.width;
  }
  if (this.window.height < rect.height) {
    this.window.y = (rect.height-this.window.height)/2;
  } else if (rect.y < this.window.y) {
    this.window.y = rect.y;
  } else if (this.window.y+this.window.height < rect.y+rect.height) {
    this.window.y = rect.y+rect.height - this.window.height;
  }
  this.window.x = clamp(0, this.window.x, this.world.width-this.window.width);
  this.window.y = clamp(0, this.window.y, this.world.height-this.window.height);
};

Level.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]
  Scene.prototype.render.call(this, ctx, bx, by);

  var tilesize = this.tilesize;
  var window = this.window;
  var tilemap = this.tilemap;
  var x0 = Math.floor(window.x/tilesize);
  var y0 = Math.floor(window.y/tilesize);
  var x1 = Math.ceil((window.x+window.width)/tilesize);
  var y1 = Math.ceil((window.y+window.height)/tilesize);
  var fx = x0*tilesize-window.x;
  var fy = y0*tilesize-window.y;
  var wx = bx-window.x;
  var wy = by-window.y;

  // Draw the tilemap.
  tilemap.renderFromBottomLeft(
    ctx, this.game.tiles, 
    function (x,y) { return tilemap.get(x,y); },
    bx+fx, by+fy, x0, y0, x1-x0+1, y1-y0+1);

  // Set the drawing order.
  var map = [];
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) continue;
    if (obj instanceof Particle) continue;
    if (obj instanceof HealthBar) continue;
    var bounds = obj.bounds;
    if (bounds.overlap(window)) {
      var y = Math.floor((bounds.y+bounds.height/2)/tilesize);
      map.push({y:y, obj:obj});
    }
  }

  // Draw the objects.
  map.sort(function (a,b) { return a.y-b.y; });
  for (var i = 0; i < map.length; i++) {
    var obj = map[i].obj;
    obj.render(ctx, wx, wy);
  }

  // Draw the target aim.
  if (this.target !== null && this.target.alive) {
    var src = this.game.images.target;
    var b = this.target.bounds;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(wx+b.x-0.5, wy+b.y-0.5, b.width+2, b.height+3);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(wx+b.x-1.5, wy+b.y-1.5, b.width+2, b.height+3);
    ctx.drawImage(src, wx+b.x+Math.floor((b.width-src.width)/2),
		  wy+b.y-src.height-2);
  }

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else if (obj instanceof Particle ||
	       obj instanceof HealthBar) {
      obj.render(ctx, wx, wy);
    }
  }
};

Level.prototype.collideTile = function (rect, v0)
{
  var tilemap = this.tilemap;
  var ts = tilemap.tilesize;
  function f(x, y, v) {
    if (T.isObstacle(tilemap.get(x, y))) {
      var hitbox = new Rectangle(x*ts, y*ts, ts, ts);
      v = rect.collide(v, hitbox);
    }
    return v;
  }
  var r = rect.move(v0.x, v0.y).union(rect);
  return tilemap.reduce(tilemap.coord2map(r), f, v0);
};

Level.prototype.collideObject = function (obj0, v0, objs)
{
  var v = v0;
  var r = obj0.hitbox.move(v0.x, v0.y).union(obj0.hitbox);
  if (obj0.alive && obj0.scene === this && obj0.hitbox !== null) {
    for (var i = 0; i < objs.length; i++) {
      var obj1 = objs[i];
      if (obj1.alive && obj1.scene === this && obj1.hitbox !== null &&
	  obj1 !== obj0 && obj1.hitbox.overlap(r)) {
	v = obj0.hitbox.collide(v, obj1.hitbox);
      }
    }
  }
  return v;
};

Level.prototype.findOverlappingObjects = function (obj0, v0)
{
  var a = [];
  var r = obj0.hitbox.move(v0.x, v0.y).union(obj0.hitbox);
  if (obj0.alive && obj0.scene === this && obj0.hitbox !== null) {
    for (var i = 0; i < this.colliders.length; i++) {
      var obj1 = this.colliders[i];
      if (obj1.alive && obj1.scene === this && obj1.hitbox !== null &&
	  obj1 !== obj0 && obj1.hitbox.overlap(r)) {
	a.push(obj1);
      }
    }
  }
  return a;
};
  
Level.prototype.addObject = function (obj)
{
  if (obj.update !== undefined) {
    if (obj.scene === null) {
      obj.start(this);
    }
    this.tasks.push(obj);
  }
  if (obj.render !== undefined) {
    this.sprites.push(obj);
  }
  if (obj.hitbox !== undefined) {
    this.colliders.push(obj);
  }
};

Level.prototype.removeObject = function (obj)
{
  if (obj.update !== undefined) {
    removeArray(this.tasks, obj);
  }
  if (obj.render !== undefined) {
    removeArray(this.sprites, obj);
  }
  if (obj.hitbox !== undefined) {
    removeArray(this.colliders, obj);
  }
};

Level.prototype.updateObjects = function (objs)
{
  for (var i = 0; i < objs.length; i++) {
    objs[i].update();
  }
};

Level.prototype.cleanObjects = function (objs)
{
  function f(obj) { return !obj.alive; }
  removeArray(objs, f);
};

Level.prototype.move = function (vx, vy)
{
  this.player.motion.x = vx;
  this.player.motion.y = vy;
};

Level.prototype.action = function (action)
{
  this.player.action(action);
};
