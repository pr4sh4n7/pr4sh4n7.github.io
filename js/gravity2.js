/* rendering of the babel file */

"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Simulation =
/*#__PURE__*/
function () {
  function Simulation(el) {
    _classCallCheck(this, Simulation);

    if (_instanceof(el, HTMLElement) && el.nodeName.toLowerCase() === 'canvas') {
      this.el = el;
      this.ctx = el.getContext('2d');
      this.bodies = [];
      this.run = this.run.bind(this);
    } else {
      return null;
    }
  }

  _createClass(Simulation, [{
    key: "addBody",
    value: function addBody(body) {
      if (_instanceof(body, Body)) {
        body.yearsPerFrame = this.yearsPerFrame;
        body.dimensions = this.pxdimensions;
        this.bodies.push(body);
      }

      return this.bodies.length - 1;
    }
  }, {
    key: "removeBody",
    value: function removeBody(i) {
      this.bodies.splice(i, 1);
    }
  }, {
    key: "update",
    value: function update() {
      var _this = this;

      // Set up the canvas for drawing
      this.ctx.fillStyle = "rgba(20,20,20,.9)"; // this.ctx.clearRect(0,0,this.el.width,this.el.height);

      this.ctx.fillRect(0, 0, this.el.width, this.el.height);
      this.ctx.translate(this.pxdimensions.width * .5, this.pxdimensions.height * .5);
      var lineThreshold = 20000; // Loop through all of the bodies

      this.bodies.forEach(function (bodyX) {
        var acceleration = new Vector(0, 0); // This is our basal, new acceleration for this body
        // For all the other bodies, calculate the combined force asserted on this

        _this.bodies.forEach(function (bodyY) {
          var distance = bodyY.position.subtractNew(bodyX.position); // The distance between the two bodies

          var sqD = distance.lengthSquared; // The distance squared (cheaper than calculating actual distance, see: Pythagoras)

          var force = _this.gravitationalConstant * bodyY.mass / (sqD * Math.sqrt(sqD * _this.smoothing)); // Here's some newtonian motion with a some softening to stop it from reaching infinity

          acceleration.add(distance.scale(force));

          if (sqD < lineThreshold) {
            _this.ctx.beginPath();

            _this.ctx.strokeStyle = "rgba(255,255,255,".concat((lineThreshold - sqD) / lineThreshold * .5, ")");
            _this.ctx.lineWidth = 0;

            _this.ctx.moveTo(bodyX.position.x, bodyX.position.y);

            _this.ctx.lineTo(bodyY.position.x, bodyY.position.y);

            _this.ctx.stroke();
          }
        }); // Update the basal body's accelaration with the calucalted factor


        bodyX.acceleration = acceleration; // Draw the body

        _this.ctx.beginPath();

        _this.ctx.fillStyle = "rgba(255,255,255,1)";

        _this.ctx.arc(bodyX.position.x, bodyX.position.y, bodyX.size, 0, 2 * Math.PI);

        _this.ctx.fill(); // Solve for the next frame


        bodyX.solve();
      }); // Reset current transformation matrix to the identity matrix

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }, {
    key: "run",
    value: function run(delta) {
      if (this.running === true) {
        requestAnimationFrame(this.run);
      }

      this.update();
    }
  }, {
    key: "running",
    set: function set(value) {
      if (this.running === false && value === true) requestAnimationFrame(this.run);
      this._running = value === true;
    },
    get: function get() {
      return this._running === true;
    }
  }, {
    key: "pxratio",
    set: function set(value) {
      if (!isNaN(value)) {
        this._pxratio = value;
      }
    },
    get: function get() {
      return this._pxratio || 1;
    }
  }, {
    key: "dimensions",
    set: function set(value) {
      if (_instanceof(value, Vector)) {
        this._dimensions = value;
        this._pxdimensions = value.scale(this.pxratio);
        this.el.width = this._pxdimensions.width;
        this.el.height = this._pxdimensions.height; // Set up the canvas for drawing

        this.ctx.fillStyle = "rgba(20,20,20,1)"; // this.ctx.clearRect(0,0,this.el.width,this.el.height);

        this.ctx.fillRect(0, 0, this.el.width, this.el.height);
      }
    },
    get: function get() {
      return this._dimensions || new Vector(this.el.width / this.pxratio, this.el.height / this.pxratio);
    }
  }, {
    key: "pxdimensions",
    get: function get() {
      return this._pxdimensions || new Vector(this.el.width, this.el.height);
    }
  }, {
    key: "gravitationalConstant",
    set: function set(value) {
      if (!isNaN(value)) this._gravitationalConstant = value;
    },
    get: function get() {
      return this._gravitationalConstant || 40;
    }
  }, {
    key: "smoothing",
    set: function set(value) {
      if (!isNaN(value)) this._smoothing = value;
    },
    get: function get() {
      return this._smoothing || .5;
    }
  }, {
    key: "yearsPerFrame",
    set: function set(value) {
      if (!isNaN(value)) this._yearsPerFrame = value;
    },
    get: function get() {
      return this._yearsPerFrame || .2;
    }
  }]);

  return Simulation;
}();

var Body =
/*#__PURE__*/
function () {
  function Body(position, velocity, mass, size) {
    var fixed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    _classCallCheck(this, Body);

    this.position = position;
    this.velocity = velocity;
    this.acceleration = new Vector(0, 0);
    this.mass = mass;
    this.size = size;
    this.fixed = fixed;
  }

  _createClass(Body, [{
    key: "solve",
    value: function solve() {
      if (this.fixed) return; // console.log(this.acceleration)

      var vel = this.velocity.addNew(this.acceleration.scaleNew(this.yearsPerFrame));
      this.velocity = vel;
      this.position.add(this.velocity.scaleNew(this.yearsPerFrame));

      if (this.position.x > this.dimensions.x * .5 + 30.) {
        this.position.x = this.dimensions.x * -.5 - 10.;
      } else if (this.position.x < this.dimensions.x * -.5 - 30.) {
        this.position.x = this.dimensions.x * .5 + 10.;
      }

      if (this.position.y > this.dimensions.y * .5 + 30.) {
        this.position.y = this.dimensions.y * -.5 - 10.;
      } else if (this.position.y < this.dimensions.y * -.5 - 30.) {
        this.position.y = this.dimensions.y * .5 + 10.;
      }
    }
  }, {
    key: "fixed",
    set: function set(value) {
      this._fixed = value === true;
    },
    get: function get() {
      return this._fixed === true;
    }
  }, {
    key: "position",
    set: function set(value) {
      if (_instanceof(value, Vector)) {
        this._position = value;
      }
    },
    get: function get() {
      return this._position || null;
    }
  }, {
    key: "friction",
    set: function set(value) {
      if (!isNaN(value)) {
        this._friction = value;
      }
    },
    get: function get() {
      return this._friction || .99;
    }
  }, {
    key: "maxVelocity",
    set: function set(value) {
      if (!isNaN(value)) {
        this._maxVelocity = value;
      }
    },
    get: function get() {
      return this._maxVelocity || 50.;
    }
  }, {
    key: "velocity",
    set: function set(value) {
      if (_instanceof(value, Vector)) {
        if (value.length > this.maxVelocity) value.normalise().scale(this.maxVelocity);
        value.scale(this.friction);
        this._velocity = value;
      }
    },
    get: function get() {
      return this._velocity || null;
    }
  }, {
    key: "acceleration",
    set: function set(value) {
      if (_instanceof(value, Vector)) {
        this._acceleration = value;
      }
    },
    get: function get() {
      return this._acceleration || null;
    }
  }, {
    key: "mass",
    set: function set(value) {
      if (!isNaN(value)) {
        this._mass = value;
      }
    },
    get: function get() {
      return this._mass || 0;
    }
  }, {
    key: "size",
    set: function set(value) {
      if (!isNaN(value)) {
        this._size = value;
      }
    },
    get: function get() {
      return this._size || 0;
    }
  }, {
    key: "yearsPerFrame",
    set: function set(value) {
      if (!isNaN(value)) this._yearsPerFrame = value;
    },
    get: function get() {
      return this._yearsPerFrame || .008;
    }
  }]);

  return Body;
}();

console.clear();
var sim = new Simulation(document.querySelector('canvas'));
sim.dimensions = new Vector(window.innerWidth, window.innerHeight);
window.addEventListener('resize', function (e) {
  sim.dimensions = new Vector(window.innerWidth, window.innerHeight);
});
var mouseBody = new Body(new Vector(0, 0), new Vector(0, 0), -1000, 50, true);
var bodyIndex = null;
window.addEventListener('pointerdown', function (e) {
  mouseBody.position.x = e.pageX - window.innerWidth * .5;
  mouseBody.position.y = e.pageY - window.innerHeight * .5;
  console.log(mouseBody.position);
  bodyIndex = sim.addBody(mouseBody);
});
window.addEventListener('pointermove', function (e) {
  mouseBody.position.x = e.pageX - window.innerWidth * .5;
  mouseBody.position.y = e.pageY - window.innerHeight * .5;
});
window.addEventListener('pointerup', function (e) {
  sim.removeBody(bodyIndex);
  bodyIndex = null;
}); // sim.addBody(new Body(new Vector(0, 0), new Vector(0,0), -3, 50, true));
// sim.addBody(new Body(new Vector(0, 500), new Vector(0,0), 1, 10, true));

for (i = 0; i < 100; i++) {
  var r = new Vector(200 + Math.random() * 200, Math.random() * Math.PI * 2.);
  var p = new Vector(Math.cos(r.y) * r.x, Math.sin(r.y) * r.x);
  var a = new Vector(p.y, -p.x).normalise().scale(10.); // const a = new Vector(0,0);

  var rf = Math.random();
  sim.addBody(new Body(p, a, -10 + rf * 15., 1 + rf * 10)); // sim.addBody(new Body(p, a, .5 + rf * .5, 5 + rf * 5.));
}

sim.running = true;
