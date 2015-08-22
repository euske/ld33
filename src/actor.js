// actor.js

// Task: a single procedure that runs at each frame.
function Task(body)
{
  this.init();
  this.body = body;
}

Task.prototype.init = function ()
{
  this.scene = null;
  this.alive = true;
};

Task.prototype.start = function (scene)
{
  this.scene = scene;
  this.ticks0 = scene.ticks;
};

Task.prototype.update = function ()
{
  this.body(this);
};


// Queue: a list of Tasks that runs sequentially.
function Queue(tasks)
{
  Task.call(this);
  this.tasks = tasks;
}

Queue.prototype = Object.create(Task.prototype);

Queue.prototype.update = function ()
{
  while (0 < this.tasks.length) {
    var task = this.tasks[0];
    if (task.scene === null) {
      task.start(this.scene);
    }
    task.update();
    if (task.alive) return;
    this.tasks.shift();
  }
  this.alive = false;
};

Queue.prototype.add = function (task)
{
  this.tasks.push(task);
};

Queue.prototype.remove = function (task)
{
  removeArray(this.tasks, task);
};


// Sprite: a moving object that doesn't interact.
function Sprite(bounds)
{
  Task.call(this);
  this.bounds = (bounds === null)? bounds : bounds.copy();
}

Sprite.prototype = Object.create(Task.prototype);

Sprite.prototype.toString = function ()
{
  return '<Sprite: '+this.bounds+'>';
};

Sprite.prototype.update = function ()
{
  // [OVERRIDE]
};

Sprite.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]
};


// Particle
function Particle(bounds, duration, dir, tileno, maxphase)
{
  Sprite.call(this, bounds);
  this.duration = duration;
  this.dir = dir;
  this.tileno = tileno;
  this.maxphase = (maxphase !== undefined)? maxphase : 1;
  this.phase = 0;
}

Particle.prototype = Object.create(Sprite.prototype);

Particle.prototype.toString = function ()
{
  return '<Particle: '+this.tileno+': '+this.bounds+'>';
};

Particle.prototype.update = function ()
{
  Sprite.prototype.update.call(this);
  this.phase = Math.floor(this.scene.ticks/10) % this.maxphase;
  if (this.scene.ticks < this.ticks0+this.duration) {
    this.bounds.x += this.dir.x;
    this.bounds.y += this.dir.y;
  } else {
    this.alive = false;
  }
};

Particle.prototype.render = function (ctx, bx, by)
{
  var sprites = this.scene.game.sprites;
  var tw = this.scene.tilesize;
  var th = sprites.height;
  var w = this.bounds.width;
  var h = this.bounds.height;
  var tileno = this.tileno+this.phase;
  ctx.drawImage(sprites,
		tileno*tw, 0, w, th,
		bx+this.bounds.x, by+this.bounds.y+h-th, w, th);
};


// Actor: a character that can interact with other characters.
function Actor(bounds, hitbox, tileno, health)
{
  Sprite.call(this, bounds);
  this.hitbox = (hitbox === null)? hitbox : hitbox.copy();
  this.tileno = tileno;
  this.health = health;
}

Actor.prototype = Object.create(Sprite.prototype);

Actor.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]
  var tw = this.scene.tilesize;
  var sprites = this.scene.game.sprites;
  if (sprites === null) {
    // show a placefolder.
    ctx.fillStyle = this.tileno;
    ctx.fillRect(bx+this.bounds.x, by+this.bounds.y,
		 this.bounds.width, this.bounds.height);
  } else {
    var th = sprites.height;
    var w = this.bounds.width;
    var h = this.bounds.height;
    ctx.drawImage(sprites,
		  this.tileno*tw, 0, w, th,
		  bx+this.bounds.x, by+this.bounds.y+h-th, w, th);
  }
};

Actor.prototype.move = function (dx, dy)
{
  // [OVERRIDE]
  this.bounds = this.bounds.move(dx, dy);
  this.hitbox = this.hitbox.move(dx, dy);
};

Actor.prototype.hit = function (attack)
{
  log("hit: "+this);
  this.health = Math.max(0, this.health-attack);
  if (this.health == 0) {
    this.alive = false;
  }
};


// Baby
function Baby(bounds, health, attack)
{
  Actor.call(this, bounds, bounds.inflate(-4,-4), S.BABY, health);
  this.attack = attack;
  this.speed = 2;
  this.step = 0;
  this.dir = new Vec2(+1,0);
}

Baby.prototype = Object.create(Actor.prototype);

Baby.prototype.toString = function ()
{
  return '<Baby: '+this.bounds+' health='+this.health+'>';
};

Baby.prototype.update = function ()
{
  this.tileno = S.BABY + Math.floor(this.step/4)%2*2 + ((0 < this.dir.x)? 0 : +1);
};

Baby.prototype.move = function (dx, dy)
{
  var v = new Vec2(dx*this.speed, dy*this.speed);
  var objs = this.scene.findOverlappingObjects(this, v);
  v = this.scene.collideTile(this.hitbox, v);
  v = this.scene.collideObject(this, v, objs);
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (obj instanceof Actor) {
      obj.hit(this.attack);
    }
    if (obj instanceof Enemy) {
      obj.love(this.attack);
      this.scene.target = obj;
    }
  }
  Actor.prototype.move.call(this, v.x, v.y);
  if (dx != 0 || dy != 0) {
    this.step++;
    this.dir.x = dx;
    this.dir.y = dy;
  }
};

Baby.prototype.action = function (action)
{
};

// Enemy
function Enemy(bounds, tileno, health, attack, hostility)
{
  Actor.call(this, bounds, bounds.inflate(-4,-4), tileno, health);
  this.attack = attack;
  this.hostility = hostility;
  this.t0 = 0;
}

Enemy.prototype = Object.create(Actor.prototype);

Enemy.prototype.toString = function ()
{
  return ('<Enemy('+this.tileno+'): '+this.bounds+
	  ' health='+this.health+' hostility='+this.hostility+'>');
};

Enemy.prototype.move = function (dx, dy)
{
  var v = new Vec2(dx, dy);
  var objs = this.scene.findOverlappingObjects(this, v);
  v = this.scene.collideTile(this.hitbox, v);
  v = this.scene.collideObject(this, v, objs);
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (this.hostility <= 0) {
      if (obj instanceof Enemy) {
	obj.hit(this.attack);
      }
    } else {
      if (obj instanceof Baby) {
	obj.hit(this.attack);
      }
    }
  }
  Actor.prototype.move.call(this, v.x, v.y);
};

Enemy.prototype.love = function (attack)
{
  if (0 < this.hostility) {
    this.hostility = Math.max(0, this.hostility-attack);
    if (this.hostility == 0) {
      this.t0 = this.scene.ticks;
    }
  }
};

Enemy.prototype.update = function ()
{
  var fps = this.scene.game.framerate;
  if (this.hostility == 0 && ((this.scene.ticks-this.t0) % fps) == 0) {
    var particle = new Particle(this.bounds, fps, new Vec2(0,-1), S.HEART, 2);
    this.scene.addObject(particle);
  }
};

function EnemyStill(bounds, tileno, health, attack, hostility, maxphase)
{
  Enemy.call(this, bounds, tileno, health, attack, hostility);
  this.basetile = tileno;
  this.maxphase = (maxphase !== undefined)? maxphase : 1;
  this.phase = 0;
}

EnemyStill.prototype = Object.create(Enemy.prototype);

EnemyStill.prototype.update = function ()
{
  Enemy.prototype.update.call(this);
  this.phase = Math.floor(this.scene.ticks/10) % this.maxphase;
  this.tileno = this.basetile+this.phase;
};

function EnemyCleaner(bounds, health, attack, hostility)
{
  Enemy.call(this, bounds, S.CLEANER, health, attack, hostility);
  this.speed = 2;
  this.step = 0;
  this.dir = new Vec2(+1,0);
}

EnemyCleaner.prototype = Object.create(Enemy.prototype);

EnemyCleaner.prototype.update = function ()
{
  Enemy.prototype.update.call(this);
  if (rnd(10) == 0) {
    if (this.hostility == 0) {
      var target = this.scene.target;
      if (target === null || target === this || !target.alive) {
	target = this.scene.player;
      }
      if (rnd(2) == 0) {
	this.dir.x = (target.hitbox.x < this.hitbox.x)? -1 : +1;
	this.dir.y = 0;
      } else {
	this.dir.x = 0;
	this.dir.y = (target.hitbox.y < this.hitbox.y)? -1 : +1;
      }
    } else {
      this.dir = this.dir.rotate(rnd(3)-1);
    }
  }
  var v = this.dir.modify(this.speed);
  this.move(v.x, v.y);
  if (this.dir.x != 0 || this.dir.y != 0) {
    this.step++;
  }
  
  this.tileno = S.CLEANER + Math.floor(this.step/4)%2*2 + ((0 < this.dir.x)? 0 : +1);
};

function EnemyWasher(bounds, health, attack, hostility)
{
  EnemyStill.call(this, bounds, S.WASHER, health, attack, hostility, 2);
}

EnemyWasher.prototype = Object.create(EnemyStill.prototype);

EnemyWasher.prototype.update = function ()
{
  EnemyStill.prototype.update.call(this);
  if (rnd(3) == 0) {
    var v = new Vec2();
    if (this.hostility == 0) {
      var target = this.scene.target;
      if (target === null || target === this || !target.alive) {
	target = this.scene.player;
      }
      v.x = (target.hitbox.x < this.hitbox.x)? -1 : +1;
      v.y = (target.hitbox.y < this.hitbox.y)? -1 : +1;
    } else {
      v.x = rnd(3)-1;
      v.y = rnd(3)-1;
    }
    this.move(v.x, v.y);
  }
};
