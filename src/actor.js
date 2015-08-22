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


// Actor: a character that can interact with other characters.
function Actor(bounds, hitbox, tileno)
{
  Sprite.call(this, bounds);
  this.hitbox = (hitbox === null)? hitbox : hitbox.copy();
  this.tileno = tileno;
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


// Player
function Player(bounds, tileno)
{
  Actor.call(this, bounds, bounds.inflate(-4,-4), S.BABY);
  this.speed = 2;
  this.dir = +1;
  this.step = 0;
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.update = function ()
{
  this.tileno = S.BABY + this.step*2 + ((0 < this.dir)? 0 : +1);
};

Player.prototype.move = function (dx, dy)
{
  var v = new Vec2(dx*this.speed, dy*this.speed);
  v = this.scene.collideTile(this.hitbox, v);
  v = this.scene.collideObject(this, v);
  Actor.prototype.move.call(this, v.x, v.y);
  if (dx != 0 || dy != 0) {
    this.step = 1-this.step;
  }
  if (dx != 0) {
    this.dir = dx;
  }
}

Player.prototype.action = function (action)
{
  if (action == 1) {
    this.tileno = '#ffff00';
  } else if (action == 2) {
    this.tileno = '#00ffff';
  } else {
    this.tileno = '#ff0000';
  }
};

// Enemy
function Enemy(bounds, tileno)
{
  Actor.call(this, bounds, bounds.inflate(-4,-4), tileno);
}

Enemy.prototype = Object.create(Actor.prototype);

Enemy.prototype.update = function ()
{
  switch (this.tileno) {
  case S.TV1:
    this.tileno = S.TV2;
    break;
  case S.TV2:
    this.tileno = S.TV1;
    break;
  }
};
