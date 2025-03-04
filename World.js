// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix; 
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV        = a_UV;
    v_Normal    = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    // v_Normal    = a_Normal;
    v_VertPos   = u_ModelMatrix * a_Position; 
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor; 

  uniform sampler2D u_Sampler0; // sky
  uniform sampler2D u_Sampler1; // grass w/ flowers
  uniform sampler2D u_Sampler2; // pink
  uniform sampler2D u_Sampler3; // grass
  uniform sampler2D u_Sampler4; // stone

  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform vec3 u_lightColor;
  uniform bool u_lightOn; 
  varying vec4 v_VertPos;

  // spotlight stuff 
  uniform vec3 spotDir;
  uniform float spotCosCutoff;
  uniform float spotExponent;


  void main() { 
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // use normal diffuse
    } 
    else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                   // use color 
    } 
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV color
    }        
    else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
    }
    else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
    }
    else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);  // Use texture2
    }
    else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);  // Use texture3
    }
    else if (u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler4, v_UV);  // Use texture4
    }
    else {
      gl_FragColor = vec4(1,0.2, 0.2,1);            // error, put red-ish
    }
    
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    
    // Red/Green Distance Visualization
    // if(r < 1.0)      { gl_FragColor = vec4(1,0,0,1); }
    // else if(r < 2.0) { gl_FragColor = vec4(0,1,0,1); }

    // Light Falloff Visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r * r), 1);

    // N dot L
    vec3 L      = normalize(lightVector);
    vec3 N      = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

    // vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 diffuse = u_lightColor * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if(u_lightOn){
      if(u_whichTexture == 0) { gl_FragColor = vec4(specular + diffuse + ambient, 1.0); }
      else                    { gl_FragColor = vec4(diffuse + ambient, 1.0); }
    }

    // spotlight stuff
    float spotFactor = 1.0; //  multiplier to account for spotlight 

  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix; 
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
let u_lightPos;
let u_VertPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }	

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0){
    console.log('Failed to get the storage location of a_UV');
    return;
  } 

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0){
    console.log('Failed to get the storage location of a_Normal');
    return;
  } 

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }	

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  if(!u_NormalMatrix){
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
  if(!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix')
  if(!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  
  // get the storage loc. of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get storage location of u_Sampler0');
    return;
  }

   // get the storage loc. of u_Sampler1
   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get storage location of u_Sampler1');
     return;
   }

   // get the storage loc. of u_Sampler2
   u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
   if (!u_Sampler2) {
     console.log('Failed to get storage location of u_Sampler2');
     return;
   }

   // get the storage loc. of u_Sampler3
   u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
   if (!u_Sampler3) {
     console.log('Failed to get storage location of u_Sampler3');
     return;
   }

   // get the storage loc. of u_Sampler3
   u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
   if (!u_Sampler4) {
     console.log('Failed to get storage location of u_Sampler4');
     return;
   }

  // get the storage loc. of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture){
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // get the storage loc. of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if(!u_lightPos){
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // get the storage loc. of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if(!u_cameraPos){
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // get the storage loc. of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if(!u_lightOn){
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // get storage loc. of u_lightColor
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if(!u_lightColor){
    console.log('failed to get the storage location of u_lightColor');
    return;
  }

  // set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);  
}

// Global related UI elements
// let g_selectedColor    = [1.0,1.0,1.0,1.0];
let g_selectedColor    = [1.0,1.0,1.0];
let g_selectedSize     = 5;
let g_selectedSegments = 5;

// ASG 2 Global Variables
let g_globalAngle = 0;
let g_tail1Angle  = 0;
let g_tail2Angle  = 0;
let g_tail3Angle  = 0;
let g_bodyAngle   = 0;

let g_tail1Animation = false;
let g_tail2Animation = false;
let g_tail3Animation = false;
let g_bodyAnimation  = true;
let g_normalOn       = false;
let g_lightPos       = [0,1,-2];
let g_lightOn        = true;
                      
// Set up actions for the HTML UI elements
function addActionsForHTMLUI(){
  // Button Events (Shape Type)
  document.getElementById('normalOn').onclick  = function() { g_normalOn = true;  }
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; }

  document.getElementById('lightOn').onclick  = function() { g_lightOn = true;  }
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; }
  
  document.getElementById('animationTail1OnButton').onclick  = function() { g_tail1Animation = true;  }
  document.getElementById('animationTail1OffButton').onclick = function() { g_tail1Animation = false; }
  document.getElementById('animationTail2OnButton').onclick  = function() { g_tail2Animation = true;  }
  document.getElementById('animationTail2OffButton').onclick = function() { g_tail2Animation = false; }
  document.getElementById('animationTail3OnButton').onclick  = function() { g_tail3Animation = true;  }
  document.getElementById('animationTail3OffButton').onclick = function() { g_tail3Animation = false; }
  
  // Slider Events
  document.getElementById('redSlide').addEventListener('mousemove', function()  { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mousemove', function()  { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mousemove', function()  { g_selectedColor[2] = this.value/100; });

  document.getElementById('tail1Slide').addEventListener('mousemove', function()  { g_tail1Angle = this.value; renderAllShapes(); });
  document.getElementById('tail2Slide').addEventListener('mousemove', function()  { g_tail2Angle = this.value; renderAllShapes(); });
  document.getElementById('tail3Slide').addEventListener('mousemove', function()  { g_tail3Angle = this.value; renderAllShapes(); });

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev)  { if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev)  { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev)  { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes();}});


  // Angle Slider
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function initTextures(){
  
  // create img obj
  var image0 = new Image(); 
  var image1 = new Image(); 
  var image2 = new Image(); 
  var image3 = new Image(); 
  var image4 = new Image();

  // register the event handler to be called on loading an img
  image0.onload = function(){ sendTextureToGLSL(image0, u_Sampler0, 0);};
  image1.onload = function(){ sendTextureToGLSL(image1, u_Sampler1, 1);};
  image2.onload = function(){ sendTextureToGLSL(image2, u_Sampler2, 2);};
  image3.onload = function(){ sendTextureToGLSL(image3, u_Sampler3, 3);};  
  image4.onload = function(){ sendTextureToGLSL(image4, u_Sampler4, 4);};
  // image.crossOrigin = "anonymous";
  
  // tell the browser to load an img
  image0.src = './img/sky_o.png';
  image1.src = './img/flower.jpg';
  image2.src = './img/pink.jpg';
  image3.src = './img/grass.jpg';
  image4.src = './img/moss.png';

  // add more textures later

  return true;
}

function sendTextureToGLSL(image, u_Sampler, idx){
  var texture = gl.createTexture(); // create a texture obj
  if(!texture){
    console.log('Failed to create the texture obj');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the img's y axis

  // enable correct texture 
  if (idx === 0)      { gl.activeTexture(gl.TEXTURE0); }
  else if (idx === 1) { gl.activeTexture(gl.TEXTURE1); }
  else if (idx === 2) { gl.activeTexture(gl.TEXTURE2); }
  else if (idx === 3) { gl.activeTexture(gl.TEXTURE3); }
  else if (idx === 4) { gl.activeTexture(gl.TEXTURE4); }

  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture img
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, idx);

  console.log('idx = ' + idx);

  console.log('finished loadTexture');
}



function main() {
  // Set up canvas and gl vars 
  setupWebGL();

  // Set up GLSL shader programs & connect GLSL vars
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  document.onkeydown = keydown;

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds   = performance.now()/1000.0 - g_startTime;

function tick(){
  // save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  // console.log(g_seconds);

  // update animation angles
  updateAnimationAngles();

  // draw erverything
  renderAllShapes();

  // tell browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {
  // Extract the event click & return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create & store the new point
  let point;
	
  // Draw every shape that's supposed to be in the canvas
  renderAllShapes();
}

// Extract the event click & return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
  var x    = ev.clientX; // x coordinate of a mouse pointer
  var y    = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return([x,y]);
}

// update the animation angle
function updateAnimationAngles(){
  if(g_tail1Animation)  { g_tail1Angle = (45*Math.sin(g_seconds));     }
  if(g_tail2Animation)  { g_tail2Angle = (45*Math.sin(1.2*g_seconds)); }
  if(g_tail3Animation)  { g_tail3Angle = (45*Math.sin(1.3*g_seconds)); }
  if(g_bodyAnimation)   { g_bodyAngle  = (2*Math.sin(1.2*g_seconds));  }

  g_lightPos[0] = Math.cos(g_seconds);
}

// process keybinds
function keydown(ev){
  if(ev.keyCode == 87)      { g_camera.moveForward(); } // W
  else if(ev.keyCode == 65) { g_camera.moveLeft();    } // A
  else if(ev.keyCode == 68) { g_camera.moveRight();   } // S
  else if(ev.keyCode == 83) { g_camera.moveBack();    } // D
  else if(ev.keyCode == 81) { g_camera.panLeft();     } // Q
  else if(ev.keyCode == 69) { g_camera.panRight();    } // E

  let [x,y] = convertCoordinatesEventToGL(ev);

  renderAllShapes();
  console.log(ev.keyCode);
}

// Create a Camera obj 
var g_camera = new Camera();
//g_camera.eye = new Vector3([0,0,3]);
//g_camera.at  = new Vector3([0,0,-100]);
//g_camera.up  = new Vector3([0,1,0]);

// Create 32x32 Map

var g_map = [
[1,1,1,1, 1,1,1,1],
[1,0,0,0, 0,0,0,1],
[1,0,0,0, 0,0,0,1],
[1,1,1,1, 1,0,0,1],
[1,0,0,0, 0,0,0,1],
[1,0,0,0, 0,0,0,1],
[1,0,0,0, 1,0,0,1],
[1,0,0,0, 0,0,0,1],
];

function drawMap(){
  var body = new Cube();
  var floor = new Cube();
  for(i = 0; i < 3; i++){
    for(x = 0; x < 32; x++){
      for(y = 0; y < 32; y++){
        if(x < 1 || x == 31 || y == 0 || y == 31) {
          body.color = [0.8,1.0,1.0,1.0];
          body.textureNum = 4;
          body.matrix.setTranslate(0,-.75,0);
          body.matrix.scale(.4,.4,.4);
          body.matrix.translate(x-16, i, y-16);
          body.render();
        }
      }
    }
  }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
  // check the time at the start of thsi function
  var startTime = performance.now();

  // pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // pass the matrix to u_ModelMatrix attrib
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // drawMap();

  // pass the light pos to GLSL 
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // pass the camera pos to GLSL 
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  // pass the light status 
  gl.uniform1i(u_lightOn, g_lightOn);  

  // pass the light color status 
  gl.uniform3f(u_lightColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2]);

  // draw the light
  var light = new Cube();
  //light.color = g_selectedColor.slice();
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  // draw the floor
  var floor   = new Cube();
  floor.color = [1,0,0,1.0];
  if(g_normalOn) { floor.textureNum = -3; }
  else           { floor.textureNum = 1;  }
  floor.matrix.translate(0,-.75,0.0);
  floor.matrix.scale(12,0,12);
  floor.matrix.translate(-.5,0,-.5);
  floor.render();

  // draw the sky 
  var sky = new Cube();
  sky.color = [1,0,0,1];
  if(g_normalOn) { sky.textureNum = -3; }
  else           { sky.textureNum = 0;  }
  sky.matrix.scale(-10,-10,-10);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();

  // draw blocks for hallway

  var b1 = new Cube();
  b1.color = [1,0,0,1];
  if(g_normalOn) { b1.textureNum = -3; }
  else           { b1.textureNum = 4;  }
  b1.matrix.scale(.5,.5,.5);
  b1.matrix.translate(-2, -1, 0);
  b1.normalMatrix.setInverseOf(b1.matrix).transpose();
  b1.render();
	
  // draw sphere
  var s = new Sphere();
  s.color = [1,1,1,1];
  if(g_normalOn) { s.textureNum = -3; }
  else           { s.textureNum = 3;  }
  s.matrix.scale(1,1,1);
  s.matrix.translate(2,1,-4);
  s.render();
  // -------------- Start Of Animal 
	
  // cat body
  var body   = new Cube();
  body.color = [.234,.221,.204,1];
  if(g_normalOn) { body.textureNum = -3; }
  body.matrix.translate(-.25,-.46,0.0);
  body.matrix.rotate(-1,1,0,0);
  body.matrix.rotate(g_bodyAngle,0,0,1);
  body.matrix.scale(.5,.3,0.7);
  body.render();

  // < ----- TAIL ----- >
  // tail 1st joint
  var tail1   = new Cube();
  tail1.color = [.234,.221,.204,1];
  if(g_normalOn) { tail1.textureNum = -3; }
  else           { tail1.textureNum = -2; }
  tail1.matrix.setTranslate(0,-.4,0.69);
  tail1.matrix.rotate(1,1,0,0);
  tail1.matrix.rotate(-g_tail1Angle,0,0,1); 

  var tail1CoordinatesMat = new Matrix4(tail1.matrix);
  tail1.matrix.scale(.10,.3,.10);
  tail1.matrix.translate(-.5,0,0);
  tail1.normalMatrix.setInverseOf(tail1.matrix).transpose();
  tail1.render();

  // tail 2nd joint
  var tail2    = new Cube();
  tail2.color  = [.234,.221,.204,1];
  if(g_normalOn) { tail2.textureNum = -3; }
  else           { tail2.textureNum = -2; }
  tail2.matrix = tail1CoordinatesMat;
  tail2.matrix.translate(0,.3,0);
  tail2.matrix.rotate(g_tail2Angle,0,0,1);
  tail2.matrix.scale(.10,.3,.10);
  tail2.matrix.translate(-.5,0,-0.001);
  tail2.normalMatrix.setInverseOf(tail2.matrix).transpose();
  tail2.render();
	
  // tail 3rd joint
  var tail3    = new Cube();
  tail3.color  = [.234,.221,.204,1];
  if(g_normalOn) { tail3.textureNum = -3; }
  else           { tail3.textureNum = -2; }
  tail3.matrix = tail1CoordinatesMat;
  tail3.matrix.translate(.5,0.85,0);
  tail3.matrix.rotate(g_tail3Angle,0,0,1);
  tail3.matrix.scale(1,0.5,1);
  tail3.matrix.translate(-.5,0,-0.001);
  tail3.normalMatrix.setInverseOf(tail3.matrix).transpose();
  tail3.render();

  // < ---- LEGS ---- >
  // front leg L1
  var frontLegL1 = new Cube();
  frontLegL1.color = [.245,.221,.204,1.0];
  if(g_normalOn) { frontLegL1.textureNum = -3; }
  else           { frontLegL1.textureNum = -2; }
  frontLegL1.matrix.translate(-.25,-0.7,0.01);
  frontLegL1.matrix.rotate(1,1,0,0);
  frontLegL1.matrix.rotate(g_bodyAngle,0,0,1);
  frontLegL1.matrix.scale(.1,.25,0.08);
  frontLegL1.render();
  
  // front leg R1
  var frontLegL2 = new Cube();
  frontLegL2.color = [.25,.221,.204,1.0];
  if(g_normalOn) { frontLegL2.textureNum = -3; }
  else           { frontLegL2.textureNum = -2; }
  frontLegL2.matrix.translate(0.15,-0.7,0.03);
  frontLegL2.matrix.rotate(1,1,0,0);
  frontLegL2.matrix.rotate(g_bodyAngle,0,0,1);
  frontLegL2.matrix.scale(.1,.25,0.08);
  frontLegL2.render();

  // front paw left
  var frontPaw1 = new Cube();
  frontPaw1.color = [.245,.221,.204,1];
  if(g_normalOn) { frontPaw1.textureNum = -3; }
  else           { frontPaw1.textureNum = -2; }
  frontPaw1.matrix.translate(-.25,-0.7,-0.09);
  frontPaw1.matrix.rotate(1,1,0,0);
  frontPaw1.matrix.rotate(g_bodyAngle,0,0,1);
  frontPaw1.matrix.scale(.1,0.05,0.1);
  frontPaw1.render();

  // front paw right
  var frontPaw2 = new Cube();
  frontPaw2.color = [.245,.221,.204,1];
  if(g_normalOn) { frontPaw2.textureNum = -3; }
  else           { frontPaw2.textureNum = -2; }
  frontPaw2.matrix.translate(0.15,-0.7,-0.07);
  frontPaw2.matrix.rotate(1,1,0,0);
  frontPaw2.matrix.rotate(g_bodyAngle,0,0,1);
  frontPaw2.matrix.scale(.1,0.05,0.1);
  frontPaw2.render();

  // back leg L1
  var backLegL1 = new Cube();
  backLegL1.color = [.245,.221,.204,1.0];
  if(g_normalOn) { backLegL1.textureNum = -3; }
  else           { backLegL1.textureNum = -2; }
  backLegL1.matrix.translate(-.25,-0.69,0.61);
  backLegL1.matrix.rotate(1,1,0,0);
  backLegL1.matrix.rotate(g_bodyAngle,0,0,1);
  backLegL1.matrix.scale(.1,.25,0.08);
  backLegL1.render();

  // back leg R1
  var backLegL2 = new Cube();
  backLegL2.color = [.25,.221,.204,1.0];
  if(g_normalOn) { backLegL2.textureNum = -3; }
  else           { backLegL2.textureNum = -2; }
  backLegL2.matrix.translate(0.15,-0.69,0.61);
  backLegL2.matrix.rotate(1,1,0,0);
  backLegL2.matrix.rotate(g_bodyAngle,0,0,1);
  backLegL2.matrix.scale(.1,.25,0.08);
  backLegL2.render();

  // back paw left
  var backPaw1 = new Cube();
  backPaw1.color = [.25,.221,.204,1];
  if(g_normalOn) { backPaw1.textureNum = -3; }
  else           { backPaw1.textureNum = -2; }
  backPaw1.matrix.translate(-.25,-0.69,0.53);
  backPaw1.matrix.rotate(1,1,0,0);
  backPaw1.matrix.rotate(g_bodyAngle,0,0,1);
  backPaw1.matrix.scale(.1,0.05,0.1);
  backPaw1.render();

  // back paw right
  var backPaw2 = new Cube();
  backPaw2.color = [.245,.221,.204,1];
  if(g_normalOn) { backPaw2.textureNum = -3; }
  else           { backPaw2.textureNum = -2; }
  backPaw2.matrix.translate(0.15,-0.69,0.53);
  backPaw2.matrix.rotate(1,1,0,0);
  backPaw2.matrix.rotate(g_bodyAngle,0,0,1);
  backPaw2.matrix.scale(.1,0.05,0.1);
  backPaw2.render();

  // < ---- Cat Head ---- >
  var head = new Cube();
  head.color = [.234,.221,.204,1];
  if(g_normalOn) { head.textureNum = -3; }
  else           { head.textureNum = -2; }
  head.matrix.translate(-.2,-.4,-.25);
  head.matrix.rotate(1,1,0,0);
  head.matrix.rotate(g_bodyAngle,0,0,1);
  head.matrix.scale(.4,.35,0.25);
  head.render();

  // < ---- Cat Ears ---- >
  // left ear
  var earLeft = new Polyhedron();
  earLeft.color = [.245,.221,.204,1];
  if(g_normalOn) { earLeft.textureNum = -3; }
  earLeft.matrix.translate(-0.2,-0.05,-0.2);
  earLeft.matrix.rotate(1,1,0,0);
  earLeft.matrix.rotate(g_bodyAngle,0,0,1);
  earLeft.matrix.scale(.15,.15,.15);
  earLeft.render()

  // right ear 
  var earRight = new Polyhedron();
  earRight.color = [.245,.221,.204,1];
  if(g_normalOn) { earRight.textureNum = -3; }
  earRight.matrix.translate(0.05,-0.05,-0.2);
  earRight.matrix.rotate(1,1,0,0);
  earRight.matrix.rotate(g_bodyAngle,0,0,1);
  earRight.matrix.scale(.15,.15,.15);
  earRight.render()

  // < ---- Eyes ---- >
  // left eye
  var eye1 = new Cube();
  eye1.color = [1,.5,.7,1];
  if(g_normalOn) { eye1.textureNum = -3; }
  else           { eye1.textureNum = -2; }
  eye1.matrix.translate(-.17,-.25,-.25);
  eye1.matrix.rotate(1,1,0,0);
  eye1.matrix.rotate(g_bodyAngle,0,0,1);
  eye1.matrix.scale(.09,.009,0.01);
  eye1.render();

  // right eye 
  var eye2 = new Cube();
  eye2.color = [1,.5,.7,1];
  if(g_normalOn) { eye2.textureNum = -3; }
  else           { eye2.textureNum = -2; }
  eye2.matrix.translate(0.07,-.25,-.25);
  eye2.matrix.rotate(1,1,0,0);
  eye2.matrix.rotate(g_bodyAngle,0,0,1);
  eye2.matrix.scale(.09,.009,0.01);
  eye2.render();

  // nose
  var nose = new Cube();
  nose.color = [1,.5,.7,1];
  if(g_normalOn) { nose.textureNum = -3; }
  else           { nose.textureNum = -2; }
  nose.matrix.translate(-0.03,-0.31,-.25);
  nose.matrix.rotate(1,1,0,0);
  nose.matrix.rotate(g_bodyAngle,0,0,1);
  nose.matrix.scale(.05,.02,0.01);
  nose.render();

  // -------------- End Of Animal 

  // check the time at the end of the function + displat on webpg
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration),'fps');
} 

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}