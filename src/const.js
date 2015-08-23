// const.js

// [GAME SPECIFIC CODE]

S = {
  BABY: 0,
  BABY_R1: 0, 
  BABY_R2: 1,
  BABY_U1: 2, 
  BABY_U2: 3,
  BABY_D1: 4, 
  BABY_D2: 5,
  TV: 6,
  TV1: 6,
  TV2: 7,
  SOFA_R: 8,
  SOFA_L: 9,
  TABLE: 10,
  CLEANER: 11,
  CLEANER_R1: 11,
  CLEANER_R2: 12,
  FRIDGE: 13,
  FRIDGE1: 13,
  FRIDGE2: 14,
  WASHER: 15,
  WASHER1: 15,
  WASHER2: 16,
  CLOCK: 17,
  CLOCK1: 17,
  CLOCK2: 18,
  PHONE: 19,
  PHONE1: 19,
  PHONE2: 20,
  HEART: 21,
  HEART1: 21,
  HEART2: 22,
  COOKER: 23,
  COOKER1: 23,
  COOKER2: 24,
  DOOR: 25,
  SWEAT: 26,
  SWEAT1: 26,
  SWEAT2: 27,
  EXPLOSION: 28,
  EXPLOSION1: 28,
  EXPLOSION2: 29,
  SHADOW: 30,
};

T = {
  NONE: 0,
  WALL1: 1,
  WALL2: 2,
  WINDOW_L: 3,
  WINDOW_R: 4,
  OBSTACLE_END: 4,

  FLOOR: 5,
  CARPET: 6,

  ACTOR: 10,
  BABY: 10,
  TV: 11,
  SOFA_R: 12,
  SOFA_L: 13,
  TABLE: 14,
  CLEANER: 15,
  FRIDGE: 16,
  WASHER: 17,
  CLOCK: 18,
  PHONE: 19,
  COOKER: 20,
  REALDOOR: 21,
  
  // isObstacle: Blocks moving and cannot be overlapped. e.g. brick.
  isObstacle: function (c) { return (c < 0 || c <= T.OBSTACLE_END); },
  isActor: function (c) { return (T.ACTOR <= c); },
  
  // isStoppable: Stops falling but can move onto it if forced. e.g. hay, ladder.
  isStoppable: function (c) { return (c < 0 || c == T.BLOCK || c == T.LADDER); },
  // isGrabbable: Allows climing by holding it. e.g. ladder.
  isGrabbable: function (c) { return (c == T.LADDER); },
  // isCollectible: Something to score.
  isCollectible: function (c) { return (c == T.COLLECTIBLE); },

};
