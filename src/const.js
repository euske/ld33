// const.js

// [GAME SPECIFIC CODE]

S = {
  BABY: 0,
  BABY_R1: 0, 
  BABY_R2: 1,
  BABY_L1: 2, 
  BABY_L2: 3,
  BABY_U1: 4, 
  BABY_U2: 5,
  BABY_D1: 6, 
  BABY_D2: 7,
  TV1: 8,
  TV2: 9,
};

T = {
  NONE: 0,
  WALL: 1,
  DOOR: 2,
  WINDOW_L: 3,
  WINDOW_R: 4,

  FLOOR: 5,
  CARPET: 6,

  ENEMY: 10,

  // isObstacle: Blocks moving and cannot be overlapped. e.g. brick.
  isObstacle: function (c) { return (c < 0 || c == 111); },
  isEnemy: function (c) { return (T.ENEMY <= c); },
  
  // isStoppable: Stops falling but can move onto it if forced. e.g. hay, ladder.
  isStoppable: function (c) { return (c < 0 || c == T.BLOCK || c == T.LADDER); },
  // isGrabbable: Allows climing by holding it. e.g. ladder.
  isGrabbable: function (c) { return (c == T.LADDER); },
  // isCollectible: Something to score.
  isCollectible: function (c) { return (c == T.COLLECTIBLE); },

};
