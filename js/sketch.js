// For Yumi, Project Watch: Line watch, balance blue watch, dot watch

// Tweak interface /////////////////////////////////////////////
var diaFactor = 6; // Watchface Diameter = windowWidth / diaFactor; Smaller diaFactor makes the watchface bigger.
var watchYFactor = 0.45; // Watchface Y position = windowHeight * watchYFactor; Bigger watchYFactor makes the watchface vertical lower.
var scaleKFactor = 1; // ScaleK = windowWidth / scaleKFactor; Bigger scaleKFactor makes everything bigger.
var globalFontSize = 12; // font size of time
var lineWatchThicknessMin = 1; // the min thickness in line watch
var lineWatchThicknessMax = 2; // the max thickness in line watch
// END of tweak interface //////////////////////////////////////

var myLineWatch; //obj
var myBalanceWatch;
var bubbleWatchFace;
var previousSec = 0; // timer
var previousMin = 0; // timer
var myFont;

var bubbleWatchScale = 0;
var bubbleWatchTranslateX = 0;
var bubbleWatchTranslateY = 0;

function preload() {
  myFont = loadFont('assets/RobotoRegular.ttf');
}

function setup() {
  frameRate(30); // TOD0: CHANGE TO 30
  createCanvas(windowWidth, windowHeight);
  background(0);

  previousSec = second();
  previousMin = minute();

  myLineWatch = new LineWatch(true); //obj LineWatch(_thickness_vary)
  myBalanceWatch = new BalanceWatch(windowWidth, windowHeight); //obj BalanceWatch(_windowWidth, _windowHeight)

  // bubble watch setup //////////////
  var position = {
    position: 1,
    velocity: 2
  };

  bubbleWatchFace = new BubbleWatchFace({
    centerX: 350,
    centerY: 350,
    size: 680
  });

  bubbleWatchFace.bubblesNeeded = minute();
  //end of bubble watch setup////////////////////

  sizeChanged(); // init parameters with current size
}

function draw() {
  // update every hour


  // update every minute - dot watch
  var currentMin = minute();
  if (previousMin != currentMin) {
    bubbleWatchFace.bubblesNeeded++;
    if (bubbleWatchFace.bubblesNeeded >= 60) bubbleWatchFace.bubblesNeeded = 0;

    previousMin = currentMin;
  }

  // update every second - balance watch
  var currentSec = second();
  if (previousSec != currentSec) {
    var tempNightMode = basicUi(); // bg and top left text "current time"

    myLineWatch.updateMe(tempNightMode, minute()); //function(_nightMode, _min)
    myLineWatch.drawMe();

    myBalanceWatch.updateMe(tempNightMode, hour(), minute(), second()); //function(_nightMode, _myHour, _myMin, _mySec) 
    myBalanceWatch.drawMe();

    previousSec = currentSec;
  }

  // update every frame - bubble watch
  bubbleWatchFace.update();

  translate(bubbleWatchTranslateX, bubbleWatchTranslateY);
  scale(bubbleWatchScale);


  // applyMatrix(bubbleWatchMatrixA, 0, 0, bubbleWatchMatrixD, bubbleWatchMatrixE, bubbleWatchMatrixF); // a&d = scale; e&f = x&y offset
  bubbleWatchFace.draw();
  resetMatrix();

}

function mousePressed() {
  // change line thickness of line watch
  // myLineWatch.thickness_vary = !myLineWatch.thickness_vary;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sizeChanged();
}

function sizeChanged() {
  // update watch size and position
  var tempDia = windowWidth / diaFactor;
  var tempWatchY = windowHeight * watchYFactor;
  var tempScaleK = windowWidth / 1000 * scaleKFactor;

  myLineWatch.updateParameters(tempScaleK, tempDia, windowWidth * 3 / 14, tempWatchY, lineWatchThicknessMin, lineWatchThicknessMax); //function(_scaleK, _dia, _watchX, _watchY)
  myBalanceWatch.updateParameters(tempScaleK, tempDia, windowWidth / 2, tempWatchY, windowWidth, windowHeight); //function(_scaleK, _dia, _watchX, _watchY)

  bubbleWatchScale = tempDia / 680;
  bubbleWatchTranslateX = windowWidth * 11 / 14 - tempDia / 2;
  bubbleWatchTranslateY = tempWatchY - tempDia / 2;
}

function basicUi() {
  // night mode
  var temptH = hour();
  var returnValue = true; // only display night mode
  background(0);
  fill(255);
  // if (temptH > 6 && temptH < 18) { // daytime
  //   background(255);
  //   fill(0);
  //   returnValue = false;
  // } else { // nighttime
  //   background(0);
  //   fill(255);
  //   returnValue = true;
  // }

  // display time
  var tempScaleK = windowWidth / 1000 * scaleKFactor;
  textFont(myFont);
  textSize(globalFontSize * tempScaleK);
  textAlign(LEFT);
  var DisplayH = temptH % 12;
  DisplayH = ("0" + DisplayH).slice(-2);
  var DisplayM = ("0" + minute()).slice(-2);
  var DisplayS = ("0" + second()).slice(-2);
  fill(0x80);
  noStroke();
  text(DisplayH + ":" + DisplayM + ":" + DisplayS, ((windowWidth * 3 / 14) - (windowWidth / diaFactor / 2))/2, windowHeight-((windowHeight / 5)/2)-globalFontSize * tempScaleK);

  return returnValue;
}