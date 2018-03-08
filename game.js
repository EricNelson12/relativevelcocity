/**
 * BCLearningNetwork.com
 * Game Title
 * @author
 * Date
 */


//// VARIABLES ////

var mute = false;
var FPS = 20;
var STAGE_WIDTH, STAGE_HEIGHT;
var gameStarted = false;
var sliderCurrent
var sliderThrottle


var SPEED = 2;
var CURRENT = 1 * SPEED;
var THROTTLE = 2 * SPEED;
var BOAT_X = 90
var BOAT_Y = 524

var WATER_HEIGHT = 0

var castText
var resetText

var MOVE_BOAT = false;

var lineCurrent
var lineResult
var lineThrottle


// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;

/*
 * Initialize the stage and some createJS settings
 */
function init() {
  STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
  STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

  // init state object
  stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas

  // // Get mouse coordinates
  // stage.on("stagemousemove", function (event) {

  //   shrub.x = stage.mouseX
  //   shrub.y = stage.mouseY
  //   console.log(stage.mouseX + "," + stage.mouseY)

  // });

  //Add sliders to DOM, and create game object
  sliderCurrent = new Slider()
  sliderThrottle = new Slider()

  document.body.appendChild(sliderCurrent.html)
  document.body.appendChild(sliderThrottle.html)

  sliderCurrent.game = new createjs.DOMElement(sliderCurrent.html);
  sliderThrottle.game = new createjs.DOMElement(sliderThrottle.html);

  sliderThrottle.html.max = 2 * THROTTLE;
  sliderThrottle.html.min = THROTTLE;
  sliderThrottle.html.step = THROTTLE;

  sliderCurrent.html.max = 2 * CURRENT;
  sliderCurrent.html.step = CURRENT;

  CURRENT = 0

  stage.addChild(sliderCurrent.game)
  stage.addChild(sliderThrottle.game)

  //Make sliders vertical (Unfortunately, CSS transform can't do it when you create a createjs.DOMElement)
  sliderCurrent.game.rotation += 270;
  sliderThrottle.game.rotation += 270;

  //Slider Listeners
  sliderCurrent.html.addEventListener("change", function () {
    CURRENT = parseFloat(this.value)
    createVectorLines()
  });

  sliderThrottle.html.addEventListener("change", function () {
    THROTTLE = parseFloat(this.value)
    createVectorLines()
  });



  stage.mouseEventsEnabled = true;
  stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes 

  setupManifest(); // preloadJS
  startPreload();

  stage.update();
}

/*
 * Main update loop.
 */
function update(event) {
  if (gameStarted) {
    updateSelectPositions()

    water1.y -= CURRENT;
    water2.y -= CURRENT;

    if (MOVE_BOAT) {
      animation.x = boat.x - 80
      animation.y = boat.y - 15
      animation.alpha = .8;
      if (boat.x > 550) {
        animation.alpha = 0;
        MOVE_BOAT = false;
      }
      boat.y -= CURRENT;
      boat.x += THROTTLE;
    }

    //The ole' water shuffle. 
    //Aka, when one water leaves the frame completely,
    //it jumps exactly behind the other water
    if (water1.y < -WATER_HEIGHT) {
      water1.y = water2.y + WATER_HEIGHT - 2;
    }
    if (water2.y < -WATER_HEIGHT) {
      water2.y = water1.y + WATER_HEIGHT - 2;
    }
  }

  stage.update(event);
}

/*
 * Ends the game.
 */
function endGame() {
  gameStarted = false;
}

/*
 * Place graphics and add them to the stage.
 */
function initGraphics() {

  initMuteUnMuteButtons();
  initListeners();

  water1.x = 60;
  water1.y = 0;
  stage.addChild(water1)

  water2.x = 60;
  water2.y = water2.getBounds().height - 2;
  stage.addChild(water2)

  var data = {
    images: ["images/waves.png"],
    frames: { width: 104, height: 78 },
    animations: {
      wave: [0, 13]
    }
  };
  var spriteSheet = new createjs.SpriteSheet(data);
  animation = new createjs.Sprite(spriteSheet, "wave");
  animation.x = 0
  animation.y = 0
  animation.alpha = 0
  stage.addChild(animation)

  shore.x = 0; shore.y = -30;
  shore.scaleY = 1.15
  stage.addChild(shore)

  dock.x = 576;
  dock.y = 8;
  stage.addChild(dock)

  rock.x = 658;
  rock.y = 283;
  stage.addChild(rock)

  shrub.x= 656
  shrub.y = 383;
  stage.addChild(shrub)

  boat.x = BOAT_X;
  boat.y = BOAT_Y;
  stage.addChild(boat)

  var controlPanel = new createjs.Shape();
  controlPanel.graphics.beginFill("#fff").drawRoundRectComplex(5, 5, 350, 70, 5, 5, 5, 5);
  controlPanel.alpha = 0.7;
  stage.addChild(controlPanel)

  playbutton.x = 225;
  playbutton.y = 19;
  var playScale = .3
  playbutton.scaleX = playScale;
  playbutton.scaleY = playScale;
  stage.addChild(playbutton)


  reset.x = 225;
  reset.y = 19;
  var playScale = .3
  reset.scaleX = playScale;
  reset.scaleY = playScale;
  reset.alpha = 0
  stage.addChild(reset)

  castText = new createjs.Text("Cast Off!", "bold 16px Arial", "Green");
  castText.x = 270;
  castText.y = 42;
  castText.textBaseline = "alphabetic";
  stage.addChild(castText)

  resetText = new createjs.Text("Reset", "bold 16px Arial", "orange");
  resetText.alpha = 0
  resetText.x = 270;
  resetText.y = 42;
  resetText.textBaseline = "alphabetic";
  stage.addChild(resetText)

  var currentText = new createjs.Text("River Current", "bold 13px Arial", "red");
  currentText.x = 7;
  currentText.y = 19;
  currentText.textBaseline = "alphabetic";
  stage.addChild(currentText)

  var throttleText = new createjs.Text("Boat Throttle", "bold 13px Arial", "blue");
  throttleText.x = 125;
  throttleText.y = 19;
  throttleText.textBaseline = "alphabetic";
  stage.addChild(throttleText)

  var labelCurrent = new createjs.Text("HIGH\nLOW\nOFF", "13px Arial", "black");
  labelCurrent.alpha = .7
  labelCurrent.x = 35;
  labelCurrent.y = 42;
  labelCurrent.textBaseline = "alphabetic";
  stage.addChild(labelCurrent)

  var labelThrottle = new createjs.Text("FULL\n\nHALF", "13px Arial", "black");
  labelThrottle.alpha = .7
  labelThrottle.x = 155;
  labelThrottle.y = 42;
  labelThrottle.textBaseline = "alphabetic";
  stage.addChild(labelThrottle)

  createVectorLines()


  // start the game
  gameStarted = true;
  stage.update();
}

function removeVectorLines(){
  stage.removeChild(arr1)
  stage.removeChild(arr2)
  stage.removeChild(arr3)
  stage.removeChild(arr4)
  stage.removeChild(arr5)
  stage.removeChild(arr6)
}

// This draws the vector images, I was trying to avoid making all of these 
//if statements, but I couldn't find any libraries for drawing arrows, and implementing
//that would take time. So unfortunately, this method undermines the reset of the code, which 
//primarily uses the slider values rather than preset animations to control the simulation :(
// ~Eric
function createVectorLines() {
  if(MOVE_BOAT){return}

  // console.log("Current: " + CURRENT)
  // console.log("Throttle: " + THROTTLE)
  removeVectorLines()

  if (CURRENT == 0 && THROTTLE == 2 * SPEED) {
    arr1.x = 190
    arr1.y = 545
    stage.addChild(arr1)
  } else if (CURRENT == 0 && THROTTLE == 4 * SPEED) {
    arr2.x = 190
    arr2.y = 545
    stage.addChild(arr2)
  }
  else if (CURRENT == SPEED && THROTTLE == 4 * SPEED) {
    arr3.x = 190
    arr3.y = 548 - arr3.image.height
    stage.addChild(arr3)
  }else if (CURRENT == SPEED && THROTTLE == 2 * SPEED) {
    arr4.x = 190
    arr4.y = 548 - arr4.image.height
    stage.addChild(arr4)
  }else if (CURRENT == 2* SPEED && THROTTLE == 2 * SPEED) {
    arr5.x = 190
    arr5.y = 548 - arr5.image.height
    stage.addChild(arr5)  
  }else if (CURRENT == 2*SPEED && THROTTLE == 4 * SPEED) {
    arr6.x = 190 
    arr6.y = 548 - arr6.image.height
    stage.addChild(arr6)
  }

}


/*
 * Adds the mute and unmute buttons to the stage and defines listeners
 */
function initMuteUnMuteButtons() {
  var hitArea = new createjs.Shape();
  hitArea.graphics.beginFill("#000").drawRect(0, 0, muteButton.image.width, muteButton.image.height);
  muteButton.hitArea = unmuteButton.hitArea = hitArea;

  muteButton.x = unmuteButton.x = 5;
  muteButton.y = unmuteButton.y = 555;

  muteButton.cursor = "pointer";
  unmuteButton.cursor = "pointer";

  muteButton.on("click", toggleMute);
  unmuteButton.on("click", toggleMute);

  stage.addChild(unmuteButton);
}

/*
 * Add listeners to objects.
 */

function initListeners() {

  reset.on("click", function () {
    createVectorLines()
    MOVE_BOAT = false;
    playbutton.alpha = 1;
    castText.alpha = 1;
    reset.alpha = 0;
    resetText.alpha = 0;
    animation.x = BOAT_X - 80
    animation.y = BOAT_Y - 15
    boat.x = BOAT_X;
    boat.y = BOAT_Y;
  });

  playbutton.on("click", function () {
    removeVectorLines()
    MOVE_BOAT = true;
    playbutton.alpha = 0;
    castText.alpha = 0;
    reset.alpha = 1;
    resetText.alpha = 1;
  })
}



function updateSelectPositions() {

  var y = 70

  sliderThrottle.game.x = gameCanvas.getBoundingClientRect().left + 125;
  sliderThrottle.game.y = gameCanvas.getBoundingClientRect().top + y;

  sliderCurrent.game.x = gameCanvas.getBoundingClientRect().left + 5;
  sliderCurrent.game.y = gameCanvas.getBoundingClientRect().top + y;
}




//////////////////////// PRELOADJS FUNCTIONS

// bitmap variables
var muteButton, unmuteButton, boat, arrows, dock, animation, reset, rock, shore, shrub, water1, water2, playbutton, arr1, arr2, arr3, arr4, arr5, arr6;

/*
 * Add files to be loaded here.
 */
function setupManifest() {
  manifest = [

    {
      src: "sounds/click.mp3",
      id: "click"
    },
    {
      src: "images/mute.png",
      id: "mute"
    },
    {
      src: "images/unmute.png",
      id: "unmute"
    },
    {
      src: "images/boat.png",
      id: "boat"
    },
    {
      src: "images/dock.png",
      id: "dock"
    },
    {
      src: "images/playbutton.png",
      id: "playbutton"
    },
    {
      src: "images/reset.png",
      id: "reset"
    },
    {
      src: "images/rock.png",
      id: "rock"
    },
    {
      src: "images/shore.png",
      id: "shore"
    },
    {
      src: "images/shrub.png",
      id: "shrub"
    },
    {
      src: "images/water.png",
      id: "water"
    },
    {
      src: "images/arr1.png",
      id: "arr1"
    },
    {
      src: "images/arr2.png",
      id: "arr2"
    },
    {
      src: "images/arr3.png",
      id: "arr3"
    },
    {
      src: "images/arr4.png",
      id: "arr4"
    },
    {
      src: "images/arr5.png",
      id: "arr5"
    },
    {
      src: "images/arr6.png",
      id: "arr6"
    },
  ];
}


function startPreload() {
  preload = new createjs.LoadQueue(true);
  preload.installPlugin(createjs.Sound);
  preload.on("fileload", handleFileLoad);
  preload.on("progress", handleFileProgress);
  preload.on("complete", loadComplete);
  preload.on("error", loadError);
  preload.loadManifest(manifest);
}

/*
 * Specify how to load each file.
 */
function handleFileLoad(event) {
  console.log("A file " + event.item.id + " has loaded of type: " + event.item.type);
  // create bitmaps of images
  if (event.item.id == "mute") {
    muteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "unmute") {
    unmuteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "boat") {
    boat = new createjs.Bitmap(event.result);
  } else if (event.item.id == "dock") {
    dock = new createjs.Bitmap(event.result);
  } else if (event.item.id == "playbutton") {
    playbutton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "reset") {
    reset = new createjs.Bitmap(event.result);
  } else if (event.item.id == "rock") {
    rock = new createjs.Bitmap(event.result);
  } else if (event.item.id == "shore") {
    shore = new createjs.Bitmap(event.result);
  } else if (event.item.id == "shrub") {
    shrub = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arr1") {
    arr1 = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arr2") {
    arr2 = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arr3") {
    arr3 = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arr4") {
    arr4 = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arr5") {
    arr5 = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arr6") {
    arr6 = new createjs.Bitmap(event.result);
  } else if (event.item.id == "water") {
    water1 = new createjs.Bitmap(event.result);
    water2 = new createjs.Bitmap(event.result);
    WATER_HEIGHT = water1.getBounds().height

  }
}

function loadError(evt) {
  console.log("Error!", evt);
}

// not currently used as load time is short
function handleFileProgress(event) {

}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
  console.log("Finished Loading Assets");

  // ticker calls update function, set the FPS
  createjs.Ticker.setFPS(FPS);
  createjs.Ticker.addEventListener("tick", update); // call update function

  // stage.addChild(background);
  stage.update();
  initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS
