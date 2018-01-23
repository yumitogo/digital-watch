// line watch obj
function LineWatch(_thickness_vary) {
  this.thickness_vary = _thickness_vary; // update when press btn
  var myMin, nightMode; // update every frame
  var scaleK, dia, watchX, watchY, thickness_begin, thickness_end, lineDist, lineWatchThicknessMin, lineWatchThicknessMax; // update when resize window

  this.updateParameters = function(_scaleK, _dia, _watchX, _watchY, _lineWatchThicknessMin, _lineWatchThicknessMax) {
    scaleK = _scaleK;
    dia = _dia;
    watchX = _watchX;
    watchY = _watchY;
    lineWatchThicknessMin = _lineWatchThicknessMin;
    lineWatchThicknessMax = _lineWatchThicknessMax;

    thickness_begin = lineWatchThicknessMin * scaleK;
    thickness_end = lineWatchThicknessMax * scaleK;
    lineDist = _dia / 60.0;
  }

  this.updateMe = function(_nightMode, _min) {
    nightMode = _nightMode;
    myMin = _min;
  }

  this.drawMe = function() {
    // daytime and nighttime
    if (nightMode === true) {
      fill(255);
      stroke(0);
    } else {
      fill(0);
      stroke(255);
    }

    // draw watchface
    strokeWeight(0);
    ellipse(watchX, watchY, dia);

    // draw lines
    for (var i = 0; i < myMin; i++) {
      if (this.thickness_vary) {
        var thickness = (thickness_end - thickness_begin) / 60.0 * i * scaleK;
        strokeWeight(thickness);
      } else {
        strokeWeight(thickness_begin);
      }

      var x0 = watchX - dia / 2.0;
      var y0 = watchY + dia / 2.0 - lineDist * (i + 1);
      var x1 = watchX + dia / 2.0;
      var y1 = y0;
      line(x0, y0, x1, y1);
    }
  }
}