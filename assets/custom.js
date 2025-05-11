
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


  


// let frontImage = "{{ 'tshirt-front.png' | asset_url }}";
// let backImage = "{{ 'tshirt-back.png' | asset_url }}";

// function showFront() {
//   document.getElementById('tshirt-front').src = frontImage;
// }

// function showBack() {
//   document.getElementById('tshirt-back').src = backImage;
// }

// function addImageToShirt(imgSrc) {
//   const designLayer = document.getElementById('design-layer');
//   designLayer.innerHTML = `<img src="${imgSrc}" style="width:100%; height:auto;" />`;
// }

// function addTextToShirt(text) {
//   const designLayer = document.getElementById('design-layer');
//   designLayer.innerHTML = `<div style="font-size:20px; color:black;">${text}</div>`;
// }


  let canvas = new fabric.Canvas('tshirt-canvas', {
    preserveObjectStacking: true,
  });

  let history = [];
  let mods = 0;

  function saveHistory() {
    history.push(JSON.stringify(canvas));
    mods = 0;
  }

  canvas.on('object:added', saveHistory);
  canvas.on('object:modified', saveHistory);
  canvas.on('object:removed', saveHistory);

  // Undo
  function undo() {
    if (history.length > 0) {
      canvas.loadFromJSON(history.pop(), canvas.renderAll.bind(canvas));
    }
  }

  // Zoom
  function zoomIn() {
    canvas.setZoom(canvas.getZoom() * 1.1);
  }

  function zoomOut() {
    canvas.setZoom(canvas.getZoom() / 1.1);
  }

  // Rotate selected
  function rotateSelected() {
    let obj = canvas.getActiveObject();
    if (obj) {
      obj.rotate((obj.angle + 15) % 360);
      canvas.renderAll();
    }
  }

  // Add uploaded image
  document.getElementById('upload-image').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {
        img.scaleToWidth(200);
        img.set({ left: 100, top: 100 });
        canvas.add(img);
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  });

  // Add text
  function addTextToCanvas() {
    const textValue = document.getElementById('text-input').value;
    const text = new fabric.Text(textValue, {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#000'
    });
    canvas.add(text);
  }

  // Change front/back image
  let isFront = true;
  const frontImageUrl = "{{ 'tshirt-front.png' | asset_url }}";
  const backImageUrl = "{{ 'tshirt-back.png' | asset_url }}";

  function setShirtSide(imageUrl) {
    fabric.Image.fromURL(imageUrl, function(img) {
      img.set({ selectable: false });
      img.scaleToWidth(400);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  }

  function showFront() {
    isFront = true;
    setShirtSide(frontImageUrl);
  }

  function showBack() {
    isFront = false;
    setShirtSide(backImageUrl);
  }

  // Initial load
  showFront();