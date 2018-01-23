function Bubble(options) {
  this.position = options.position;
  this.velocity = options.velocity;
  this.size = options.size;
  this.targetSize = this.size;
  this.sizeChanging = false;
  this.changeRate = 0;
  this.force = createVector(0, 0);
  this.massInv = 5; // smaller num = less mass
  this.gravity = 0.5; // larger num = more gravity
  this.friction = 0.1; // larger num = more friction

  this.applyCenterGravity = function(centerX, centerY) {
    this.force.x = (centerX - this.position.x) * this.gravity;
    this.force.y = (centerY - this.position.y) * this.gravity;
  }

  this.updateSpeedPosition = function(lapsedTime) {
    this.force.x -= this.velocity.x * this.friction;
    this.force.y -= this.velocity.y * this.friction;

    this.velocity.x += this.force.x * this.massInv * lapsedTime;
    this.velocity.y += this.force.y * this.massInv * lapsedTime;

    this.position.x += this.velocity.x * lapsedTime;
    this.position.y += this.velocity.y * lapsedTime;
  }

  this.updateSize = function() {
    if (this.sizeChanging) {
      this.size += this.changeRate;
      if (this.changeRate > 0) {
        if (this.size >= this.targetSize) {
          this.size = this.targetSize;
          this.sizeChanging = false;
        }
      } else {
        if (this.size <= this.targetSize) {
          this.size = this.targetSize;
          this.sizeChanging = false;
        }
      }
    }
  }

  this.changeSize = function(finalSize, changeSteps) {
    this.sizeChanging = true;
    this.targetSize = finalSize;
    this.changeRate = (this.targetSize - this.size) / changeSteps;
  }

}

var bornR = [120, 120, 66, 50, 30, 26, 70, 40, 20, 40, 30, 60, 70, 20, 30, 60, 70, 40, 20, 40, 30, 60, 70, 20, 30, 60, 70, 40, 20, 30, 30, 50, 40, 20, 30, 60, 30, 40, 20, 40, 30, 60, 70, 20, 30, 60, 70, 40, 20, 40, 30, 60, 70, 20, 30, 60, 70, 40, 20, 20, ];
var setminR = [70, 50, 30, 20, 14, 16, 45, 33, 13, 20, 20, 36, 30, 20, 14, 8, 55, 33, 13, 20, 20, 42, 30, 20, 14, 8, 35, 33, 13, 20, 20, 40, 30, 20, 14, 8, 55, 33, 13, 20, 20, 50, 30, 20, 14, 8, 35, 33, 13, 20, 20, 45, 30, 20, 14, 8, 55, 33, 13, 20, ];


function BubbleWatchFace(options) {
  this.center = createVector(options.centerX, options.centerY);
  this.size = options.size;

  this._bubbles = [];

  this._updateStepMillis = 10;
  this._lastUpdate = Date.now();

  this.bubblesNeeded = 0;

  this.isTwoBubblesCollides = function(pos1, size1, pos2, size2) {
    distX = pos1.x - pos2.x;
    distY = pos1.y - pos2.y;
    radiusSum = (size1 + size2) / 2;
    return ((distX * distX + distY * distY) <= (radiusSum * radiusSum));
  }

  this.isBubbleTouchingBoundary = function(pos1, size1) {
    distX = pos1.x - this.center.x;
    distY = pos1.y - this.center.y;
    radiusSum = (this.size - size1) / 2;
    return ((distX * distX + distY * distY) >= (radiusSum * radiusSum));
  }

  this.spawn = function(_size, _variation) {
    //find and empty space to hold bubble, try 100 times
    for (i = 0; i < 100; i++) {
      watchDia = this.size / 2;
      x = random(-_variation, _variation);
      y = random(-_variation, _variation);

      if ((x * x + y * y) < (watchDia * watchDia)) { //is random postion within watch?
        //check all existing bubbles
        var positionOccupied = false;
        x += this.center.x;
        y += this.center.y;
        var postionVec = createVector(x, y);
        for (var bubble of this._bubbles) {
          if (this.isTwoBubblesCollides(postionVec, _size, bubble.position, bubble.size)) {
            positionOccupied = true;
            break;
          }
        }
        if (positionOccupied === false) {
          bubble = new Bubble({
            position: postionVec,
            velocity: createVector(0, 0),
            size: _size,
          });
          this._bubbles.push(bubble);
          return bubble;
        }
      }
    }
    return null;
  }

  this.draw = function() {
    noStroke();
    fill(255);
    ellipse(this.center.x, this.center.y, this.size, this.size);
    fill(0);
    for (var bubble of this._bubbles) {
      ellipse(bubble.position.x, bubble.position.y, bubble.size, bubble.size);
    }

  }


  this.update = function() {

    if (this.bubblesNeeded > this._bubbles.length) {
      var newBubble = bubbleWatchFace.spawn(1, 100);
      if (newBubble) {
        newBubble.changeSize(bornR[this._bubbles.length - 1] * 2, 50); // small number = change faster
        allBubbleSize = 0;
        for (var bubble of this._bubbles) {
          bubbleSize = bubble.targetSize;
          allBubbleSize += bubbleSize * bubbleSize/4;
        }
        watchSize = this.size * this.size/4;
        if ((allBubbleSize / (watchSize)) > 0.65) {
          for (i = 0; i < this._bubbles.length; ++i) {
            bubble = this._bubbles[i];
            var bubbleNewSize = bubble.targetSize * 0.9;
            if (bubbleNewSize < (setminR[i] * 2)) bubbleNewSize = (setminR[i] * 2)
            bubble.changeSize(bubbleNewSize, 50); // small number = change faster
          }
        }
      }
    }
    while (this.bubblesNeeded < this._bubbles.length) {
      this._bubbles.shift();
    }

    const now = Date.now();
    var deltaMillis = now - this._lastUpdate;
    while (deltaMillis > this._updateStepMillis) {
      this._updateSingleStep();
      deltaMillis -= this._updateStepMillis;
    }
    this._lastUpdate = now - deltaMillis;
  }

  this._updateSingleStep = function() {
    const updateStepSeconds = this._updateStepMillis / 1000;
    for (var bubble of this._bubbles) {
      bubble.updateSize();
      bubble.applyCenterGravity(this.center.x, this.center.y)
    }




    // Naive collision detection and resolution among bubbles within O(N^2) time.
    for (i = 0; i < this._bubbles.length - 1; ++i) {
      const bubble1 = this._bubbles[i];
      for (j = i + 1; j < this._bubbles.length; ++j) {
        const bubble2 = this._bubbles[j];
        if (this.isTwoBubblesCollides(bubble1.position, bubble1.size, bubble2.position, bubble2.size)) {
          // Collision resolution assuming same mass, exchanging velocity components.
          // This requires the use of constant time step size.
          positionVec = bubble1.position.copy();
          positionVec.sub(bubble2.position);
          distance = positionVec.mag();
          squeeze = (bubble1.size + bubble2.size) / 2 - distance;
          velocityVec = bubble2.velocity.copy();
          velocityVec.sub(bubble1.velocity);
          contactDirection = velocityVec.dot(positionVec); //positive compress, negetive release 
          //now use positionVec as force vector
          positionVec.setMag(500 * squeeze * (contactDirection >= 0 ? 1 : 0.3)); //when release, use less force to simulate energy dissapation
          bubble1.force.add(positionVec);
          bubble2.force.sub(positionVec);

        }
      }
    }

    for (var bubble of this._bubbles) {
      if (this.isBubbleTouchingBoundary(bubble.position, bubble.size)) {
        positionVec = bubble.position.copy();
        positionVec.sub(this.center);
        distance = positionVec.mag();
        squeeze = distance + (bubble.size - this.size) / 2;
        velocityVec = bubble.velocity.copy();
        contactDirection = velocityVec.dot(positionVec); //positive compress, negetive release 
        positionVec.setMag(500 * squeeze * (contactDirection >= 0 ? 1 : 0.3)); //when release, use less force to simulate energy dissapation
        bubble.force.sub(positionVec);
      }
    }


    for (var bubble of this._bubbles) {
      bubble.updateSpeedPosition(updateStepSeconds)
    }
  }

  _hasCollisionBetween = function(position1, position2) {
    if (position1 instanceof Bubble) {
      position1 = position1.position;
    }
    if (position2 instanceof Bubble) {
      position2 = position2.position;
    }
    const distance = Two.Utils.distanceBetween(position1, position2);
    // Allow overlap if too close, useful when size/speed changed.
    const ignoreCollisionDistance = 2 * this.velocityScale * this._updateStepMillis / 1000;
    return distance <= 2 * this.sizeScale && distance > ignoreCollisionDistance;
  }

  setLastUpdateToNow = function() {
    this._lastUpdate = Date.now();
  }
}