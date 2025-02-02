// Vertex shader program
var VS = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main(){
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`;


// Fragment shader program
var FS = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
        gl_FragColor = u_FragColor;
    }`;

// Global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
  
function setUpWegGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
  
    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    if(!initShaders(gl, VS, FS)){
        console.log("Failed to load/compile shaders");
        return;
        }
    
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if(a_Position < 0){
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(!u_FragColor){
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5;
let g_selectedType=POINT; 
let g_globalAngle = 0;
let g_tailAngle = 50;
let g_headAngle = 0;
let g_earsAngle = -90;
let g_tailAnime = false;
let g_headAnime = false;
let g_earsAnime = false;

function addActionsForHtmlUI(){

    document.getElementById('TailAnimeOff').onclick = function(){g_tailAnime=false;};
    document.getElementById('TailAnimeOn').onclick = function(){g_tailAnime=true;};

    document.getElementById('HeadAnimeOff').onclick = function(){g_headAnime=false;};
    document.getElementById('HeadAnimeOn').onclick = function(){g_headAnime=true;};

    document.getElementById('EarsAnimeOff').onclick = function(){g_earsAnime=false;};
    document.getElementById('EarsAnimeOn').onclick = function(){g_earsAnime=true;};

    document.getElementById('tailSlide').addEventListener('mousemove', function() {g_tailAngle = this.value; renderAllShapes(); }); 
    document.getElementById('headSlide').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes(); }); 
    document.getElementById('earSlide').addEventListener('mousemove', function() {g_earsAngle = this.value; renderAllShapes(); }); 

    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes(); }); 
    
}
  
function main() {
    setUpWegGL();

    connectVariablesToGLSL();

    addActionsForHtmlUI();

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};
  
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
    requestAnimationFrame(tick);
}

function click(ev){
    let [x,y] = convertCoordinatedEventToGL(ev);

    canvas.style.cursor = g_selectedType === ERASER ? 'crosshair' : 'default';


    if (g_selectedType === ERASER) {
        // Eraser Mode: Remove shapes near the click position
        const threshold = 0.05; // Tolerance for removing shapes
        g_shapesList = g_shapesList.filter(shape => {
            const dx = shape.position[0] - x;
            const dy = shape.position[1] - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance > threshold; // Keep shapes outside the eraser's range
        });

        renderAllShapes();
        return;
    }

    let shape; 
    if(g_selectedType==POINT){
        shape = new Point();
    } else if (g_selectedType==TRIANGLE) {
        shape = new Triangle();
    } else {
        shape = new Circle();
        shape.segments = g_selectedSegments;
        
    }
    shape.position=[x,y];
    shape.color=g_selectedColor.slice();
    shape.size=g_selectedSize;
    g_shapesList.push(shape);

    renderAllShapes();
    
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    //console.log(g_seconds);

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

var g_shapesList = [];

function convertCoordinatedEventToGL(ev){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

function updateAnimationAngles(){
    if(g_tailAnime){
        let minAngle = 50;
        let maxAngle = 115;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_tailAngle = midAngle + angleRange * Math.sin(3*g_seconds);
    }
    if(g_headAnime){
        let minAngle = -50;
        let maxAngle = 50;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_headAngle = midAngle + angleRange * Math.sin(g_seconds);
    }

    if(g_earsAnime){
        let minAngle = -90;
        let maxAngle = 15;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_earsAngle = midAngle + angleRange * Math.sin(g_seconds);
    }
}

function renderAllShapes(){

    var startTime = performance.now();

    var globalRotMat= new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    var head = new Cube(); 
    head.color = [0.0, 1.0, 0.0, 1.0];
    head.matrix.translate(.30, 0.03, 0.1);
    head.matrix.rotate(g_headAngle, 0,0,1);
    var headCoord1 = new Matrix4(head.matrix);
    var headCoord2 = new Matrix4(head.matrix);
    var headCoord3 = new Matrix4(head.matrix);
    head.matrix.scale(0.4,.4,.4);
    head.render();

    var body = new Cube(); 
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.translate(.4, -.4, -0.001);
    body.matrix.rotate(90, 0,0,1);
    body.matrix.scale(0.5,1,.6);
    body.render();

    var nose = new Pyramid(); 
    nose.color = [0.0, 0.0, 0.0, 1.0];
    nose.matrix = headCoord3;
    nose.matrix.translate(.21, .17, -0.001);
    nose.matrix.rotate(180, 0,0,1);
    nose.matrix.scale(.1,.1,.1);
    nose.render();

    var ear1 = new Pyramid(); 
    ear1.color = [1.0, 1.0, 1.0, 1.0];
    ear1.matrix = headCoord1;
    //ear1.matrix.translate(.05, .32, 0.0);
    ear1.matrix.translate(.05, .35, 0.15);
    ear1.matrix.rotate(g_earsAngle, 0,0,1);      
    ear1.matrix.scale(0.6,0.1,.2);
    ear1.render();

    var ear2 = new Pyramid(); 
    ear2.color = [1.0, 1.0, 1.0, 1.0];
    ear2.matrix = headCoord2;
    ear2.matrix.translate(.35, .35, 0.15);
    //ear2.matrix.translate(.44, .35, 0.0);
    ear2.matrix.rotate(-g_earsAngle, 0,0,1);
    ear2.matrix.scale(0.6,0.1,.2);
    ear2.render();

    /*
    var ear2 = new Pyramid(); 
    ear2.color = [1.0, 1.0, 1.0, 1.0];
    ear2.matrix = headCoord2;
    ear2.matrix.translate(.54, .25, 0.0);
    ear2.matrix.rotate(-60, 0,0,1);
    ear2.matrix.scale(0.4,0.1,.2);
    ear2.render();*/

    var leg1 = new Cube();
    leg1.color = [1,1,0,1];
    leg1.matrix.setTranslate(.27, -.75,0.0);
    leg1.matrix.rotate(0, 0,0,1);
    leg1.matrix.scale(0.1, .4, .1);
    leg1.render();

    var leg2 = new Cube();
    leg2.color = [1,1,0,1];
    leg2.matrix.setTranslate(.10, -.75,0.5);
    leg2.matrix.rotate(0, 0,0,1);
    leg2.matrix.scale(0.1, .4, .1);
    leg2.render();

    var leg3 = new Cube();
    leg3.color = [1,1,0,1];
    leg3.matrix.setTranslate(-.4, -.75,0.0);
    leg3.matrix.rotate(0, 0,0,1);
    leg3.matrix.scale(0.1, .4, .1);
    leg3.render();

    var leg4 = new Cube();
    leg4.color = [1,1,0,1];
    leg4.matrix.setTranslate(-.57, -.75,0.5);
    leg4.matrix.rotate(0, 0,0,1);
    leg4.matrix.scale(0.1, .4, .1);
    leg4.render();

    var tail = new Pyramid();
    tail.color = [1,1,0,1];
    tail.matrix.setTranslate(-0.7,-0.1,.001);
    tail.matrix.rotate(g_tailAngle, 0,0,1);
    tail.matrix.scale(0.15, .6, .3);
    tail.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps:  " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

