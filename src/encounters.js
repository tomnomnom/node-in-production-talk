var baudio = require('baudio');

var intervalFreq = function(root, steps){
  var a = Math.pow(2, 1/12);
  return root * Math.pow(a, steps);
};

var sumOscs = function(oscs){
  return function(t){
    var total = 0;
    for (var i in oscs){
      total += oscs[i](t);
    }
    return total / oscs.length;
  };
};

var sineOsc = function(freq){
  return function(t){
    var x = Math.sin(t * Math.PI * 2 * freq);
    return x;
  };
};

var squareOsc = function(freq, precision){
  precision = precision || 10;
  var oscs = [];
  for (var i = 0; i < precision*2; i += 2){
    oscs.push(sineOsc(freq * i));
  }
  return sumOscs(oscs);
};

var dist = function(osc){
  return function(t){
    var level = osc(t);
    if (level > 0.7) return 0.7;
    if (level < 0.3) return 0.3;
    return level;
  };
};

var randomNoise = function(){
  return Math.random();
};

var vol = function(osc, level){
  return function(t){
    return osc(t) * level;
  };
};

var ringModulator = function(osc, freq){
  return function(t){
    return osc(t) * Math.sin(t * Math.PI * 2 * freq);
  };
};

var sequence = function(beats){
  return function(t){
    var beat = parseInt((t/beatDuration), 10);
    if (beats[beat] != undefined){
      return beats[beat](t);
    }
    return 0;
  };
};

var note = function(osc, duration, attack, decay){
  return (function(){
    var state = {
      start: 0
    };
    return function(t){
      if (state.start == 0){
        state.start = t;
      }
      var currentTime = t - state.start;
      var vol = 1;
      
      // Attack
      if (currentTime < attack){
        if (attack > 0){
          vol = (t - state.start) / attack;
        }
        if (vol > 1){
          vol = 1;
        }
      }

      // Decay
      if (currentTime > (duration - decay)){
        var endTime = state.start + duration;
        if (decay > 0){
          vol = (endTime - t) / decay;
        }
        if (vol < 0.0001){
          vol = 0;
        }
      }

      // Reset
      if (currentTime > (duration + attack + decay)){
        state.start = 0;
      }
      
      return osc(t) * vol;
    };
  })();
};

var BPM = 120;
var beatDuration = 60/BPM;

var quarter = beatDuration / 4;
var semi = beatDuration / 2;
var whole = beatDuration;

var F0  = ringModulator(squareOsc(intervalFreq(440, -4)), 10);
var G0b = ringModulator(squareOsc(intervalFreq(440, -3)), 10);
var G0  = ringModulator(squareOsc(intervalFreq(440, -2)), 10);
var A0b = ringModulator(squareOsc(intervalFreq(440, -1)), 10);
var A1  = ringModulator(squareOsc(intervalFreq(440, 0)),  10);
var B1b = ringModulator(squareOsc(intervalFreq(440, 1)),  10);
var B1  = ringModulator(squareOsc(intervalFreq(440, 2)),  10);
var C1  = ringModulator(squareOsc(intervalFreq(440, 3)),  10);
var D1b = ringModulator(squareOsc(intervalFreq(440, 4)),  10);
var D1  = ringModulator(squareOsc(intervalFreq(440, 5)),  10);
var E1b = ringModulator(squareOsc(intervalFreq(440, 6)),  10);
var E1  = ringModulator(squareOsc(intervalFreq(440, 7)),  10);
var F1  = ringModulator(squareOsc(intervalFreq(440, 8)),  10);
var G1b = ringModulator(squareOsc(intervalFreq(440, 9)),  10);
var G1  = ringModulator(squareOsc(intervalFreq(440, 10)), 10);
var A1b = ringModulator(squareOsc(intervalFreq(440, 11)), 10);
var A2  = ringModulator(squareOsc(intervalFreq(440, 12)), 10);


var encounters = sequence([
  G1, A2, F1, F0, C1
]);


var b = baudio(function(t){
  return encounters(t);
});


b.play();
