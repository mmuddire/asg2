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
let g_globalCamAngle = 0;

let g_tailAngle = 115;
let g_headAngle = 0;
let g_earsAngle = -90;
let g_leftAngle = 210;
let g_rightAngle = 180;
let g_leftFAngle = 0;
let g_rightFAngle = 0;
let g_leftPAngle = 0;
let g_rightPAngle = 0;


let g_tailAnime = false;
let g_headAnime = false;
let g_earsAnime = false;
let g_leftLegAnime = false;
let g_rightLegAnime = false;
let g_leftFAnime = false;
let g_rightFAnime = false;
let g_leftPAnime = false;
let g_rightPAnime = false;

let g_globalAngleY = 0; // Horizontal rotation (Y-axis)
let g_globalAngleX = 0; // Vertical rotation (X-axis)


function addActionsForHtmlUI(){

    document.getElementById('tailAnimeOff').onclick = function(){g_tailAnime=false;};
    document.getElementById('tailAnimeOn').onclick = function(){g_tailAnime=true;};

    document.getElementById('headAnimeOff').onclick = function(){g_headAnime=false;};
    document.getElementById('headAnimeOn').onclick = function(){g_headAnime=true;};

    document.getElementById('earsAnimeOff').onclick = function(){g_earsAnime=false;};
    document.getElementById('earsAnimeOn').onclick = function(){g_earsAnime=true;};

    document.getElementById('leftLegsAnimeOff').onclick = function(){g_leftLegAnime=false;};
    document.getElementById('leftLegsAnimeOn').onclick = function(){g_leftLegAnime=true;};

    document.getElementById('leftFeetAnimeOff').onclick = function(){g_leftFAnime=false;};
    document.getElementById('leftFeetAnimeOn').onclick = function(){g_leftFAnime=true;};

    document.getElementById('leftPawAnimeOff').onclick = function(){g_leftPAnime=false;};
    document.getElementById('leftPawAnimeOn').onclick = function(){g_leftPAnime=true;};

    document.getElementById('rightLegsAnimeOff').onclick = function(){g_rightLegAnime=false;};
    document.getElementById('rightLegsAnimeOn').onclick = function(){g_rightLegAnime=true;};

    document.getElementById('rightFeetAnimeOff').onclick = function(){g_rightFAnime=false;};
    document.getElementById('rightFeetAnimeOn').onclick = function(){g_rightFAnime=true;};

    document.getElementById('rightPawAnimeOff').onclick = function(){g_rightPAnime=false;};
    document.getElementById('rightPawAnimeOn').onclick = function(){g_rightPAnime=true;};

    document.getElementById('tailSlide').addEventListener('mousemove', function() {g_tailAngle = this.value; renderAllShapes(); }); 
    document.getElementById('headSlide').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes(); }); 
    document.getElementById('earSlide').addEventListener('mousemove', function() {g_earsAngle = this.value; renderAllShapes(); }); 
    document.getElementById('leftSlide').addEventListener('mousemove', function() {g_leftAngle = this.value; renderAllShapes(); }); 
    document.getElementById('rightSlide').addEventListener('mousemove', function() {g_rightAngle = this.value; renderAllShapes(); }); 
    document.getElementById('leftFSlide').addEventListener('mousemove', function() {g_leftFAngle = this.value; renderAllShapes(); }); 
    document.getElementById('rightFSlide').addEventListener('mousemove', function() {g_rightFAngle = this.value; renderAllShapes(); });
    document.getElementById('leftPSlide').addEventListener('mousemove', function() {g_leftPAngle = this.value; renderAllShapes(); }); 
    document.getElementById('rightPSlide').addEventListener('mousemove', function() {g_rightPAngle = this.value; renderAllShapes(); }); 

    document.getElementById('camAngleSlide').addEventListener('mousemove', function() {g_globalCamAngle = this.value; renderAllShapes(); }); 
    
}
  
function main() {
    setUpWegGL();

    connectVariablesToGLSL();

    addActionsForHtmlUI();
    
    canvas.onmousedown = function(ev) {
        isDragging = true;
        lastMouseX = ev.clientX;
        lastMouseY = ev.clientY;
    };

    canvas.onmousemove = function(ev) {
        if (isDragging) {
            const deltaX = ev.clientX - lastMouseX;
            const deltaY = ev.clientY - lastMouseY;

            // Update rotation angles
            g_globalAngleY += deltaX * 0.5;
            g_globalAngleX -= deltaY * 0.5; // Negative for natural rotation

            // Clamp vertical rotation
            g_globalAngleX = Math.max(-90, Math.min(90, g_globalAngleX));

            lastMouseX = ev.clientX;
            lastMouseY = ev.clientY;
            renderAllShapes();
        }
    };

    canvas.onmouseup = canvas.onmouseleave = function() {
        isDragging = false;
    };
  
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
        g_headAngle = midAngle + angleRange * Math.sin(.7*g_seconds);
    }

    if(g_earsAnime){
        let minAngle = -90;
        let maxAngle = 15;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_earsAngle = midAngle + angleRange * Math.sin(2*g_seconds);
    }

    if(g_leftLegAnime){
        let minAngle = 150;
        let maxAngle = 240;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_leftAngle = midAngle + angleRange * Math.sin(1.5*-g_seconds);
    }

    if(g_leftFAnime){
        let minAngle = -90;
        let maxAngle = 0;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_leftFAngle = midAngle + angleRange * Math.sin(1.5*-g_seconds);
    }

    if(g_leftPAnime){
        let minAngle = -90;
        let maxAngle = 0;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_leftPAngle = midAngle + angleRange * Math.sin(1.5*-g_seconds);
    }

    if(g_rightLegAnime){
        let minAngle = 150;
        let maxAngle = 240;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_rightAngle = midAngle + angleRange * Math.sin(1.5*g_seconds);
    }

    if(g_rightFAnime){
        let minAngle = -90;
        let maxAngle = 0;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_rightFAngle = midAngle + angleRange * Math.sin(1.5*g_seconds);
    }

    if(g_rightPAnime){
        let minAngle = -90;
        let maxAngle = 0;
        let angleRange = (maxAngle - minAngle) / 2;
        let midAngle = (maxAngle + minAngle) / 2;
        g_rightPAngle = midAngle + angleRange * Math.sin(g_seconds);
    }

    


}

function renderAllShapes(){

    var startTime = performance.now();

    const globalRotMat = new Matrix4()
        .rotate(g_globalAngleY, 0, 1, 0) // Y-axis rotation
        .rotate(g_globalAngleX, 1, 0, 0); // X-axis rotation

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
    head.render([0.6, 0.25, 0.035,1]);

    var ear1 = new Pyramid(); 
    ear1.color = [0.439, 0.231, 0.055, 1];
    ear1.matrix = headCoord1;
    ear1.matrix.translate(.05, .35, 0.15);
    ear1.matrix.rotate(g_earsAngle, 0,0,1);      
    ear1.matrix.scale(0.6,0.1,.2);
    ear1.render();

    var ear2 = new Pyramid(); 
    ear2.color = [0.439, 0.231, 0.055, 1];
    ear2.matrix = headCoord2;
    ear2.matrix.translate(.35, .35, 0.15);
    ear2.matrix.rotate(-g_earsAngle, 0,0,1);
    ear2.matrix.scale(0.6,0.1,.2);
    ear2.render();

    var body = new Cube(); 
    body.matrix.translate(.4, -.4, -0.001);
    body.matrix.rotate(90, 0,0,1);
    body.matrix.scale(0.5,1,.6);
    body.render([0.6, 0.25, 0.035,1]);

    var nose = new Pyramid(); 
    nose.color = [0.0, 0.0, 0.0, 1.0];
    nose.matrix = headCoord3;
    nose.matrix.translate(.21, .17, -0.001);
    nose.matrix.rotate(180, 0,0,1);
    nose.matrix.scale(.1,.1,.1);
    nose.render();

    var leftFront1 = new Cube();
    leftFront1.matrix.setTranslate(.3, -.25,0.0);
    leftFront1.matrix.rotate(g_leftAngle, 0,0,1);
    var leftFCoord = new Matrix4(leftFront1.matrix);
    leftFront1.matrix.scale(0.1, .3, .1);
    leftFront1.render([.471, 0.31, 0.176,1]);

    var leftBack1 = new Cube();
    leftBack1.matrix.setTranslate(-.4, -.25,0.0);
    leftBack1.matrix.rotate(g_leftAngle, 0,0,1);
    var leftBCoord = new Matrix4(leftBack1.matrix);
    leftBack1.matrix.scale(0.1, .3, .1);
    leftBack1.render([0.471, 0.31, 0.176,1]);

    var leftFront2 = new Cube();
    leftFront2.matrix = leftFCoord;
    leftFront2.matrix.translate(0,.3,0.001);
    leftFront2.matrix.rotate(g_leftFAngle, 0,0,1);
    leftFront2.matrix.scale(0.1, .2, .1);
    leftFront2.render([0.922, 0.871, 0.827,1]);

    var leftFPaw = new Cylinder();
    leftFPaw.color = [0.341, 0.173, 0.035, 1.0]; 
    leftFPaw.matrix = leftFCoord;
    leftFPaw.matrix.translate(0, .99, .7); 
    leftFPaw.matrix.rotate(90, 90, g_leftPAngle, 1); //change the 3rd one
    leftFPaw.matrix.scale(2,1,.4);
    leftFPaw.render();

    var leftBack2 = new Cube();
    leftBack2.matrix = leftBCoord;
    leftBack2.matrix.translate(0, .3,0.001);
    leftBack2.matrix.rotate(g_leftFAngle, 0,0,1);
    leftBack2.matrix.scale(0.1, .2, .1);
    leftBack2.render([0.922, 0.871, 0.827,1]);

    var leftBPaw = new Cylinder();
    leftBPaw.color = [0.341, 0.173, 0.035, 1.0, 1.0]; 
    leftBPaw.matrix = leftBCoord;
    leftBPaw.matrix.translate(0, .99, .7); 
    leftBPaw.matrix.rotate(90, 90, g_leftPAngle, 1); //change the 3rd one
    leftBPaw.matrix.scale(2,1,.4);
    leftBPaw.render();

    //right
    var rightFront1 = new Cube();
    rightFront1.matrix.setTranslate(.3, -.25,0.5);
    rightFront1.matrix.rotate(g_rightAngle, 0,0,1);
    var rightFCoord = new Matrix4(rightFront1.matrix);
    rightFront1.matrix.scale(0.1, .3, .1);
    rightFront1.render([0.471, 0.31, 0.176,1]);

    var rightBack1 = new Cube();
    rightBack1.matrix.setTranslate(-.4, -.25,0.5);
    rightBack1.matrix.rotate(g_rightAngle, 0,0,1);
    var rightBCoord = new Matrix4(rightBack1.matrix);
    rightBack1.matrix.scale(0.1, .3, .1);
    rightBack1.render([0.471, 0.31, 0.176,1]);

    var rightFront2 = new Cube();
    rightFront2.matrix = rightFCoord;
    rightFront2.matrix.translate(0,.3,0.001);
    rightFront2.matrix.rotate(g_rightFAngle, 0,0,1);
    rightFront2.matrix.scale(0.1, .2, .1);
    rightFront2.render([0.922, 0.871, 0.827,1]);

    var rightFPaw = new Cylinder();
    rightFPaw.color = [0.341, 0.173, 0.035, 1.0, 1.0]; 
    rightFPaw.matrix = rightFCoord;
    rightFPaw.matrix.translate(0, .99, .7); 
    rightFPaw.matrix.rotate(90, 90, g_rightPAngle, 1); //change the 3rd one
    rightFPaw.matrix.scale(2,1,.4);
    rightFPaw.render();

    var rightBack2 = new Cube();
    rightBack2.matrix = rightBCoord;
    rightBack2.matrix.translate(0, .3,0.001);
    rightBack2.matrix.rotate(g_rightFAngle, 0,0,1);
    rightBack2.matrix.scale(0.1, .2, .1);
    rightBack2.render([0.922, 0.871, 0.827,1]);

    var rightBPaw = new Cylinder();
    rightBPaw.color = [0.341, 0.173, 0.035, 1.0, 1.0]; 
    rightBPaw.matrix = rightBCoord;
    rightBPaw.matrix.translate(0, 0.99, .7); 
    rightBPaw.matrix.rotate(90, 90, g_rightPAngle, 1); //change the 3rd one
    rightBPaw.matrix.scale(2,1,.4);
    rightBPaw.render();

    var tail = new Pyramid();
    tail.color = [0.439, 0.231, 0.055, 1];
    tail.matrix.setTranslate(-0.7,-0.1,.2);
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

