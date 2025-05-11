
  function togglePassword(inputId, iconElement) {
  const passwordField = document.getElementById(inputId);

  if (!passwordField) return;

  const isPassword = passwordField.type === 'password';
  passwordField.type = isPassword ? 'text' : 'password';

  iconElement.classList.toggle('fa-eye');
  iconElement.classList.toggle('fa-eye-slash');
}


  function countChars(inputId, displayId) {
    var input = document.getElementById(inputId);
    var display = document.getElementById(displayId);
    var len = input.value.length;
    var max = input.getAttribute('maxlength') || 1000;
    display.innerHTML = `${len}/${max}`;
  }

  // Initialize count on page load
  document.addEventListener('DOMContentLoaded', function() {
    countChars('custom-textarea', 'word-count-display');
    countChars('ai-prompt', 'tshirt-count');
  });


  



  let canvas = new fabric.Canvas('tshirtCanvas', {
  preserveObjectStacking: true
});

let frontTshirt = '{{ "front-tshirt.png" | asset_url }}'; // update with your front image path
let backTshirt = '{{ "back-tshirt.png" | asset_url }}'; // update with your back image path

let currentView = 'front';
let backgroundImage;
let state = [];
let mods = 0;
let undoStack = [];
let redoStack = [];

// Load front T-shirt initially
function loadTshirtImage(url) {
  fabric.Image.fromURL(url, function(img) {
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height
    });
  });
}

loadTshirtImage(frontTshirt);

// Switch Views
function showFront() {
  currentView = 'front';
  loadTshirtImage(frontTshirt);
}
function showBack() {
  currentView = 'back';
  loadTshirtImage(backTshirt);
}

// Upload image
document.getElementById('imgUploader').addEventListener('change', function (e) {
  let reader = new FileReader();
  reader.onload = function (f) {
    fabric.Image.fromURL(f.target.result, function (img) {
      img.set({
        left: canvas.width / 2 - 75,
        top: canvas.height / 2 - 75,
        scaleX: 0.3,
        scaleY: 0.3,
        originX: 'center',
        originY: 'center'
      });
      canvas.add(img).setActiveObject(img);
      saveState();
    });
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Enable undo/redo
function saveState() {
  undoStack.push(JSON.stringify(canvas));
  redoStack = []; // clear redo
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(JSON.stringify(canvas));
    let prev = undoStack.pop();
    canvas.loadFromJSON(prev, canvas.renderAll.bind(canvas));
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(JSON.stringify(canvas));
    let next = redoStack.pop();
    canvas.loadFromJSON(next, canvas.renderAll.bind(canvas));
  }
}

// Save state on object modifications
canvas.on('object:modified', saveState);
canvas.on('object:added', saveState);

// Optional: Restrict image movement inside shirt
canvas.on('object:moving', function(e) {
  let obj = e.target;
  obj.setCoords();
  if (obj.left < 50) obj.left = 50;
  if (obj.top < 100) obj.top = 100;
  if (obj.left + obj.width * obj.scaleX > canvas.width - 50) {
    obj.left = canvas.width - 50 - obj.width * obj.scaleX;
  }
  if (obj.top + obj.height * obj.scaleY > canvas.height - 100) {
    obj.top = canvas.height - 100 - obj.height * obj.scaleY;
  }
});
