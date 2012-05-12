<html>
        <!-- Manual inspection of visualizer renderer output -->
<head>
        <script src="../src/thirdparty/require.js"></script>
        <script type="text/javascript">

            require.config({
                paths : {
                    krusovice : "../src"
                }
            });
        </script>

        <link href="../media/visualizer.css" rel="stylesheet"></link>

<script type="text/javascript" src="effect-browser.js"></script>

<style>
            .column {
                    float: left;
                    width: 200px;
            }

            .column-2 {

                float: left;
                width: 400px;
            }


                        #show {
                             width: 512px;
                             height: 288px;
                             float: left;
                        }

                        #show canvas {
                                border: 1px solid black;
                        }

                        #visualizer-wrapper {
                                width: 300px;
                                height: 300px;
                                margin-left: 10px;
                                border: 1px solid black;
                                float: left;
                                overflow-x: scroll;
                        }

                        audio {
                                 margin-top: 10px;
                             width: 800px;
                        }

                        textarea {
                                width: 100%;
                        }
                </style>
</head>

<body>
<h1>Effect browser</h1>

<div id="show"></div>
<div id="visualizer-wrapper">
        <div id="visualizer"></div>
</div>

<div style="clear:both">
        <!-- -->
</div>

<div id="buttons">
        <audio controls="true" id="audio"></audio>
</div>

<div class="column">
        <h2>Transition in</h2>
        <select id="transitionin"></select>
</div>

<div class="column">
        <h2>On screen</h2>
        <select id="onscreen"></select>
</div>

<div class="column">
        <h2>Transition out</h2>
        <select id="transitionout"></select>
</div>

<div class="column">
        <h2>Background</h2>
        <select id="background"></select>
</div>

<div class="column">
        <h2>Music</h2>
        <select id="music"></select>
</div>

<div style="clear: both">
        <!-- -->
</div>

<div class="column-2">
        <p>Images &amp; text</p>
        <textarea id="images"></textarea>
</div>

<div class="column-2">
        <p>Settings</p>
        <textarea id="settings"></textarea>
</div>

<div style="clear: both">
        <!-- -->
</div>

<div class="column">
        <p>
                Render scene
                <input type="checkbox" id="render-scene" checked />
        </p>

        <p>
                Render background
                <input type="checkbox" id="render-background" checked />
        </p>
</div>

<div style="clear: both">
        <!-- -->
</div>

<button id="create-video">Create video</button>

<button id="create-json">Create project JSON</button>

<input type="text" value="http://localhost:6543/create-video" />

<h2>Usage</h2>

<ul>
<li>Start Python simple HTTP server in Krusovice root: python -m SimpleHTTPServer .
<li>Open: <a href="http://localhost:8000/demos/effect-browser-html">effect-browser.html</a> from demo server in Chrome
<li>Make sure you don't get Javascript errors on start-up (SHIFT+CMD+J opens console)
<li>Press play
</ul>


</body>
</html>