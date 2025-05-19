// Password field hide show function
function togglePassword(inputId, iconElement) {
  const passwordField = document.getElementById(inputId);

  if (!passwordField) return;

  const isPassword = passwordField.type === "password";
  passwordField.type = isPassword ? "text" : "password";

  iconElement.classList.toggle("fa-eye");
  iconElement.classList.toggle("fa-eye-slash");
}

// Prompt text limit in 1000 words
function countChars(inputId, displayId) {
  var input = document.getElementById(inputId);
  var display = document.getElementById(displayId);

  if (!input || !display) return;

  var len = input.value.length;
  var max = input.getAttribute("maxlength") || 1000;
  display.innerHTML = `${len}/${max}`;
}
//Initialize count on page load
document.addEventListener("DOMContentLoaded", function () {
  countChars("promptBox", "word-count-display");
  countChars("ai-prompt", "tshirt-count");
});

// AI Api
document.addEventListener("DOMContentLoaded", function () {
  const generateButton = document.getElementById("AiGenButton");
  const promptTextarea = document.getElementById("ai-prompt");

  if (generateButton && promptTextarea) {
    generateButton.addEventListener("click", async function () {
      const prompt = promptTextarea.value.trim();

      if (!prompt) {
        alert("Please enter a prompt.");
        return;
      }

      const originalText = generateButton.innerHTML;
      generateButton.disabled = true;
      generateButton.innerHTML = `<img src="https://cdn.shopify.com/s/files/1/0744/8477/7193/files/loader.svg?v=1747284680" alt="loader" width="24" height="24"/>`;

      try {
        const imageContainer = document.getElementById("generated-image");
        if (imageContainer) {
          imageContainer.innerHTML = "";

          for (let i = 0; i < 4; i++) {
            const skeletonDiv = document.createElement("div");
            skeletonDiv.classList.add("skeleton-loader");
            imageContainer.appendChild(skeletonDiv);
          }
        }
        const response = await fetch(
          "https://gulshan-backend-1.onrender.com/generate-image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate image.");
        }

        const data = await response.json();
        console.log("Generated Image Response:", data);

        if (data.imageUrls && data.imageUrls.length > 0) {
          const imageContainer = document.getElementById("generated-image");
          if (imageContainer) {
            imageContainer.innerHTML = "";

            // Display each image
            data.imageUrls.forEach((imageUrl) => {
              const imageDiv = document.createElement("div");
              imageDiv.classList.add("ai_img");

              const img = document.createElement("img");
              img.src = imageUrl;
              img.alt = "Generated Image";
              img.style.cursor = "pointer";

              // Use class instead of ID to avoid duplicates
              img.classList.add("ai-generated-click");

              imageDiv.appendChild(img);
              imageContainer.appendChild(imageDiv);

              // Add click listener with active class toggle
              imageDiv.addEventListener("click", function () {
                // Remove 'active' class from all images
                document
                  .querySelectorAll(".ai-generated-click")
                  .forEach((el) => {
                    el.classList.remove("active");
                  });

                // Add 'active' class to the clicked image
                this.classList.add("active");

                // Add image to canvas
                addAiImageToCanvas(imageUrl);
              });
            });
          }
        }

        // promptTextarea.value = "";
        countChars("ai-prompt", "tshirt-count");
      } catch (error) {
        console.error("Error:", error);
        alert("There was an error generating the image.");
      } finally {
        generateButton.disabled = false;
        generateButton.innerHTML = originalText;
      }
    });
  }
});

const canvas = new fabric.Canvas("tshirt-canvas", {
  preserveObjectStacking: true,
});
let myDesigns = [];
let designIdCounter = 0;

let frontSvgURL = "https://cdn.shopify.com/s/files/1/0744/8477/7193/files/new.svg?v=1747399105";
let backSvgURL = "https://yourdomain.com/tshirt-back.svg";


let backgroundImg;
let history = { front: [], back: [] };
let redoStack = { front: [], back: [] };
let currentSide = "front";
let frontObjects = [];
let backObjects = [];
let frontColor = '#000000'; 
let backColor = '#000000';   

function setTshirtView(svgUrl, color) {
  fabric.loadSVGFromURL(svgUrl, function (objects, options) {
    const obj = fabric.util.groupSVGElements(objects, options);
    obj.scaleToWidth(canvas.getWidth());
    obj.scaleToHeight(canvas.getHeight());
    obj.selectable = false;
    obj._objects.forEach(function (path) {
      if (path.id === 'shirt-shape') {
        path.set('fill', color); 
      } else if (path.id === 'collar-shape') {
        path.set('fill', color);
      }
    });

    if (backgroundImg) {
      canvas.remove(backgroundImg);
    }

    backgroundImg = obj;
    canvas.add(backgroundImg);
    backgroundImg.sendToBack();
    canvas.renderAll();
  });
}


  // Change T-shirt color based on color picker
function changeTshirtColor(color) {
  if (!backgroundImg || !backgroundImg._objects) {
    console.error("backgroundImg or _objects is undefined");
    return;
  }

  // Find and update shirt shape
  const shirtShape = backgroundImg._objects.find(obj => obj.id === 'shirt-shape');
  if (shirtShape) {
    shirtShape.set('fill', color);
  }

  // Find and update collar shape
  const collarShape = backgroundImg._objects.find(obj => obj.id === 'collar-shape');
  if (collarShape) {
    collarShape.set('fill', color);
  }

  canvas.renderAll();
  console.log(backgroundImg._objects.map(obj => obj.id));
}

function showFront() {
  currentSide = "front";
  clearCanvasExceptBg();
  frontObjects.forEach((obj) => canvas.add(obj));
  setTshirtView(frontSvgURL, frontColor); // Pass the front color
  document.querySelector(".btn_control.active")?.classList.remove("active");
  document.querySelector(".controls button:nth-child(1)").classList.add("active");
}

function showBack() {
  currentSide = "back";
  clearCanvasExceptBg();
  backObjects.forEach((obj) => canvas.add(obj));
  setTshirtView(backSvgURL, backColor); // Pass the back color
  document.querySelector(".btn_control.active")?.classList.remove("active");
  document.querySelector(".controls button:nth-child(2)").classList.add("active");
}

  // Clear Canvas Except Background Image
  function clearCanvasExceptBg() {
    const objects = canvas.getObjects().filter((obj) => obj !== backgroundImg);
    objects.forEach((obj) => canvas.remove(obj));
  }

  // Initialize by showing front view
  window.onload = () => {
    showFront();
  };

// ai image
function addAiImageToCanvas(imageUrl) {
  fetch(imageUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result;

        fabric.Image.fromURL(base64data, function (img) {
          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: "center",
            originY: "center",
            scaleX: 0.5,
            scaleY: 0.5,
            selectable: true,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          getCurrentObjects().push(img);
          saveState();

          saveDesignToMyDesigns(img);
        });
      };
      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      console.error("Error loading AI image for canvas:", error);
    });
}

// Upload image
const uploadInput = document.getElementById('uploadImage');
if (uploadInput) {
  uploadInput.addEventListener('change', function (e) {
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
        canvas.add(img);
        saveState();
        getCurrentObjects().push(img);
        saveDesignToMyDesigns(img);
      });
    };
    reader.readAsDataURL(file);
  });
}

// Font Picker
let selectedFont = "ABeeZee";
let activeTextObj = null;
const fonts = [
  "ABeeZee",
  "Abel",
  "Abril Fatface",
  "Acme",
  "Actor",
  "Adamina",
  "Advent Pro",
  "Aladin",
  "Alata",
];
const fontListContainer = document.getElementById("fontList");
fonts.forEach((font) => {
  const fontOption = document.createElement("div");
  fontOption.textContent = font;
  fontOption.style.fontFamily = font;
  fontOption.style.cursor = "pointer";
  fontOption.style.padding = "5px 0";
  fontOption.onclick = () => selectFont(font, fontOption);
  fontListContainer.appendChild(fontOption);
});

function selectFont(font, element) {
  selectedFont = font;
  WebFont.load({
    google: { families: [font] },
    active: () => {
      if (activeTextObj) {
        activeTextObj.set("fontFamily", font);
        canvas.requestRenderAll();
      }
      [...fontListContainer.children].forEach((child) => {
        child.style.fontWeight = "normal";
        child.style.background = "transparent";
      });
      element.style.fontWeight = "bold";
      element.style.background = "#f0f0f0";
    },
  });
}

function addTextToCanvas() {
  const textInput = document.getElementById("text-input");
  const textValue = textInput.value.trim();
  if (!textValue) return;
  WebFont.load({
    google: { families: [selectedFont] },
    active: () => {
      const text = new fabric.Textbox(textValue, {
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: "center",
        originY: "center",
        fontFamily: selectedFont,
        editable: true,
        selectable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      activeTextObj = text;
      saveState();
      getCurrentObjects().push(text);
      saveDesignToMyDesigns(text);
      textInput.value = "";
    },
  });
}

function toggleStyle(style, buttonEl) {
  if (!activeTextObj) return;

  switch (style) {
    case "bold":
      const isBold = activeTextObj.fontWeight === "bold";
      activeTextObj.set("fontWeight", isBold ? "normal" : "bold");
      buttonEl.classList.toggle("active", !isBold);
      break;

    case "italic":
      const isItalic = activeTextObj.fontStyle === "italic";
      activeTextObj.set("fontStyle", isItalic ? "normal" : "italic");
      buttonEl.classList.toggle("active", !isItalic);
      break;

    case "underline":
      const isUnderline = activeTextObj.underline;
      activeTextObj.set("underline", !isUnderline);
      buttonEl.classList.toggle("active", !isUnderline);
      break;
  }

  canvas.requestRenderAll();
  saveState();
}

function changeFontColor(color) {
  if (activeTextObj) {
    activeTextObj.set("fill", color);
    canvas.requestRenderAll();
    saveState();
  }
}

canvas.on("selection:created", (e) => {
  const obj = e.selected[0];
  if (obj.type === "textbox") activeTextObj = obj;
  document.getElementById("deleteBtn").style.display = "inline-block";
});

canvas.on("selection:updated", (e) => {
  const obj = e.selected[0];
  if (obj.type === "textbox") activeTextObj = obj;
  document.getElementById("deleteBtn").style.display = "inline-block";
});

canvas.on("selection:cleared", () => {
  activeTextObj = null;
  document.getElementById("deleteBtn").style.display = "none";
});

function getCurrentObjects() {
  return currentSide === "front" ? frontObjects : backObjects;
}

function zoomCanvas(factor) {
  canvas.setZoom(canvas.getZoom() * factor);
  canvas.renderAll();
}

function rotateCanvas(angle) {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.rotate((obj.angle || 0) + angle);
    canvas.renderAll();
    saveState();
  }
}

function saveState() {
  const state = JSON.stringify(canvas.toDatalessJSON());
  history[currentSide].push(state);
  redoStack[currentSide] = [];
}

function undo() {
  if (history[currentSide].length > 1) {
    redoStack[currentSide].push(history[currentSide].pop());
    const prevState = history[currentSide][history[currentSide].length - 1];
    canvas.loadFromJSON(prevState, canvas.renderAll.bind(canvas));
  }
}

function redo() {
  if (redoStack[currentSide].length > 0) {
    const nextState = redoStack[currentSide].pop();
    history[currentSide].push(nextState);
    canvas.loadFromJSON(nextState, canvas.renderAll.bind(canvas));
  }
}

function removeSelected() {
  const obj = canvas.getActiveObject();
  if (obj && obj !== backgroundImg) {
    canvas.remove(obj);
    const objs = getCurrentObjects();
    const idx = objs.indexOf(obj);
    if (idx !== -1) objs.splice(idx, 1);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    saveState();

    // Remove 'active' class from the selected image thumbnail
    const activeThumbnail = document.querySelector(".ai_img.active");
    if (activeThumbnail) {
      activeThumbnail.classList.remove("active");
    }
  }
}

const deleteBtn = document.getElementById("deleteBtn");
if (deleteBtn) {
  deleteBtn.addEventListener("click", removeSelected);
}

function addToCart() {
  alert("Send design to cart logic goes here.");
}

// Toolbar bindings
document.getElementById("zoomInBtn").onclick = () => zoomCanvas(1.1);
document.getElementById("zoomOutBtn").onclick = () => zoomCanvas(0.9);
document.getElementById("rotateLeftBtn").onclick = () => rotateCanvas(-15);
document.getElementById("rotateRightBtn").onclick = () => rotateCanvas(15);
document.getElementById("dragBtn").onclick = () => {
  canvas.isDrawingMode = false;
  canvas.selection = true;
  const obj = canvas.getActiveObject();
  if (obj) obj.selectable = true;
  canvas.requestRenderAll();
};
document.getElementById("undoBtn").onclick = undo;
document.getElementById("redoBtn").onclick = redo;

// Initialize
window.onload = () => {
  showFront();
  saveState();
};

// My design tabs code
function saveDesignToMyDesigns(object) {
  designIdCounter++;
  const clone = fabric.util.object.clone(object);
  const id = "design-" + designIdCounter;

  object.myDesignId = id;

  setTimeout(() => {
    clone.cloneAsImage((img) => {
      const design = {
        id,
        objectData: clone.toObject(["fontFamily"]),
        imageURL: img.toDataURL(),
        side: currentSide,
      };
      console.log("💾 Saving design to My Designs:", design);
      myDesigns.push(design);
      renderMyDesigns();

      if (window.isLoggedIn) {
        // TODO: Call API to save design permanently
        saveDesignToServer(design);
      } else {
        saveToLocalStorage();
      }
    });
  }, 100);
}

// update in local storage if user not logged in
function saveToLocalStorage() {
  localStorage.setItem("myDesigns", JSON.stringify(myDesigns));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("myDesigns");
  if (saved) {
    myDesigns = JSON.parse(saved);
  }
}

// render my design images
function renderMyDesigns() {
  const container = document.getElementById("myDesigns");
  container.innerHTML = "";

  myDesigns.forEach((design) => {
    const div = document.createElement("div");
    div.className = "my-design";

    const img = document.createElement("img");
    img.src = design.imageURL;

    const iconBox = document.createElement("div");
    iconBox.className = "icons";

    const editBtn = document.createElement("i");
    editBtn.className = "fa-solid fa-pen-to-square";
    editBtn.onclick = () => loadDesignOnCanvas(design);

    const duplicateBtn = document.createElement("i");
    duplicateBtn.className = "fa-solid fa-clone";
    duplicateBtn.onclick = () => duplicateDesign(design);

    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fa-solid fa-trash";
    deleteBtn.onclick = () => deleteDesign(design.id);

    iconBox.append(editBtn, duplicateBtn, deleteBtn);
    div.append(img, iconBox);
    container.appendChild(div);
  });
}

// edit design
function loadDesignOnCanvas(design) {
  if (design.side !== currentSide) {
    design.side === "front" ? showFront() : showBack();
  }
  const existingObj = canvas
    .getObjects()
    .find((obj) => obj.myDesignId === design.id);
  if (existingObj) {
    canvas.setActiveObject(existingObj);
    canvas.renderAll();
  } else {
    fabric.util.enlivenObjects([design.objectData], (objects) => {
      objects.forEach((obj) => {
        obj.myDesignId = design.id;
        canvas.add(obj);
        canvas.setActiveObject(obj);
        getCurrentObjects().push(obj);
      });
      canvas.renderAll();
      saveState();
    });
  }
}
// duplicate Design
function duplicateDesign(design) {
  fabric.util.enlivenObjects([design.objectData], (objects) => {
    objects.forEach((obj) => {
      obj.set({ left: obj.left + 10, top: obj.top + 10 });
      canvas.add(obj);
      getCurrentObjects().push(obj);
      saveDesignToMyDesigns(obj);
    });
    canvas.renderAll();
    saveState();
  });
}
// delete design
function deleteDesign(id) {
  const canvasObjects = canvas
    .getObjects()
    .filter((obj) => obj.myDesignId === id);
  canvasObjects.forEach((obj) => {
    canvas.remove(obj);
    const objs = getCurrentObjects();
    const idx = objs.indexOf(obj);
    if (idx !== -1) objs.splice(idx, 1);
  });

  myDesigns = myDesigns.filter((d) => d.id !== id);
  renderMyDesigns();
  canvas.requestRenderAll();
    saveToLocalStorage();
  saveState();
}

// get data from local storage
document.addEventListener("DOMContentLoaded", function () {
  const prompt = localStorage.getItem("ai_prompt");
  const selectedImage = localStorage.getItem("ai_selected_image");
  const allImages = JSON.parse(localStorage.getItem("ai_images") || "[]");

  const promptInput = document.getElementById("ai-prompt");
  const imageContainer = document.getElementById("generated-image");

  if (prompt && promptInput) {
    promptInput.value = prompt;
  }

  if (Array.isArray(allImages) && allImages.length > 0 && imageContainer) {
    imageContainer.innerHTML = "";

    allImages.forEach((url) => {
      const imageDiv = document.createElement("div");
      imageDiv.classList.add("ai_img");

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Generated Image";
      img.classList.add("ai-generated-click");

      // Highlight selected image and add to canvas
      if (url === selectedImage) {
        imageDiv.classList.add("active");
        if (typeof addAiImageToCanvas === "function") {
          addAiImageToCanvas(url);
        }
      }

      // Optional: Allow re-selection of images from the list
      img.addEventListener("click", () => {
        document
          .querySelectorAll(".ai_img")
          .forEach((div) => div.classList.remove("active"));
        imageDiv.classList.add("active");
        addAiImageToCanvas(url);
      });

      imageDiv.appendChild(img);
      imageContainer.appendChild(imageDiv);
    });
  }

  // Clear localStorage after loading
  localStorage.removeItem("ai_images");
  localStorage.removeItem("ai_selected_image");
  localStorage.removeItem("ai_prompt");
});

window.addEventListener("load", () => {
  loadFromLocalStorage();
  renderMyDesigns();
});



// color customizer code
document.addEventListener('DOMContentLoaded', () => {
  const colorPicker = document.getElementById('color-picker');
  const previewInput = document.getElementById('colorCodePreview');

  if (!colorPicker || !previewInput) return;

  // When color is picked
  colorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    previewInput.value = color;

    if (typeof currentSide !== "undefined") {
      if (currentSide === 'front') {
        frontColor = color;
        showFront();
      } else {
        backColor = color;
        showBack();
      }
    }
  });

  // When hex code is typed manually
  previewInput.addEventListener('input', (e) => {
    const color = e.target.value;
    colorPicker.value = color;

    if (typeof currentSide !== "undefined") {
      if (currentSide === 'front') {
        frontColor = color;
        showFront();
      } else {
        backColor = color;
        showBack();
      }
    }
  });
});

document.addEventListener('aos:in', ({ detail }) => {
  console.log('animated in', detail);
});

document.addEventListener('aos:out', ({ detail }) => {
  console.log('animated out', detail);
});

