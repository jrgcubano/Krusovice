/**
 * Wrapper around JSON exported Echo Nest Remix data
 *
 * Note that all clocks here are in milliseconds, not seconds
 * (start, duration).
 *
 */

/*global define,window,console*/

define("krusovice/rhythmanalysis", ["krusovice/thirdparty/jquery-bundle", "krusovice/core"], function($, krusovice) {
"use strict";

/**
 * A proxy object which helper functions to deal with rhytm data.
 *
 * @param data EchoNest rhytm data
 */
krusovice.RhythmAnalysis = function(data) {

	if(!data) {
		throw "Rhythm data must be given";
	}

	this.data = data;

};

krusovice.RhythmAnalysis.prototype = {

    /**
     * Scan through all beats and initialize boundaries.
     */
    initBeats : function() {

        // Search max confidence in beats
        var maxBeatConfidence = 0;

        this.data.beats.forEach(function(b) {
            if(b.confidence > maxBeatConfidence) {
                maxBeatConfidence = b.confidence;
            }
        });

        // How sure we must be about the beat to accept it

        if(maxBeatConfidence === 0) {
            // Echo Nest could not analyze confidence, but we still got beat list
            this.minBeatConfidence = 0;
        } else {
           // Use beats by arbitary value
           this.minBeatConfidence = 0.5;
        }

        console.log("Using default beat confidence threshold of " + this.minBeatConfidence);

    },

    /**
     * Find next beat from the array of all beats.
     *
     * @param clock Song position in seconds
     *
     * @param skip Skip rate. 1= every beat, 2 = every second beat
     *
     * @return AudioQuantum object
     */
    findNextBeat :function(clock, skip) {

        var beat = 0;

		var i = 0;

		clock *= 1000;

		var confidenceThreshold = this.minBeatConfidence;

		for(i=0; i<this.data.beats.length; i++) {
            var t = this.data.beats[i];
			if(t.confidence < confidenceThreshold) {
                continue;
            }

			if(t.start > clock) {
				beat = t;
				break;
			}

		}

        return beat;
    },

    /**
     * Find last beat from the array of all beats.
     *
     * @param clock Clock position
     *
     * @param skip Skip rate. 1= every beat, 2 = every second beat
     *
     * @return AudioQuantum object
     */
    findLastBeat :function(clock, skip, confidence) {

        var beat = null;

        var beats = this.data.beats;

		var confidenceThreshold = confidence || this.minBeatConfidence;

        var i;
        for(i=0; i<beats.length;i++) {
            var t = beats[i];

            if(t.confidence < confidenceThreshold) {
                continue;
            }

            if(t.start > clock) {
                break;
            }

            beat = t;
        }

        return beat;
    },


    /**
     * Generic AudioQuantum array search
     *
     * @param {Object} array
     * @param {Object} name
     * @param {Object} clock
     * @param {Object} skip
     * @param {Object} confidence
     */
    findLast: function(array, clock, skip, confidenceThreshold) {

        var item = null;

        var i;
        for(i=0; i<array.length;i++) {

		    var t = array[i];

            if(t.confidence < confidenceThreshold) {
                continue;
            }

            if(t.start > clock) {
                break;
            }

            item = t;
        }

        return item;
    },



    /**
     * Extrapolate beat intensivity as linear function.
     *
     *  Like this:
     *
     *  |\
     *  |  \
     *  |    \
     *  |     \.........[window]
     *
     *
     * @param {Object} clock animation time in ms
     * @param {Object} window 0.... 100% beat intensivity in ms
     */
     extrapolateBeatIntensivity : function(clock, window, skip) {

        var beat = this.findLastBeat(clock, skip);

		if(!beat) {
			return 0;
		}

        var distance = clock - beat.start;

        // -1 ... 1 intensivity within beat window
        var normalized = (window-distance) / window;

        // console.log("Clock:" + clock + " beat:" + beat + " window:" + window + " skip:" + skip + " distance:" + distance);

        return normalized;

    },


    /**
     * Return bar at a chosen moment.
     *
     * @param {Number} clock Time in seconds
     *
     * @return bar index or -1 if no hit
     */
    findBarAtClock : function(clock) {
        var i;
        var bars = this.data.bars;

        // Convert to ms
        clock *= 1000;

        for(i=0; i<bars.length; i++) {
            var b = bars[i];

            if(clock >= b.start && clock < b.start+b.duration) {
                return i;
            }
        }

        return -1;
    },

}

});
