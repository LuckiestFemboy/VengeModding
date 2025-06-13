// mod-builder.js

// Define the texture groups and their associated files
const TEXTURE_GROUPS = [
    {
        name: "Walls Sierra",
        files: [
            "Wall-Texture-dirty.jpg",
            "Wall-Texture-v1.jpg",
            "Wall-Texture-Snow.jpg",
            "Wall-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Walls Tundra",
        files: [
            "Wall-Texture-4M-Dungeon.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Walls Mistle",
        files: [
            "Green-Wall.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Top Floor",
        files: [
            "Floor-Low.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Ground",
        files: [
            "Ground-Sand.png",
            "Sand-Corner.jpg",
            "Sierra-Grass.jpg",
            "Sierra-Road.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Temple Roof",
        files: [
            "Hallway-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Pillar",
        files: [
            "Pillar-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Mistle Pillar",
        files: [
            "Snake-Pillar.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Mistle Rock",
        files: [
            "rock_formation_01_wall_tile.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Roof",
        files: [
            "floor_tile_01_metal.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Cube",
        files: [
            "Xibalba_Cube_BaseColor.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Tundra Cube",
        files: [
            "Tundra_Cube_BaseColor.jpg"
        ],
        modifiable: false,
        canAdjustSaturation: false
    },
    {
        name: "Xibalba Walls & Buildings",
        files: [
            "dungeon_set_02_atlas_01.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Floor Carve/Ornament",
        files: [
            "Floor-Ornament.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Tundra Building Floor",
        files: [
            "snake_temple_floor_01_tex.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Mistle Tunnel",
        files: [
            "Snake-Tunnel.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Tundra Ground",
        files: [
            "snowy_rock.jpg",
            "ice.jpg",
            "snow.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Gravestone",
        files: [
            "T_PROP_gravestone_01_BC.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Roof Pillars",
        files: [
            "wall-trials1.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "All Maps Sky",
        files: [
            "wall-trials1.jpg",
            "FattySky00_Night_01.png",
            "FattySky00_Night_04.png",
            "FattySky00_Night_05.png",
            "FattySky00_Night_03.png",
            "FattySky00_Night_02.png",
            "FattySky00_Sunset_02.png",
            "FattySky00_Sunset_06.png",
            "FattySky00_Sunset_03.png",
            "FattySky00_Sunset_01.png",
            "FattySky00_Sunset_04.png",
            "FattySky00_Sunset_05.png",
            "FattySky00_Cloudy_06.png",
            "FattySky00_Cloudy_01.png",
            "FattySky00_Cloudy_03.png",
            "FattySky00_Cloudy_05.png",
            "FattySky00_Cloudy_02.png",
            "FattySky00_Cloudy_04.png",
            "FattySkybox03_Cloudy_01.png",
            "FattySkybox03_Cloudy_02.png",
            "FattySkybox03_Cloudy_04.png",
            "FattySkybox03_Cloudy_03.png",
            "FattySkybox03_Cloudy_06.png",
            "FattySkybox03_Cloudy_05.png",
            "FattySkybox03_Night_06.png",
            "FattySkybox03_Night_02.png",
            "FattySkybox03_Night_03.png",
            "FattySkybox03_Night_04.png",
            "FattySkybox03_Night_05.png",
            "FattySkybox03_Night_01.png",
            "FattySkybox03_Sunset_04.png",
            "FattySkybox03_Sunset_01.png",
            "FattySkybox03_Sunset_02.png",
            "FattySkybox03_Sunset_03.png",
            "FattySkybox03_Sunset_06.png",
            "FattySkybox03_Sunset_05.png",
            "FattySky00_Sunny_06.png",
            "FattySky00_Sunny_02.png",
            "FattySkybox03_Sunny_05.png",
            "FattySkybox03_Sunny_02.png",
            "FattySky00_Sunny_04.png",
            "FattySky00_Sunny_05.png",
            "FattySkybox03_Sunny_06.png",
            "FattySky00_Sunny_01.png",
            "FattySky00_Sunny_03.png",
            "FattySkybox03_Sunny_03.png",
            "FattySkybox03_Sunny_01.png",
            "FattySkybox03_Sunny_04.png",
            "FattySky00_Sunny_01.png"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Bounce Pad",
        files: [
            "BouncePad-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    }
];

// New DOM Elements for Mod Builder
let createModPackButton; // The button on the main gallery page
let modBuilderOverlay;
let modBuilderCloseButton;
let textureGroupList;
let customizationPanel;
let createCustomModPackButton; // The button *inside* the mod builder for final zip
let currentModifyingGroup = null; // Stores the currently selected group

// Object to store modifications for each group/file in the session
// Key will be group.name_filename, value will be an object containing modification data
const sessionModifications = {};

// Helper to get a unique key for a texture (e.g., "Walls Sierra_Wall-Texture-dirty.jpg")
function getTextureModKey(groupName, filename) {
    return `${groupName}_${filename}`;
}

// Function to show the mod builder overlay
function showModBuilder() {
    modBuilderOverlay.classList.add('active');
    // Ensure we start with the group list view when opening the mod builder
    textureGroupList.style.display = 'grid'; // Show the grid layout for groups
    if (createCustomModPackButton) createCustomModPackButton.style.display = 'block'; // Show the global mod pack button
    customizationPanel.style.display = 'none'; // Hide the customization panel
    renderTextureGroupList(); // Render the list when showing the builder
}

// Function to hide the mod builder overlay
function hideModBuilder() {
    modBuilderOverlay.classList.remove('active');
}

// Function to go back to the texture group list
function backToGroupList() {
    customizationPanel.style.display = 'none'; // Hide customization panel
    textureGroupList.style.display = 'grid'; // Show group list
    if (createCustomModPackButton) createCustomModPackButton.style.display = 'block'; // Show the global mod pack button again
    currentModifyingGroup = null; // Reset current group
    renderTextureGroupList(); // Re-render to show any new modification indicators
}


// Function to render the list of texture groups
function renderTextureGroupList() {
    textureGroupList.innerHTML = ''; // Clear previous list
    TEXTURE_GROUPS.forEach(group => {
        const groupButton = document.createElement('button');
        groupButton.textContent = group.name;
        groupButton.classList.add('mod-group-button');
        // Check if this group has any active modifications and add a visual indicator
        // A group has modifications if ANY of its files have modifications
        const hasMods = group.files.some(file => {
            const modKey = getTextureModKey(group.name, file);
            return sessionModifications[modKey] && Object.keys(sessionModifications[modKey]).length > 0;
        });
        
        if (hasMods) {
            groupButton.classList.add('has-modifications'); // New class for styling
            groupButton.innerHTML += ' <i class="fas fa-edit mod-indicator-icon"></i>'; // Add an icon
        }

        if (!group.modifiable) {
            groupButton.classList.add('not-modifiable');
            groupButton.disabled = true;
            groupButton.title = "This group cannot be modified.";
        }
        groupButton.onclick = () => {
            currentModifyingGroup = group; // Store the selected group
            textureGroupList.style.display = 'none'; // Hide group list
            if (createCustomModPackButton) createCustomModPackButton.style.display = 'none'; // Hide global mod pack button
            customizationPanel.style.display = 'flex'; // Show customization panel (using flex for internal layout)
            displayCustomizationPanel(group); // Render the customization panel for this group
        };
        textureGroupList.appendChild(groupButton);
    });
}

// Helper to get image path based on file extension
function getImagePath(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    let basePath = './mod-assets/';
    if (ext === 'jpg') return `${basePath}jpg/${filename}`;
    if (ext === 'png') return `${basePath}png/${filename}`;
    // Add other image types if needed
    return null; // Return null if not a recognized image type
}


// Image manipulation functions
function loadImageToCanvas(imageUrl, canvas, callback) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Required for manipulating image data from other origins
    img.onload = () => {
        const previewSize = 256; // Standard size for preview
        canvas.width = previewSize;
        canvas.height = previewSize;
        // Draw image, maintaining aspect ratio and centering it
        const aspectRatio = img.width / img.height;
        let drawWidth = previewSize;
        let drawHeight = previewSize;
        if (aspectRatio > 1) { // Landscape
            drawHeight = previewSize / aspectRatio;
        } else { // Portrait or square
            drawWidth = previewSize * aspectRatio;
        }
        const xOffset = (previewSize - drawWidth) / 2;
        const yOffset = (previewSize - drawHeight) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawing
        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
        if (callback) callback();
    };
    img.onerror = () => {
        console.error("Failed to load image for canvas:", imageUrl);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        ctx.fillText('Error loading image', 10, 20);
        if (callback) callback();
    };
    img.src = imageUrl;
}

function applyColorOverlay(canvas, color) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function applySaturation(canvas, saturationValue) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const factor = saturationValue / 100;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        data[i] = lum + (r - lum) * factor;
        data[i + 1] = lum + (g - lum) * factor;
        data[i + 2] = lum + (b - lum) * factor;
    }
    ctx.putImageData(imageData, 0, 0);
}


// Drawing Canvas Logic (Symmetrical Drawing)
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function setupDrawingCanvas(canvas, group) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear initial canvas

    // If there's saved drawing data, load it
    const firstFileModKey = getTextureModKey(group.name, group.files[0]);
    if (sessionModifications[firstFileModKey] && sessionModifications[firstFileModKey].drawingData) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = sessionModifications[firstFileModKey].drawingData;
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        drawSymmetrically(ctx, lastX, lastY, e.offsetX, e.offsetY, canvas.width, canvas.height);
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    // Basic drawing style
    ctx.strokeStyle = '#fd79a8'; // Pink color for drawing
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function drawSymmetrically(ctx, x1, y1, x2, y2, canvasWidth, canvasHeight) {
    // Quadrant 1 (top-left) - original drawing
    drawSegment(ctx, x1, y1, x2, y2);

    // Quadrant 2 (top-right) - mirrored horizontally
    drawSegment(ctx, canvasWidth - x1, y1, canvasWidth - x2, y2);

    // Quadrant 3 (bottom-left) - mirrored vertically
    drawSegment(ctx, x1, canvasHeight - y1, x2, canvasHeight - y2);

    // Quadrant 4 (bottom-right) - mirrored horizontally and vertically
    drawSegment(ctx, canvasWidth - x1, canvasHeight - y1, canvasWidth - x2, canvasHeight - y2);
}

function drawSegment(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


// Function to display/refresh the preview canvas with current modifications
function updatePreviewCanvas(canvas, group, color = null, saturation = null) {
    const firstFile = group.files[0];
    const imageUrl = getImagePath(firstFile);

    // If a grey placeholder is active, just draw a grey rectangle
    const modKeyForPreview = getTextureModKey(group.name, firstFile);
    if (sessionModifications[modKeyForPreview] && sessionModifications[modKeyForPreview].useGreyPlaceholder) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#808080'; // Grey color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return; // Stop here, no need to load image or apply other mods
    }

    loadImageToCanvas(imageUrl, canvas, () => {
        let currentPreviewColor = color;
        let currentPreviewSaturation = saturation;

        // Apply saved modifications unless overridden by live preview values
        if (color === null && sessionModifications[modKeyForPreview] && sessionModifications[modKeyForPreview].color) {
            currentPreviewColor = sessionModifications[modKeyForPreview].color;
        }
        if (saturation === null && sessionModifications[modKeyForPreview] && sessionModifications[modKeyForPreview].saturation !== undefined) {
            currentPreviewSaturation = sessionModifications[modKeyForPreview].saturation;
        }

        // Order of operations: Image -> Color -> Saturation -> Drawing/Pattern
        // If drawing or pattern is active, it takes precedence for visual display
        if (sessionModifications[modKeyForPreview] && sessionModifications[modKeyForPreview].drawingData) {
            const drawingImg = new Image();
            drawingImg.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.drawImage(drawingImg, 0, 0, canvas.width, canvas.height);
            };
            drawingImg.src = sessionModifications[modKeyForPreview].drawingData;
        } else if (sessionModifications[modKeyForPreview] && sessionModifications[modKeyForPreview].pattern) {
             // Placeholder for pattern application on preview
             // This will be implemented in the next step
             console.log("Pattern preview not yet implemented.");
        }
        else { // Apply color and saturation only if no drawing/pattern is active
            if (currentPreviewColor) {
                applyColorOverlay(canvas, currentPreviewColor);
            }
            if (currentPreviewSaturation !== null && currentPreviewSaturation !== undefined) {
                applySaturation(canvas, currentPreviewSaturation);
            }
        }
    });
}


// Function to display/refresh the customization panel for a selected group
function displayCustomizationPanel(group) {
    customizationPanel.innerHTML = ''; // Clear previous content

    const panelHeader = document.createElement('h2');
    panelHeader.textContent = `Customize: ${group.name}`;
    customizationPanel.appendChild(panelHeader);

    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'mod-back-button';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Groups';
    backButton.onclick = backToGroupList;
    customizationPanel.appendChild(backButton);

    // Image Preview Canvas
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    const previewCanvas = document.createElement('canvas');
    previewCanvas.id = 'previewCanvas';
    previewCanvas.width = 256; // Standard size for preview
    previewCanvas.height = 256;
    previewContainer.appendChild(previewCanvas);
    customizationPanel.appendChild(previewContainer);

    // Initial load of the preview canvas with any existing modifications
    updatePreviewCanvas(previewCanvas, group);


    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'customization-options-container';

    // 1. Solid Color Option
    const colorOption = document.createElement('div');
    colorOption.className = 'customization-option';
    colorOption.innerHTML = `
        <h3>Solid Color</h3>
        <input type="color" id="colorPicker" value="#6c5ce7">
        <button id="applyColorButton" class="mod-action-button">Apply Color</button>
        <button id="clearColorButton" class="mod-action-button clear-mod-button">Clear Color</button>
    `;
    optionsContainer.appendChild(colorOption);

    const colorPicker = colorOption.querySelector('#colorPicker');
    const applyColorButton = colorOption.querySelector('#applyColorButton');
    const clearColorButton = colorOption.querySelector('#clearColorButton');

    const firstFileModKey = getTextureModKey(group.name, group.files[0]);
    if (sessionModifications[firstFileModKey] && sessionModifications[firstFileModKey].color) {
        colorPicker.value = sessionModifications[firstFileModKey].color;
    }

    applyColorButton.onclick = () => {
        const chosenColor = colorPicker.value;
        group.files.forEach(file => {
            const modKey = getTextureModKey(group.name, file);
            if (!sessionModifications[modKey]) sessionModifications[modKey] = {};
            sessionModifications[modKey].color = chosenColor;
            // Clear other incompatible mods
            delete sessionModifications[modKey].drawingData;
            delete sessionModifications[modKey].pattern;
            delete sessionModifications[modKey].useGreyPlaceholder;
            delete sessionModifications[modKey].saturation; // Applying color clears saturation
        });
        updatePreviewCanvas(previewCanvas, group, chosenColor);
        console.log(`Color ${chosenColor} applied to ${group.name}.`);
        renderTextureGroupList();
    };

    clearColorButton.onclick = () => {
        group.files.forEach(file => {
            const modKey = getTextureModKey(group.name, file);
            if (sessionModifications[modKey]) {
                delete sessionModifications[modKey].color;
            }
        });
        colorPicker.value = "#6c5ce7";
        updatePreviewCanvas(previewCanvas, group);
        console.log(`Color modification cleared for ${group.name}.`);
        renderTextureGroupList();
    };

    colorPicker.addEventListener('input', () => {
        updatePreviewCanvas(previewCanvas, group, colorPicker.value, null);
    });
    colorPicker.addEventListener('change', () => {
        updatePreviewCanvas(previewCanvas, group, colorPicker.value);
    });


    // 2. Prebuilt Patterns Option (placeholder for now)
    const patternsOption = document.createElement('div');
    patternsOption.className = 'customization-option';
    patternsOption.innerHTML = `
        <h3>Prebuilt Patterns</h3>
        <div class="pattern-previews">
            <div class="pattern-preview-placeholder" data-pattern="checkerboard">Checkerboard</div>
            <div class="pattern-preview-placeholder" data-pattern="stripes">Stripes</div>
            <div class="pattern-preview-placeholder" data-pattern="gradient">Gradient</div>
        </div>
        <button id="applyPatternButton" class="mod-action-button">Apply Pattern</button>
        <button id="clearPatternButton" class="mod-action-button clear-mod-button">Clear Pattern</button>
    `;
    optionsContainer.appendChild(patternsOption);

    // 3. Drawing Canvas Option
    const drawingOption = document.createElement('div');
    drawingOption.className = 'customization-option';
    drawingOption.innerHTML = `
        <h3>Draw Your Own (Symmetrical)</h3>
        <canvas id="drawingCanvas" width="256" height="256"></canvas>
        <p>Draw in one quadrant, it mirrors to all four.</p>
        <button id="applyDrawingButton" class="mod-action-button">Apply Drawing</button>
        <button id="clearDrawingButton" class="mod-action-button clear-canvas-button">Clear Canvas</button>
    `;
    optionsContainer.appendChild(drawingOption);

    const drawingCanvas = drawingOption.querySelector('#drawingCanvas');
    const applyDrawingButton = drawingOption.querySelector('#applyDrawingButton');
    const clearDrawingButton = drawingOption.querySelector('#clearDrawingButton');

    setupDrawingCanvas(drawingCanvas, group); // Initialize drawing canvas

    applyDrawingButton.onclick = () => {
        const drawingData = drawingCanvas.toDataURL(); // Get drawing as data URL
        group.files.forEach(file => {
            const modKey = getTextureModKey(group.name, file);
            if (!sessionModifications[modKey]) sessionModifications[modKey] = {};
            sessionModifications[modKey].drawingData = drawingData;
            // Clear other incompatible mods
            delete sessionModifications[modKey].color;
            delete sessionModifications[modKey].saturation;
            delete sessionModifications[modKey].pattern;
            delete sessionModifications[modKey].useGreyPlaceholder;
        });
        updatePreviewCanvas(previewCanvas, group);
        console.log(`Drawing applied to ${group.name}.`);
        renderTextureGroupList();
    };

    clearDrawingButton.onclick = () => {
        const ctx = drawingCanvas.getContext('2d');
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Clear drawing canvas
        group.files.forEach(file => {
            const modKey = getTextureModKey(group.name, file);
            if (sessionModifications[modKey]) {
                delete sessionModifications[modKey].drawingData;
            }
        });
        updatePreviewCanvas(previewCanvas, group); // Refresh preview
        console.log(`Drawing cleared for ${group.name}.`);
        renderTextureGroupList();
    };


    // 4. Saturation Adjustment Option (conditional)
    if (group.canAdjustSaturation) {
        const saturationOption = document.createElement('div');
        saturationOption.className = 'customization-option';
        saturationOption.innerHTML = `
            <h3>Adjust Original Saturation</h3>
            <input type="range" id="saturationSlider" min="0" max="200" value="100">
            <span id="saturationValue">100%</span>
            <button id="applySaturationButton" class="mod-action-button">Apply Saturation</button>
            <button id="clearSaturationButton" class="mod-action-button clear-mod-button">Clear Saturation</button>
        `;
        optionsContainer.appendChild(saturationOption);

        const saturationSlider = saturationOption.querySelector('#saturationSlider');
        const saturationValueSpan = saturationOption.querySelector('#saturationValue');
        const applySaturationButton = saturationOption.querySelector('#applySaturationButton');
        const clearSaturationButton = saturationOption.querySelector('#clearSaturationButton');


        // Load existing saturation if present
        if (sessionModifications[firstFileModKey] && sessionModifications[firstFileModKey].saturation !== undefined) {
            saturationSlider.value = sessionModifications[firstFileModKey].saturation;
            saturationValueSpan.textContent = `${sessionModifications[firstFileModKey].saturation}%`;
        } else {
            saturationSlider.value = 100;
            saturationValueSpan.textContent = '100%';
        }


        // Live update slider value
        saturationSlider.addEventListener('input', () => {
            saturationValueSpan.textContent = `${saturationSlider.value}%`;
            updatePreviewCanvas(previewCanvas, group, null, parseInt(saturationSlider.value));
        });

        // Apply saturation when button is clicked (and save)
        applySaturationButton.onclick = () => {
            const chosenSaturation = parseInt(saturationSlider.value);
            group.files.forEach(file => {
                const modKey = getTextureModKey(group.name, file);
                if (!sessionModifications[modKey]) sessionModifications[modKey] = {};
                sessionModifications[modKey].saturation = chosenSaturation;
                 // Clear other incompatible mods
                delete sessionModifications[modKey].color; // Applying saturation clears color
                delete sessionModifications[modKey].drawingData;
                delete sessionModifications[modKey].pattern;
                delete sessionModifications[modKey].useGreyPlaceholder;
            });
            updatePreviewCanvas(previewCanvas, group);
            console.log(`Saturation ${chosenSaturation}% applied to ${group.name}.`);
            renderTextureGroupList();
        };

        clearSaturationButton.onclick = () => {
            group.files.forEach(file => {
                const modKey = getTextureModKey(group.name, file);
                if (sessionModifications[modKey]) {
                    delete sessionModifications[modKey].saturation;
                }
            });
            saturationSlider.value = 100;
            saturationValueSpan.textContent = '100%';
            updatePreviewCanvas(previewCanvas, group);
            console.log(`Saturation modification cleared for ${group.name}.`);
            renderTextureGroupList();
        };
    }

    // 5. Use Grey Placeholder Option
    const greyPlaceholderOption = document.createElement('div');
    greyPlaceholderOption.className = 'customization-option';
    greyPlaceholderOption.innerHTML = `
        <h3>Skip & Use Placeholder</h3>
        <p>Replace with a grey placeholder texture.</p>
        <button id="useGreyPlaceholderButton" class="mod-action-button">Use Grey Placeholder</button>
        <button id="clearGreyPlaceholderButton" class="mod-action-button clear-mod-button">Clear Placeholder</button>
    `;
    optionsContainer.appendChild(greyPlaceholderOption);

    const useGreyPlaceholderButton = greyPlaceholderOption.querySelector('#useGreyPlaceholderButton');
    const clearGreyPlaceholderButton = greyPlaceholderOption.querySelector('#clearGreyPlaceholderButton');

    // Check if grey placeholder is active and update button text/state (visual indicator not functional yet)
    if (sessionModifications[firstFileModKey] && sessionModifications[firstFileModKey].useGreyPlaceholder) {
        useGreyPlaceholderButton.textContent = "Placeholder Active";
        useGreyPlaceholderButton.disabled = true;
    }

    useGreyPlaceholderButton.onclick = () => {
        group.files.forEach(file => {
            const modKey = getTextureModKey(group.name, file);
            if (!sessionModifications[modKey]) sessionModifications[modKey] = {};
            sessionModifications[modKey].useGreyPlaceholder = true; // Mark to use grey placeholder
            // Clear other incompatible mods
            delete sessionModifications[modKey].color;
            delete sessionModifications[modKey].saturation;
            delete sessionModifications[modKey].drawingData;
            delete sessionModifications[modKey].pattern;
        });
        // For preview, we can temporarily show a grey canvas
        const ctx = previewCanvas.getContext('2d');
        ctx.fillStyle = '#808080'; // Grey color
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        useGreyPlaceholderButton.textContent = "Placeholder Active";
        useGreyPlaceholderButton.disabled = true;
        clearGreyPlaceholderButton.disabled = false;
        renderTextureGroupList();
    };

    clearGreyPlaceholderButton.onclick = () => {
        group.files.forEach(file => {
            const modKey = getTextureModKey(group.name, file);
            if (sessionModifications[modKey]) {
                delete sessionModifications[modKey].useGreyPlaceholder; // Remove mod
            }
        });
        useGreyPlaceholderButton.textContent = "Use Grey Placeholder";
        useGreyPlaceholderButton.disabled = false;
        updatePreviewCanvas(previewCanvas, group); // Refresh preview
        renderTextureGroupList();
    };

    customizationPanel.appendChild(optionsContainer);
}


// Function to generate the custom mod pack ZIP
async function generateCustomModPack() {
    // Show the loading overlay and reset progress
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const consoleLog = document.getElementById('console-log');
    
    if (!loadingOverlay || !progressBar || !progressPercentage || !consoleLog) {
        console.error("Loading overlay elements not found for mod pack generation.");
        // Use a simple alert since our custom modal isn't set up for this yet
        alert("Error: Missing loading elements. Cannot generate mod pack.");
        return;
    }

    loadingOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    consoleLog.textContent = 'Starting custom mod pack generation...\n';

    const zip = new JSZip();
    // Create the top-level folder structure
    const vengeClientFolder = zip.folder("Venge Client");
    const resourceSwapperFolder = vengeClientFolder.folder("Resource Swapper");
    const filesFolder = resourceSwapperFolder.folder("files");
    const assetsFolder = filesFolder.folder("assets");

    // Add empty CSS, Skin Swapper, Userscript folders
    vengeClientFolder.folder("CSS");
    vengeClientFolder.folder("Skin Swapper");
    vengeClientFolder.folder("Userscript");


    let filesProcessed = 0;
    // Count only modifiable files that have an entry in sessionModifications OR are images
    // MP3s will be copied as-is and don't need modification count
    const filesToProcess = TEXTURE_GROUPS.flatMap(group => {
        return group.files.map(file => ({ groupName: group.name, filename: file }));
    }).filter(({ groupName, filename }) => {
        const modKey = getTextureModKey(groupName, filename);
        const isImage = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.png');
        return isImage; // Only images might be modified or need placeholder
    });

    const totalFiles = filesToProcess.length;

    for (const { groupName, filename } of filesToProcess) {
        const modKey = getTextureModKey(groupName, filename);
        const modification = sessionModifications[modKey];
        const originalImagePath = getImagePath(filename); // Get path for original file
        const zipSubPath = `${groupName}_folder_id_placeholder_/1/${filename}`; // Temp placeholder for actual folder ID

        try {
            let blobToSave;

            if (modification && modification.useGreyPlaceholder) {
                // Generate a grey 1024x1024 image
                const offscreenCanvas = new OffscreenCanvas(1024, 1024);
                const ctx = offscreenCanvas.getContext('2d');
                ctx.fillStyle = '#808080'; // Grey
                ctx.fillRect(0, 0, 1024, 1024);
                blobToSave = await offscreenCanvas.convertToBlob({ type: filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg', quality: 0.95 });
                consoleLog.textContent += `Generated grey placeholder for: ${filename}\n`;

            } else if (modification && (modification.color || modification.saturation !== undefined || modification.drawingData)) {
                // Load original image to a working canvas, apply mods, then get blob
                const offscreenCanvas = new OffscreenCanvas(1024, 1024); // Target size for final output
                const ctx = offscreenCanvas.getContext('2d');
                
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        offscreenCanvas.width = img.width; // Use original image dimensions first
                        offscreenCanvas.height = img.height;
                        ctx.drawImage(img, 0, 0); // Draw original image

                        if (modification.color) {
                            applyColorOverlay(offscreenCanvas, modification.color);
                        }
                        if (modification.saturation !== undefined) {
                            applySaturation(offscreenCanvas, modification.saturation);
                        }
                        if (modification.drawingData) {
                            const drawingImg = new Image();
                            drawingImg.onload = () => {
                                // Draw the saved drawing over the base image
                                ctx.drawImage(drawingImg, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
                                resolve();
                            };
                            drawingImg.onerror = reject;
                            drawingImg.src = modification.drawingData;
                        } else {
                            resolve(); // No drawing to apply, continue
                        }
                    };
                    img.onerror = reject;
                    img.src = originalImagePath;
                });

                // Resize to 1024x1024 if needed, after all modifications
                if (offscreenCanvas.width !== 1024 || offscreenCanvas.height !== 1024) {
                    const finalCanvas = new OffscreenCanvas(1024, 1024);
                    const finalCtx = finalCanvas.getContext('2d');
                    finalCtx.drawImage(offscreenCanvas, 0, 0, 1024, 1024); // Draw current content scaled
                    blobToSave = await finalCanvas.convertToBlob({ type: filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg', quality: 0.95 });
                } else {
                    blobToSave = await offscreenCanvas.convertToBlob({ type: filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg', quality: 0.95 });
                }
                consoleLog.textContent += `Modified and added: ${filename}\n`;

            } else {
                // No specific modification, fetch original file
                const response = await fetch(originalImagePath);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                blobToSave = await response.blob();
                consoleLog.textContent += `Copied original: ${filename}\n`;
            }

            // Determine correct folder ID for the file
            const matchingGroup = TEXTURE_GROUPS.find(g => g.name === groupName);
            if (matchingGroup) {
                // Find the original folder ID for this specific filename
                // This assumes your pnglist.txt/jpgurl.txt still provides folder IDs
                // For now, we'll use a simplified mapping or fetch the original folder ID
                // from the initial gallery load (allAssets).

                // We need the original folder ID for the zip path.
                // This requires a lookup from the `allAssets` list established by `asset-list-page.js`
                // or loading your .txt files again to get the original folder.
                
                // For demonstration, let's assume `allAssets` is globally accessible
                // and contains the original folder number.
                const originalAssetInfo = allAssets.find(asset => 
                    asset.filename === filename && 
                    TEXTURE_GROUPS.some(group => group.name === groupName && group.files.includes(asset.filename))
                );

                if (originalAssetInfo) {
                     const correctZipPath = `${originalAssetInfo.folder}/1/${filename}`;
                     assetsFolder.file(correctZipPath, blobToSave);
                } else {
                    console.warn(`Could not find original folder ID for ${filename} in group ${groupName}. Skipping.`);
                    consoleLog.textContent += `[WARNING] No folder ID found for: ${filename}. Skipped.\n`;
                }

            } else {
                console.warn(`Group "${groupName}" not found in TEXTURE_GROUPS. Skipping file ${filename}.`);
                consoleLog.textContent += `[WARNING] Group not found for: ${filename}. Skipped.\n`;
            }

            filesProcessed++;
            const progress = Math.floor((filesProcessed / totalFiles) * 100);
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            consoleLog.scrollTop = consoleLog.scrollHeight;

        } catch (error) {
            console.error(`Failed to process ${filename} for zip:`, error);
            consoleLog.textContent += `[ERROR] Failed to process ${filename}: ${error.message}\n`;
            consoleLog.scrollTop = consoleLog.scrollHeight;
        }
    }

    // Now, handle MP3s. They are always copied as-is if they were part of the original gallery.
    const mp3Assets = TEXTURE_GROUPS.flatMap(group =>
        group.files.filter(file => file.toLowerCase().endsWith('.mp3'))
                   .map(file => ({ groupName: group.name, filename: file }))
    );

    for (const { groupName, filename } of mp3Assets) {
         const originalAssetInfo = allAssets.find(asset => 
            asset.filename === filename && asset.type === 'mp3'
        );

        if (originalAssetInfo) {
            const originalMp3Path = `./mod-assets/mp3/${filename}`;
            const correctZipPath = `${originalAssetInfo.folder}/1/${filename}`;
            try {
                const response = await fetch(originalMp3Path);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const blob = await response.blob();
                assetsFolder.file(correctZipPath, blob);
                consoleLog.textContent += `Copied original MP3: ${filename}\n`;
            } catch (error) {
                console.error(`Failed to copy MP3 ${filename}:`, error);
                consoleLog.textContent += `[ERROR] Failed to copy MP3 ${filename}: ${error.message}\n`;
            }
        }
    }


    try {
        const content = await zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
            if (metadata.percent) {
                 // console.log(`ZIP progress: ${metadata.percent.toFixed(2)}%`); // More granular progress if needed
            }
        });
        saveAs(content, "Venge_Client_Custom_Mod_Pack.zip");
        consoleLog.textContent += `\nSuccessfully created "Venge_Client_Custom_Mod_Pack.zip" and started download!\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    } catch (error) {
        console.error("Error generating or saving custom zip:", error);
        // Use console log for error, avoid alert here.
        consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save custom ZIP: ${error.message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    } finally {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            // Re-enable the button that triggered this, if applicable
            if (createCustomModPackButton) createCustomModPackButton.disabled = false;
        }, 3000);
    }
}


// Event listener for DOMContentLoaded to ensure elements are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Assign new DOM elements
    createModPackButton = document.getElementById('create-mod-pack-button');
    modBuilderOverlay = document.getElementById('mod-builder-overlay');
    modBuilderCloseButton = modBuilderOverlay.querySelector('.mod-builder-close-button');
    textureGroupList = document.getElementById('texture-group-list');
    customizationPanel = document.getElementById('customization-panel');
    createCustomModPackButton = document.getElementById('create-custom-mod-pack-button'); // New global mod pack button


    // Add event listeners for the new mod builder buttons
    if (createModPackButton && modBuilderOverlay && modBuilderCloseButton && textureGroupList && customizationPanel) {
        createModPackButton.addEventListener('click', showModBuilder);
        modBuilderCloseButton.addEventListener('click', hideModBuilder);
    } else {
        console.error('One or more required DOM elements for Mod Builder not found!');
        if (!createModPackButton) console.error('create-mod-pack-button not found!');
        if (!modBuilderOverlay) console.error('mod-builder-overlay not found!');
        if (!modBuilderCloseButton) console.error('mod-builder-close-button not found!');
        if (!textureGroupList) console.error('texture-group-list not found!');
        if (!customizationPanel) console.error('customization-panel not found!');
    }

    // Attach click listener for the final 'Create Mod Pack' button
    if (createCustomModPackButton) {
        createCustomModPackButton.addEventListener('click', generateCustomModPack);
    } else {
        console.error('create-custom-mod-pack-button not found!');
    }
});