// main.js

// Browser interaction.

function run()
{
  // [NO NEED TO CHANGE]
  
  function getprops(a) {
    var d = {};
    for (var i = 0; i < a.length; i++) { d[a[i].id] = a[i]; }
    return d;
  }
  
  var framerate = 30;
  var images = getprops(document.getElementsByTagName('img'));
  var audios = getprops(document.getElementsByTagName('audio'));
  var labels = getprops(document.getElementsByClassName('label'));
  var frame = document.getElementById('main');
  var game = new Game(framerate, frame, images, audios, labels);
  var ctx = getEdgeyContext(frame);
  var timer;
  
  function repaint() {
    ctx.drawImage(game.screen,
		  0, 0, game.screen.width, game.screen.height,
		  0, 0, frame.width, frame.height);
  }    
  
  function update() {
    if (game.active) {
      game.update();
      game.repaint();
      repaint();
    }
  }
  
  function keydown(e) {
    if (game.active) {
      game.keydown(e);
      switch (e.keyCode) {
      case 8:			// Backspace
      case 9:			// Tab
      case 13:			// Return
      case 14:			// Enter
      case 32:			// Space
      case 33:			// PageUp
      case 34:			// PageDown
      case 35:			// End
      case 36:			// Home
      case 37:			// Left
      case 38:			// Up
      case 39:			// Right
      case 40:			// Down
	e.preventDefault();
	break;
      }
    }
  }
  
  function keyup(e) {
    if (game.active) {
      game.keyup(e);
    }
  }
  
  function mousedown(e) {
    if (game.active) {
      game.mousedown(e);
    }
  }
  
  function mouseup(e) {
    if (game.active) {
      game.mouseup(e);
    }
  }
  
  function mousemove(e) {
    if (game.active) {
      game.mousemove(e);
    }
  }
  
  function focus(e) {
    if (!game.active) {
      game.focus(e);
      repaint();
    }
  }
  
  function blur(e) {
    if (game.active) {
      game.blur(e);
      repaint();
    }
    var size = 50;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,64, 0.5)'; // gray out.
    ctx.fillRect(0, 0, frame.width, frame.height);
    ctx.fillStyle = 'lightgray';
    ctx.beginPath();		// draw a play button.
    ctx.moveTo(frame.width/2-size, frame.height/2-size);
    ctx.lineTo(frame.width/2-size, frame.height/2+size);
    ctx.lineTo(frame.width/2+size, frame.height/2);
    ctx.fill();
    ctx.restore();
  }
  
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  window.addEventListener('mousedown', mousedown);
  window.addEventListener('mouseup', mouseup);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('focus', focus);
  window.addEventListener('blur', blur);
  
  game.init(0);
  game.focus(null);
  timer = window.setInterval(update, 1000/framerate);
}
