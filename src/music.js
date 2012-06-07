/*global define, window, console, jQuery, document, setTimeout */

define("krusovice/music", ["krusovice/thirdparty/jquery-bundle", "krusovice/core", "krusovice/utils"], function($, krusovice, utils) {
"use strict";

krusovice.music = krusovice.music || {};

krusovice.music.Registry = $.extend(true, {}, utils.Registry, {

    /**
     * Load loudness .json data generated by levels.py.
     * @type {Boolean}
     */
    useLevelData : false,

    /**
     * Load music data from JSON file
     *
     * @param {String} url URL to songs.json
     *
     * @param {String} mediaURL Base URL to image and video data
     */
    loadData : function(url, mediaURL, callback, errorCallback) {
        var self = this;

        console.log("Loading song data bank:" + url);

        var dfd = $.getJSON(url, function(data) {
            console.log("Got song data");
            console.log(data);
            self.processData(data, mediaURL);
            callback();
        });

        dfd.error(function() {
            console.error("Bad music db:" + url);
            errorCallback();
        });

    },


    /**
     * Decode song aritist info and media URLs to internal format.
     */
    processData : function(data, mediaURL) {
        var self = this;

        data.forEach(function(obj) {
            self.fixMediaURLs(obj, mediaURL);
            self.register(obj);
        });
    },

    /**
     * Make image URLs loadable
     */
    fixMediaURLs : function(obj, mediaURL) {

        if(obj.mp3 && typeof(obj.mp3) == "string") {
            if(!obj.mp3.match("^http")) {
                // Convert background source url from relative to absolute
                obj.mp3 = krusovice.tools.url.joinRelativePath(mediaURL, obj.mp3);
            }
        }

    },


    /**
     * Load a song into audio element and load related rhytm data too.
     *
     * Song URL must be preprocessed to be platform compatible.
     *
     * @param {Object} audio HTMLAudio element used for music playback, or null if only to load rhytm data
     *
     * @param {Function} callback(songURL, rhytmhURL, rhytmData) called when all done
     *
     * @param {boolean} prelisten Load low quality audio version
     *
     */
    loadSong : function(songURL, rhythmURL, audio, callback, prelisten) {
        throw new Error("Use loadSongDeferred()");
    },

    /**
     * Load a song into audio element and load related rhytm data too.
     *
     * Creates HTMLAudio object which has special attributes *rhytmData* and *levelData*
     * containing server pre-processed information about the music.
     *
     * Rhytm data is described by Echo Next REMIX API.
     *
     * Level data is described by levels.py.
     *
     * @param {Object} audio HTMLAudio element used for music playback.
     *
     * @param {Object} urls { song, rhytm, levels }
     *
     * @param {boolean} prelisten Load low quality audio version
     *
     * @return jQuery.Deferred object with callback of function(audio) and audio object has special rhytmData and songData attributes
     *
     */
    loadSongDeferred : function(audio, urls, prelisten, quiet) {

        // Deferred loaders of three different data files
        var dfds = [];

        var audioLoader = $.Deferred(), rhythm, levels;

        console.log("loadSongDeferred()");
        console.log(urls);

        if(!urls || $.isEmptyObject(urls)) {
            throw new Error("Missing song data urls object");
        }

        // Return a Promise to load JSON, but with preprocessor done()
        // which is run before Promise is resolved
        function loadDFDJSON(url, done) {
            var loader = $.Deferred();

            var jqXHR = $.ajax({
                url: url,
                dataType: 'json',

                success: function(data) {
                    console.error("ASDFASF");
                    done(data);
                    loader.resolve();
                },

                error : function() {
                    console.error("Bad loadSongDeferred() url " + url);
                    loader.fail("Could not load:" + url);
                }
            });

            return loader;
        }

        // Load rhytm data if given
        if(urls.rhythm) {
            rhythm = loadDFDJSON(urls.rhythm, function(data) {
                audio.rhytmData = data;
            });
        } else {
            rhythm = null;
        }

        // Load levels data if given
        if(urls.levels) {
            levels = loadDFDJSON(urls.levels, function(data) {
                audio.levelData = data;
            });
        } else {
            levels = null;
        }

        // http://www.w3.org/TR/html5/media-elements.html#mediaevents
        if(!quiet) {

            $(audio).one("canplay", function() {
                audioLoader.resolve();
            });

            $(audio).one("error", function() {
                audioLoader.reject("Could not load audio: " + urls.song);
            });

            audio.src = urls.song;
        } else {
            // Don't load audio data
            audioLoader.resolve();
        }

        return $.when(audio, rhythm, levels);
    },

    /**
     * Load a song based on krusovice.Design object.
     *
     * Song can be id (stock) or custom URL.
     * Returns a deferred object which on complete
     *
     * @param design {krusovice.Design} Show design which tells what kind of audio to use
     *
     * @param {HTMLAudio} audio Audio object which will contain audio data and rhythm datas
     *
     * @param {Boolean} prelisten convert audio URLs to prelisten versions
     *
     * @parma {Boolean} quiet Don't actually load audio data (used on the server-side rendering)
     *
     * @return {jQuery.Deferred} object
     */
    loadSongFromDesign : function(design, audio, prelisten, quiet) {

        // Data URLs we need to load
        var urls = {};

        if(design.songData && design.songData.url) {
            urls.song = design.songData.url;
        } else if(design.songId) {

            urls.song = this.getAudioURL(design.songId);

            if(!urls.song) {
                throw new Error("Library did not have a song with id:" + design.songId);
            }
        }
        if(!urls.song) {
            // Mute design
            return null;
        }

        urls.rhythm = urls.song.replace(".mp3", ".json");

        if(this.useLevelData) {
            urls.levels = urls.song.replace(".mp3", ".levels.json");
        }

        if(prelisten) {
            urls.song = this.convertToPrelistenURL(urls.song);
        } else if(audio) {

            //  Check FF / Opera
            //  need for audio format remapping
            var needOGG = audio.canPlayType('audio/ogg; codecs="vorbis"') !== "";
            if(needOGG) {
                urls.song = urls.song.replace(".mp3", ".ogg");
            }
        }

        return this.loadSongDeferred(audio, urls, prelisten, quiet);

    },

    /**
     * Return URL converted to a file in the same place, but with a compatible format / suffix
     *
     * @param  {String} url [description]
     * @return {String}     [description]
     */
    getBrowserAudioFormat : function(url) {

        var audio = document.createElement("audio");

        var needAAC = audio.canPlayType('audio/mp4; codecs="mp4a.40.5"') !== "";
        var needOGG = audio.canPlayType('audio/ogg; codecs="vorbis"') !== "";

        if(needOGG) {
            url = url.replace(".mp3", ".ogg");
        } else if(needAAC){
            url = url.replace(".mp3", ".m4a");
        } else {
            console.error("Could not detect prelisten audio format support");
        }

        return url;
    },

    /**
     * Get prelisten quality of uploaded song.
     *
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    convertToPrelistenURL : function(url) {
        url = url.replace(".mp3", ".prelisten.mp3");
        return this.getBrowserAudioFormat(url);
    },

    /**
     * Load audio file from stock library.
     *
     * @param {Boolean} prelisten Get low quality preview version
     *
     * @return null if unknown song id
     */
    getAudioURL : function(songId, prelisten) {

        var song = this.get(songId);

        if(!song) {

            if($.isEmptyObject(this.data)) {
                throw new Error("Attempted to load song from uninitialized song db");
            }

            return null;
        }

        var url = song.mp3;

        if(prelisten) {
            return this.convertToPrelistenURL(url);
        }

        return url;
    }


});

return krusovice.music;

});
