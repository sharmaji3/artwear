// Password field hide show function
  function togglePassword(inputId, iconElement) {
  const passwordField = document.getElementById(inputId);

  if (!passwordField) return;

  const isPassword = passwordField.type === 'password';
  passwordField.type = isPassword ? 'text' : 'password';

  iconElement.classList.toggle('fa-eye');
  iconElement.classList.toggle('fa-eye-slash');
}

// Prompt text limit in 1000 words
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


  // Customizer page upload img and show preview in canvas
 const canvas = new fabric.Canvas('tshirt-canvas');
  let imgInstance = null;
  let state = [];
  let mods = 0;
  let redoState = [];

  // Image upload handler
  document.getElementById('uploadImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {
        img.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
        });
        canvas.clear();
        canvas.add(img);
        canvas.setActiveObject(img);
        imgInstance = img;
        saveState(); // Save initial state
      });
    };
    reader.readAsDataURL(file);
  });

  // Zoom In
  document.getElementById('zoomInBtn').onclick = function () {
    if (!imgInstance) return;
    imgInstance.scaleX *= 1.1;
    imgInstance.scaleY *= 1.1;
    canvas.requestRenderAll();
    saveState();
  };

  // Zoom Out
  document.getElementById('zoomOutBtn').onclick = function () {
    if (!imgInstance) return;
    imgInstance.scaleX *= 0.9;
    imgInstance.scaleY *= 0.9;
    canvas.requestRenderAll();
    saveState();
  };

  // Rotate Left
  document.getElementById('rotateLeftBtn').onclick = function () {
    if (!imgInstance) return;
    imgInstance.angle -= 15;
    canvas.requestRenderAll();
    saveState();
  };

  // Rotate Right
  document.getElementById('rotateRightBtn').onclick = function () {
    if (!imgInstance) return;
    imgInstance.angle += 15;
    canvas.requestRenderAll();
    saveState();
  };

  // Drag (Toggle Select/Move)
  document.getElementById('dragBtn').onclick = function () {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    if (imgInstance) imgInstance.selectable = true;
    canvas.requestRenderAll();
  };

  // Undo
  document.getElementById('undoBtn').onclick = function () {
    if (state.length > 1) {
      redoState.push(state.pop());
      canvas.loadFromJSON(state[state.length - 1], function () {
        canvas.renderAll();
      });
    }
  };

  // Redo
  document.getElementById('redoBtn').onclick = function () {
    if (redoState.length > 0) {
      const redo = redoState.pop();
      state.push(redo);
      canvas.loadFromJSON(redo, function () {
        canvas.renderAll();
      });
    }
  };

  function saveState() {
    mods += 1;
    if (mods > 0) {
      state.push(JSON.stringify(canvas));
      redoState = []; // clear redo stack
    }
  }

  canvas.on('object:modified', saveState);