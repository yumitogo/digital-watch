// balance watch obj
function BalanceWatch(_windowWidth, _windowHeight) {
  var myHour, myMin, mySec, nightMode, current_radians, delta_radians, accum_sec; // update every frame
  var scaleK, dia, watchX, watchY, x0, y0, diaText, myWindowWidth, myWindowHeight; // update when resize window
  myWindowWidth = _windowWidth;
  myWindowHeight = _windowHeight;

  // won't update
  var myFontSize = globalFontSize;
  var myFontSizeToTop = myFontSize*0.3; // myFontSize * 0.3
  var myFontSizeToBtm = myFontSize*0.6; // myFontSize * 0.5
  var calculate_pos_fisttime = true;
  var sec_begin = 12 * 60 * 60 + 12 * 60; // 12:12:00
  var sec_end = 1 * 60 * 60 + 1 * 60; // 1:01:00
  var delta_radians1 = TWO_PI / (122 * 60);
  var delta_radians2 = PI / (48 * 60 + 58);

  var pg = createGraphics(_windowWidth, _windowHeight);

  this.updateParameters = function(_scaleK, _dia, _watchX, _watchY, _newWindowWidth, _newWindowHeight) {
    scaleK = _scaleK;
    dia = _dia;
    watchX = _watchX;
    watchY = _watchY;
    myWindowWidth = _newWindowWidth;
    myWindowHeight = _newWindowHeight;

    x0 = watchX;
    y0 = watchY;
    diaText = dia * 0.8;
    
    pg.resizeCanvas(myWindowWidth, myWindowHeight);
  }

  this.updateMe = function(_nightMode, _myHour, _myMin, _mySec) {
    nightMode = _nightMode;
    myHour = _myHour % 12; // change from 0-23 to 1-12
    myMin = _myMin;
    mySec = _mySec;

    accum_sec = myHour * 60 * 60 + myMin * 60 + mySec;

    if (accum_sec > sec_begin || accum_sec < sec_end) { //12:12 - 1:01
      delta_radians = delta_radians2;
    } else {
      delta_radians = delta_radians1;
    }

    // calculate initial position
    if (calculate_pos_fisttime) {
      if (accum_sec > sec_begin) { //12:12 - 12:59:59
        current_radians = (accum_sec - sec_begin) * delta_radians2 + PI;
      } else if (accum_sec < sec_end) { // 1:00-1:00:59
        current_radians = (accum_sec - sec_end) * delta_radians2;
      } else {
        current_radians = (accum_sec - sec_end) * delta_radians1;
      }
      calculate_pos_fisttime = false;
    } else { // cultulate position after first time
      current_radians = current_radians + delta_radians;
    }

    if (myHour === myMin && mySec === 0) { //balence time Hour = Min
      if (myHour % 2 === 0) { // 180 degree
        current_radians = PI;
      } else { //0 degree
        current_radians = 0;
      }
    }
  }

  this.drawMe = function() {
    // daytime and nighttime
    if (nightMode === true) {
      fill(255);
    } else {
      fill(0);
    }

    // draw watchface
    noStroke();
    ellipse(watchX, watchY, dia);

    // draw blue arc
    noStroke();
    fill(0, 0, 255);
    arc(x0, y0, dia, dia, (current_radians - PI), current_radians, PIE);

    // text is alway on white part
    // calculate text position on pgraphic
    var calculatedHourMinCoord = calculatePG(current_radians, dia / 2, diaText / 2);

    if (nightMode) {
      fill(0);
    } else {
      fill(255);
    }
    textFont(myFont);
    var textSizeTempt = myFontSize * scaleK;
    textSize(textSizeTempt);
    textAlign(CENTER, CENTER);
    text(myHour, calculatedHourMinCoord[0], calculatedHourMinCoord[1]);
    text(myMin, calculatedHourMinCoord[2], calculatedHourMinCoord[3]);

    // for debug !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // image(pg, 0, 0);
  }

  function calculatePG(_to_radians, _r, _r_text) {
    var to_radians = _to_radians;
    var r = _r;
    var r_text = _r_text;

    var mbx1, mby1, mbx2, mby2; // min box border
    var hbx1, hby1, hbx2, hby2; // hour box border
    var linex1, liney1, linex2, liney2; // line (x1, y1, x2, y2)
    var hourMinCoord = [0.0, 0.0, 0.0, 0.0]; // (hourX, hourY, minX, minY) replace previous: hour(x3, y3) min (x4, y4)

    // min and hour offset
    var moffset = createVector(1000.0*scaleK, 1000.0*scaleK, 1000.0*scaleK);
    var mnew_offset = createVector(1000.0*scaleK, 1000.0*scaleK, 1000.0*scaleK);
    var hoffset = createVector(1000.0*scaleK, 1000.0*scaleK, 1000.0*scaleK);
    var hnew_offset = createVector(1000.0*scaleK, 1000.0*scaleK, 1000.0*scaleK);

    // min and hour nearest distance
    var mnear_x = 0.0;
    var mnear_y = 0.0;
    var hnear_x = 0.0;
    var hnear_y = 0.0;

    pg.background(20, 0, 0);

    // line (x1, y1, x2, y2)
    linex1 = x0 + cos(to_radians) * r;
    liney1 = y0 + sin(to_radians) * r;
    linex2 = x0 - cos(to_radians) * r;
    liney2 = y0 - sin(to_radians) * r;

    // min (x4, y4) hour(x3, y3)
    hourMinCoord[0] = x0 + cos(to_radians + PI / 15) * r_text;
    hourMinCoord[1] = y0 + sin(to_radians + PI / 15) * r_text;
    hourMinCoord[2] = x0 - cos(to_radians - PI / 15) * r_text;
    hourMinCoord[3] = y0 - sin(to_radians - PI / 15) * r_text;

    // line
    pg.fill(255, 0, 0);
    pg.noStroke();
    pg.arc(x0, y0, r * 2, r * 2, (to_radians - PI), to_radians, PIE);

    // text
    var textSizeTempt = myFontSize * scaleK;
    pg.textFont(myFont, textSizeTempt);
    pg.textAlign(CENTER, CENTER);
    pg.fill(0, 255, 0);
    pg.text(myHour, hourMinCoord[0], hourMinCoord[1]);
    pg.text(myMin, hourMinCoord[2], hourMinCoord[3]);

    // box of the text
    var hcw = int(pg.textWidth(str(myHour)));
    var mcw = int(pg.textWidth(str(myMin)));
    hbx1 = int(hourMinCoord[0] - hcw / 2);
    hby1 = int(hourMinCoord[1] - myFontSizeToTop * scaleK);
    hbx2 = int(hourMinCoord[0] + hcw / 2);
    hby2 = int(hourMinCoord[1] + myFontSizeToBtm * scaleK);
    mbx1 = int(hourMinCoord[2] - mcw / 2);
    mby1 = int(hourMinCoord[3] - myFontSizeToTop * scaleK);
    mbx2 = int(hourMinCoord[2] + mcw / 2);
    mby2 = int(hourMinCoord[3] + myFontSizeToBtm * scaleK);

    // debug !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // pg.rectMode(CORNERS);
    // pg.noFill();
    // pg.stroke(100);
    // pg.strokeWeight(1);
    // pg.rect(hbx1, hby1, hbx2, hby2);
    // pg.stroke(100);
    // pg.rect(mbx1, mby1, mbx2, mby2);

    // get a image of current pg
    pg.loadPixels();
    var d = pixelDensity();

    // get every pixel color for min
    for (var i = mbx1; i < mbx2; i++) {
      for (var j = mby1; j < mby2; j++) {
        for (var k = 0; k < d; k++) {
          for (var l = 0; l < d; l++) {
            // loop over
            var idx = 4 * ((j * d + l) * width * d + (i * d + k));
            var myGreen = pg.pixels[idx + 1]; //green()
            // if it's a green pixel
            if (myGreen > 200) {
              // calculate the dist
              mnew_offset = getDistance(linex1, liney1, linex2, liney2, i, j);
              //println("new_offset ", new_offset.z, "---offset", offset.z);

              // if the dist is smaller than saved one, replace it
              if (mnew_offset.z <= moffset.z) {
                moffset = mnew_offset.copy();
                mnear_x = i;
                mnear_y = j;
                //println(i, j);
              }
            }
          }
        }
      }
    }

    // get every pixel color for hour
    for (var m = hbx1; m < hbx2; m++) {
      for (var n = hby1; n < hby2; n++) {
        for (var o = 0; o < d; o++) {
          for (var p = 0; p < d; p++) {
            // loop over
            var idx = 4 * ((n * d + p) * width * d + (m * d + o));
            var myGreen = pg.pixels[idx + 1]; //green()
            // if it's a green pixel
            if (myGreen > 200) {
              // calculate the dist
              hnew_offset = getDistance(linex1, liney1, linex2, liney2, m, n);
              //println("new_offset ", new_offset.z, "---offset", offset.z);

              // if the dist is smaller than saved one, replace it
              if (hnew_offset.z <= hoffset.z) {
                hoffset = hnew_offset.copy();
                hnear_x = m;
                hnear_y = n;
                //println(m, n);
              }
            }
          }
        }
      }
    }

    hourMinCoord[0] = hourMinCoord[0] + (hoffset.x - hnear_x);
    hourMinCoord[1] = hourMinCoord[1] + (hoffset.y - hnear_y);
    hourMinCoord[2] = hourMinCoord[2] + (moffset.x - mnear_x);
    hourMinCoord[3] = hourMinCoord[3] + (moffset.y - mnear_y);

    return hourMinCoord;
  }

  function getDistance(lx1, ly1, lx2, ly2, dotx, doty) {
    var result = createVector(0.0, 0.0, 0.0);
    var my_return = createVector(0.0, 0.0);
    var dx, dy, d, ca, sa, mx, dx2, dy2;

    dx = lx2 - lx1;
    dy = ly2 - ly1;
    d = sqrt(dx * dx + dy * dy);
    ca = dx / d; // cosine
    sa = dy / d; // sine

    mx = (-lx1 + dotx) * ca + (-ly1 + doty) * sa;

    if (mx <= 0) {
      result.x = lx1;
      result.y = ly1;
    } else if (mx >= d) {
      result.x = lx2;
      result.y = ly2;
    } else {
      result.x = lx1 + mx * ca;
      result.y = ly1 + mx * sa;
    }

    dx2 = dotx - result.x;
    dy2 = doty - result.y;
    my_return.x = dx2;
    my_return.y = dy2;
    result.z = sqrt(dx2 * dx2 + dy2 * dy2);

    return result;
  }

}