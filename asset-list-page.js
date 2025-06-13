// DOM Elements
let searchInput;
let allCards;
// Store a global list of all assets fetched to be used for zipping
const allAssets = [];

// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;

// Mod Builder DOM Elements
let modBuilderOverlay;
let modBuilderCloseButton;
let textureGroupList;
let customizationPanel;
let modBackButton;
let customizationPanelTitle;
let colorPicker;
let applyColorButton;
let clearColorButton;
let saturationSlider;
let saturationValueDisplay;
let applySaturationButton;
let clearSaturationButton;
let drawingCanvas;
let drawingColorPicker;
let backgroundColorPicker;
let applyDrawingButton;
let clearDrawingButton;
let drawingResXInput;
let drawingResYInput;
let createModPackButtonGroupsPage; // New button for groups page

// Current state for Mod Builder
let currentGroupAssets = []; // Assets belonging to the currently selected group
let currentSelectedAsset = null; // The specific asset being modified (e.g., for drawing)
let currentDrawingContext; // 2D context for the drawing canvas

// Store modifications: { "assetId": { color: "#RRGGBB", saturation: "value", drawing: Blob/DataURL, resolution: {x,y} } }
// assetId will be constructed as folder + '/' + filename for uniqueness
const modifiedAssets = new Map();

// Helper to get asset ID
function getAssetId(asset) {
    return `${asset.folder}/${asset.filename}`;
}

// Function to mark a group button as modified
function markGroupAsModified(groupName) {
    const groupButton = document.querySelector(`.mod-group-button[data-group-name="${groupName}"]`);
    if (groupButton && !groupButton.classList.contains('has-modifications')) {
        groupButton.classList.add('has-modifications');
        // Add a star/asterisk icon to indicate modification
        const icon = document.createElement('i');
        icon.className = 'fas fa-star mod-indicator-icon';
        groupButton.appendChild(icon);
    }
    // Enable the "Create Mod Pack" button on the groups page if any modifications exist
    if (createModPackButtonGroupsPage) {
        createModPackButtonGroupsPage.disabled = modifiedAssets.size === 0;
    }
}

// Function to unmark a group button
function unmarkGroupAsModified(groupName) {
    const groupButton = document.querySelector(`.mod-group-button[data-group-name="${groupName}"]`);
    if (groupButton && groupButton.classList.contains('has-modifications')) {
        groupButton.classList.remove('has-modifications');
        const icon = groupButton.querySelector('.mod-indicator-icon');
        if (icon) {
            groupButton.removeChild(icon);
        }
    }
    // Disable the "Create Mod Pack" button on the groups page if no modifications exist
    if (createModPackButtonGroupsPage) {
        createModPackButtonGroupsPage.disabled = modifiedAssets.size === 0;
    }
}


// Card Creation
function createAndAppendCard(folder, filename, type) {
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    let mediaPath;

    const asset = { folder, filename, type };
    allAssets.push(asset);

    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3';
        mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play media-icon';
        playIcon.onclick = () => playAudio(mediaPath);

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = folder;
        folderNumberButton.onclick = (e) => {
            e.stopPropagation(); // Prevent card click
            alert(`Folder: ${folder}`);
        };

        card.appendChild(playIcon);
        card.appendChild(mp3FilenameDisplay);
        card.appendChild(folderNumberButton);

    } else { // Images
        mediaPath = `./mod-assets/${type.toLowerCase()}/${folder}/${filename}`;

        const img = document.createElement('img');
        img.loading = 'lazy'; // Lazy load images
        img.src = mediaPath;
        img.alt = filename;
        img.onerror = () => {
            console.error(`Failed to load image: ${mediaPath}`);
            img.src = 'placeholder.png'; // Fallback image
        };

        const title = document.createElement('h3');
        title.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = folder;
        folderNumberButton.onclick = (e) => {
            e.stopPropagation(); // Prevent card click
            alert(`Folder: ${folder}`);
        };

        // Add a "Mod" button to each image card
        const modButton = document.createElement('button');
        modButton.className = 'mod-individual-button';
        modButton.innerHTML = '<i class="fas fa-paint-brush"></i> Mod';
        modButton.onclick = (e) => {
            e.stopPropagation(); // Prevent card click
            // This button is deprecated, instead groups are modded
        };
        modButton.style.display = 'none'; // Hide individual mod buttons

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(folderNumberButton);
        card.appendChild(modButton);
    }

    document.getElementById('texture-grid').appendChild(card);
}

// Audio Playback
function playAudio(path) {
    const audio = new Audio(path);
    audio.play().catch(e => console.error("Error playing audio:", e));
}

// Fetch assets and populate grid
async function fetchAssets() {
    try {
        const response = await fetch('./mod-assets/texture_index.json');
        const data = await response.json();

        // Clear existing assets to prevent duplicates on re-fetch
        allAssets.length = 0;
        document.getElementById('texture-grid').innerHTML = '';

        Object.keys(data).forEach(folder => {
            const assetsInFolder = data[folder];
            assetsInFolder.forEach(asset => {
                createAndAppendCard(folder, asset.filename, asset.type);
            });
        });
        allCards = Array.from(document.querySelectorAll('.texture-card'));
    } catch (error) {
        console.error('Error fetching assets:', error);
        alert('Failed to load assets. Please check the console for more details.');
    }
}

// Search functionality
function filterAssets(query) {
    const searchTerm = query.toLowerCase();
    allCards.forEach(card => {
        const filename = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        const folder = card.querySelector('.folder-number-button') ? card.querySelector('.folder-number-button').textContent.toLowerCase() : '';
        const isMp3 = card.classList.contains('mp3');
        const textContent = isMp3 ? card.querySelector('.mp3-filename-display').textContent.toLowerCase() : '';

        if (filename.includes(searchTerm) || folder.includes(searchTerm) || textContent.includes(searchTerm)) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.visibility = 'visible';
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.visibility = 'hidden';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300); // Wait for fade-out
        }
    });
}

// Event Listeners for Search
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('texture-search');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');

    if (searchInput && searchButton && clearSearchButton) {
        searchButton.addEventListener('click', () => filterAssets(searchInput.value));
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            filterAssets('');
        });
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                filterAssets(searchInput.value);
            }
        });
    }

    // Initialize DOM elements for ZIP functionality
    const downloadAllZipButton = document.getElementById('download-all-zip-button');
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');

    // Mod Builder DOM element initialization
    modBuilderOverlay = document.getElementById('mod-builder-overlay');
    modBuilderCloseButton = document.getElementById('mod-builder-close-button');
    textureGroupList = document.getElementById('texture-group-list');
    customizationPanel = document.getElementById('customization-panel');
    modBackButton = document.getElementById('mod-back-button');
    customizationPanelTitle = document.getElementById('customization-panel-title');
    colorPicker = document.getElementById('color-picker');
    applyColorButton = document.getElementById('apply-color-button');
    clearColorButton = document.getElementById('clear-color-button');
    saturationSlider = document.getElementById('saturation-slider');
    saturationValueDisplay = document.getElementById('saturation-value');
    applySaturationButton = document.getElementById('apply-saturation-button');
    clearSaturationButton = document.getElementById('clear-saturation-button');
    drawingCanvas = document.getElementById('drawingCanvas');
    drawingColorPicker = document.getElementById('drawing-color-picker');
    backgroundColorPicker = document.getElementById('background-color-picker');
    applyDrawingButton = document.getElementById('apply-drawing-button');
    clearDrawingButton = document.getElementById('clear-drawing-button');
    drawingResXInput = document.getElementById('drawing-res-x');
    drawingResYInput = document.getElementById('drawing-res-y');
    createModPackButtonGroupsPage = document.getElementById('create-mod-pack-button-groups-page');


    // Ensure all required mod builder elements exist
    if (modBuilderOverlay && modBuilderCloseButton && textureGroupList && customizationPanel && modBackButton &&
        customizationPanelTitle && colorPicker && applyColorButton && clearColorButton &&
        saturationSlider && saturationValueDisplay && applySaturationButton && clearSaturationButton &&
        drawingCanvas && drawingColorPicker && backgroundColorPicker && applyDrawingButton && clearDrawingButton &&
        drawingResXInput && drawingResYInput && createModPackButtonGroupsPage) {

        modBuilderCloseButton.addEventListener('click', hideModBuilder);
        modBackButton.addEventListener('click', showTextureGroupList);
        applyColorButton.addEventListener('click', applyColorModification);
        clearColorButton.addEventListener('click', clearColorModification);
        saturationSlider.addEventListener('input', updateSaturationValueDisplay);
        applySaturationButton.addEventListener('click', applySaturationModification);
        clearSaturationButton.addEventListener('click', clearSaturationModification);
        applyDrawingButton.addEventListener('click', applyDrawingModification);
        clearDrawingButton.addEventListener('click', clearDrawingModification);

        // Resolution input event listeners with validation
        drawingResXInput.addEventListener('input', (e) => validateResolutionInput(e.target));
        drawingResYInput.addEventListener('input', (e) => validateResolutionInput(e.target));

        // Initial state of "Create Mod Pack" button on groups page
        createModPackButtonGroupsPage.disabled = true; // Disable initially if no mods

        // Event listener for the "Create Mod Pack" button on the groups page
        createModPackButtonGroupsPage.addEventListener('click', () => {
            const modifiedAssetPaths = Array.from(modifiedAssets.keys()); // Get unique modified asset IDs
            if (modifiedAssetPaths.length === 0) {
                alert('No modifications to create a mod pack for. Please make some changes first!');
                return;
            }
            generateModPackZip(modifiedAssetPaths);
        });

        // Drawing functionality setup
        currentDrawingContext = drawingCanvas.getContext('2d');
        setupDrawing(); // Initialize drawing canvas event listeners

    } else {
        console.error('One or more required Mod Builder DOM elements not found!');
        // Detailed error logging for missing elements
        if (!modBuilderOverlay) console.error('mod-builder-overlay not found!');
        if (!modBuilderCloseButton) console.error('mod-builder-close-button not found!');
        if (!textureGroupList) console.error('texture-group-list not found!');
        if (!customizationPanel) console.error('customization-panel not found!');
        if (!modBackButton) console.error('mod-back-button not found!');
        if (!customizationPanelTitle) console.error('customization-panel-title not found!');
        if (!colorPicker) console.error('color-picker not found!');
        if (!applyColorButton) console.error('apply-color-button not found!');
        if (!clearColorButton) console.error('clear-color-button not found!');
        if (!saturationSlider) console.error('saturation-slider not found!');
        if (!saturationValueDisplay) console.error('saturation-value not found!');
        if (!applySaturationButton) console.error('apply-saturation-button not found!');
        if (!clearSaturationButton) console.error('clear-saturation-button not found!');
        if (!drawingCanvas) console.error('drawingCanvas not found!');
        if (!drawingColorPicker) console.error('drawing-color-picker not found!');
        if (!backgroundColorPicker) console.error('background-color-picker not found!');
        if (!applyDrawingButton) console.error('apply-drawing-button not found!');
        if (!clearDrawingButton) console.error('clear-drawing-button not found!');
        if (!drawingResXInput) console.error('drawing-res-x not found!');
        if (!drawingResYInput) console.error('drawing-res-y not found!');
        if (!createModPackButtonGroupsPage) console.error('create-mod-pack-button-groups-page not found!');
    }

    // Initial fetch of assets
    fetchAssets().then(() => {
        populateTextureGroups(); // Call this after assets are fetched
    });

    // Main Download All as ZIP button
    if (downloadAllZipButton) {
        downloadAllZipButton.addEventListener('click', () => {
            // This button generates a ZIP of ALL original image assets in the repository, regardless of mods.
            // It uses allAssets to build the zip.
            console.log("Generating ZIP for all original assets...");
            generateFullZip(allAssets);
        });
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
    }
});


// === MOD BUILDER FUNCTIONS ===

// Show/Hide Mod Builder Overlay
function showModBuilder() {
    modBuilderOverlay.classList.add('active');
}

function hideModBuilder() {
    modBuilderOverlay.classList.remove('active');
}

// Show Texture Group List / Hide Customization Panel
function showTextureGroupList() {
    customizationPanel.style.display = 'none';
    textureGroupList.style.display = 'grid'; // Ensure grid for groups
    // The main Create Mod Pack button is always visible on this page
}

// Populate groups based on allAssets
function populateTextureGroups() {
    textureGroupList.innerHTML = ''; // Clear previous buttons
    const uniqueFolders = new Set(allAssets.map(asset => asset.folder));

    uniqueFolders.forEach(folder => {
        const button = document.createElement('button');
        button.className = 'mod-group-button';
        button.textContent = folder;
        button.dataset.groupName = folder; // Store group name for reference

        // Check if any asset in this group has modifications and mark button
        const assetsInGroup = allAssets.filter(asset => asset.folder === folder);
        const isGroupModified = assetsInGroup.some(asset => modifiedAssets.has(getAssetId(asset)));
        if (isGroupModified) {
            markGroupAsModified(folder);
        }

        button.addEventListener('click', () => {
            showCustomizationPanel(folder);
        });
        textureGroupList.appendChild(button);
    });
}

// Show Customization Panel for a selected group
async function showCustomizationPanel(groupName) {
    customizationPanelTitle.textContent = `Customize Group: ${groupName}`;
    currentGroupAssets = allAssets.filter(asset => asset.folder === groupName && asset.type !== 'mp3'); // Only image assets
    textureGroupList.style.display = 'none';
    customizationPanel.style.display = 'flex'; // Use flex for panel layout

    // Dynamically populate image previews in the customization panel
    const customizationOption = document.getElementById('drawing-customization-option'); // Assume drawing is the main panel for now
    let imagePreviewsContainer = customizationOption.querySelector('.image-previews-container');
    if (!imagePreviewsContainer) {
        imagePreviewsContainer = document.createElement('div');
        imagePreviewsContainer.className = 'image-previews-container';
        customizationOption.insertBefore(imagePreviewsContainer, drawingResXInput.parentNode); // Insert before resolution inputs
    }
    imagePreviewsContainer.innerHTML = ''; // Clear existing previews

    if (currentGroupAssets.length === 0) {
        imagePreviewsContainer.innerHTML = '<p style="color: #bbb; text-align: center;">No modifiable image assets in this group.</p>';
        return;
    }

    // Load first image as the default for drawing canvas
    // Or load the most recently clicked image if we implement that. For now, use the first.
    currentSelectedAsset = currentGroupAssets[0];
    await loadImageForDrawing(currentSelectedAsset);


    // Populate the preview container with actual image previews or placeholder if not image
    for (const asset of currentGroupAssets) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        if (asset.type !== 'mp3') {
            const imgPath = `./mod-assets/${asset.type.toLowerCase()}/${asset.folder}/${asset.filename}`;
            const img = new Image();
            img.src = imgPath;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxDim = 100; // Max dimension for preview thumbnail
                const ratio = Math.min(maxDim / img.width, maxDim / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                previewItem.appendChild(canvas);
            };
            img.onerror = () => {
                console.error(`Failed to load preview image: ${imgPath}`);
                const placeholder = document.createElement('div');
                placeholder.textContent = `Error loading ${asset.filename}`;
                placeholder.style.color = 'red';
                previewItem.appendChild(placeholder);
            };
        } else {
            const placeholder = document.createElement('div');
            placeholder.textContent = asset.filename;
            placeholder.style.color = '#fff';
            previewItem.appendChild(placeholder);
        }

        const filenameP = document.createElement('p');
        filenameP.textContent = asset.filename;
        previewItem.appendChild(filenameP);

        previewItem.addEventListener('click', async () => {
            currentSelectedAsset = asset; // Set the asset for modification
            await loadImageForDrawing(currentSelectedAsset); // Load this image onto the main drawing canvas
            // Apply any existing modifications (color/saturation/drawing) to the main canvas
            applyExistingModificationsToCanvas(currentSelectedAsset);
        });

        imagePreviewsContainer.appendChild(previewItem);
    }

    // Apply existing modifications to the main canvas and UI when panel is opened
    applyExistingModificationsToCanvas(currentSelectedAsset);
}


// === MODIFICATION LOGIC ===

// Loads an image onto the drawing canvas
async function loadImageForDrawing(asset) {
    if (!asset || asset.type === 'mp3') {
        drawingCanvas.width = 256;
        drawingCanvas.height = 256;
        currentDrawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        currentDrawingContext.fillStyle = backgroundColorPicker.value;
        currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        drawingResXInput.value = 256;
        drawingResYInput.value = 256;
        return;
    }

    const assetId = getAssetId(asset);
    const existingMod = modifiedAssets.get(assetId);

    return new Promise((resolve) => {
        const img = new Image();
        img.src = `./mod-assets/${asset.type.toLowerCase()}/${asset.folder}/${asset.filename}`;
        img.onload = () => {
            // Prioritize stored resolution if a drawing modification exists, otherwise use image native or default
            let targetWidth = img.width;
            let targetHeight = img.height;

            if (existingMod && existingMod.drawing && existingMod.resolution) {
                targetWidth = existingMod.resolution.x;
                targetHeight = existingMod.resolution.y;
            } else {
                // Ensure default resolution inputs are set based on loaded image, clamped to max
                targetWidth = Math.min(img.width, 2048);
                targetHeight = Math.min(img.height, 2048);
            }

            drawingResXInput.value = targetWidth;
            drawingResYInput.value = targetHeight;

            drawingCanvas.width = targetWidth;
            drawingCanvas.height = targetHeight;

            currentDrawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            // Draw background color first
            currentDrawingContext.fillStyle = backgroundColorPicker.value;
            currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            // Draw the original image (or previously applied drawing) on top
            currentDrawingContext.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);

            resolve();
        };
        img.onerror = () => {
            console.error(`Failed to load image for drawing: ${img.src}`);
            // Fallback to a default canvas size with background color
            drawingCanvas.width = 256;
            drawingCanvas.height = 256;
            currentDrawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            currentDrawingContext.fillStyle = backgroundColorPicker.value;
            currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            drawingResXInput.value = 256;
            drawingResYInput.value = 256;
            resolve();
        };
    });
}


// Applies existing color, saturation, or drawing modifications to the UI/canvas
async function applyExistingModificationsToCanvas(asset) {
    if (!asset) return;

    const assetId = getAssetId(asset);
    const mod = modifiedAssets.get(assetId);

    // Reset UI elements first
    colorPicker.value = '#ffffff';
    saturationSlider.value = 100;
    updateSaturationValueDisplay();
    clearDrawingCanvas(); // Clear drawing canvas to prepare for new/existing drawing

    // Load the base image for drawing canvas again to ensure it's clean before applying mods
    await loadImageForDrawing(asset); // This will draw the original image or fill with background.

    if (mod) {
        if (mod.color) {
            colorPicker.value = mod.color;
            // For existing color modifications, we don't apply it to the drawing canvas here.
            // It will be handled during ZIP generation on the original image.
        }
        if (mod.saturation) {
            saturationSlider.value = mod.saturation;
            updateSaturationValueDisplay();
            // Same for saturation, handled during ZIP generation.
        }
        if (mod.drawing) {
            // If there's an existing drawing, load it onto the canvas
            const img = new Image();
            img.src = mod.drawing; // This is a Data URL or Blob URL
            img.onload = () => {
                const resX = parseInt(drawingResXInput.value);
                const resY = parseInt(drawingResYInput.value);
                drawingCanvas.width = resX;
                drawingCanvas.height = resY;
                // Redraw background first based on current picker value
                currentDrawingContext.fillStyle = backgroundColorPicker.value;
                currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                // Then draw the saved drawing on top
                currentDrawingContext.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
            };
            if (mod.resolution) {
                drawingResXInput.value = mod.resolution.x;
                drawingResYInput.value = mod.resolution.y;
            }
        }
        if (mod.backgroundColor) {
            backgroundColorPicker.value = mod.backgroundColor;
            // Redraw background if a drawing is present, otherwise it will be applied on loadImageForDrawing
            if (mod.drawing) {
                 currentDrawingContext.fillStyle = backgroundColorPicker.value;
                 currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                 // Re-draw the drawing on top of the new background if it exists
                 const img = new Image();
                 img.src = mod.drawing;
                 img.onload = () => {
                     currentDrawingContext.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
                 };
            }
        }
    }
}


// Apply Color Modification
function applyColorModification() {
    if (!currentSelectedAsset) {
        alert('Please select an image asset to modify.');
        return;
    }
    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId) || {};
    mod.color = colorPicker.value;
    modifiedAssets.set(assetId, mod);
    markGroupAsModified(currentSelectedAsset.folder);
    alert(`Color applied to ${currentSelectedAsset.filename}!`);
}

function clearColorModification() {
    if (!currentSelectedAsset) return;
    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId);
    if (mod && mod.color) {
        delete mod.color;
        if (Object.keys(mod).length === 0) {
            modifiedAssets.delete(assetId);
            const assetsInGroup = allAssets.filter(asset => asset.folder === currentSelectedAsset.folder);
            const isGroupModified = assetsInGroup.some(asset => modifiedAssets.has(getAssetId(asset)));
            if (!isGroupModified) {
                unmarkGroupAsModified(currentSelectedAsset.folder);
            }
        } else {
            modifiedAssets.set(assetId, mod);
        }
        colorPicker.value = '#ffffff'; // Reset UI
        alert(`Color cleared for ${currentSelectedAsset.filename}.`);
    }
}

// Saturation Modification
function updateSaturationValueDisplay() {
    saturationValueDisplay.textContent = `${saturationSlider.value}%`;
}

function applySaturationModification() {
    if (!currentSelectedAsset) {
        alert('Please select an image asset to modify.');
        return;
    }
    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId) || {};
    mod.saturation = parseInt(saturationSlider.value);
    modifiedAssets.set(assetId, mod);
    markGroupAsModified(currentSelectedAsset.folder);
    alert(`Saturation applied to ${currentSelectedAsset.filename}!`);
}

function clearSaturationModification() {
    if (!currentSelectedAsset) return;
    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId);
    if (mod && mod.saturation) {
        delete mod.saturation;
        if (Object.keys(mod).length === 0) {
            modifiedAssets.delete(assetId);
            const assetsInGroup = allAssets.filter(asset => asset.folder === currentSelectedAsset.folder);
            const isGroupModified = assetsInGroup.some(asset => modifiedAssets.has(getAssetId(asset)));
            if (!isGroupModified) {
                unmarkGroupAsModified(currentSelectedAsset.folder);
            }
        } else {
            modifiedAssets.set(assetId, mod);
        }
        saturationSlider.value = 100; // Reset UI
        updateSaturationValueDisplay();
        alert(`Saturation cleared for ${currentSelectedAsset.filename}.`);
    }
}


// Drawing functionality
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function setupDrawing() {
    if (!drawingCanvas) return;

    drawingCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', () => isDrawing = false);
    drawingCanvas.addEventListener('mouseout', () => isDrawing = false);

    // Initial fill for the drawing canvas
    currentDrawingContext.fillStyle = backgroundColorPicker.value;
    currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Update canvas background when picker changes
    backgroundColorPicker.addEventListener('input', () => {
        // Redraw background with the new color, preserving existing drawing
        const imageData = currentDrawingContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        currentDrawingContext.fillStyle = backgroundColorPicker.value;
        currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        currentDrawingContext.putImageData(imageData, 0, 0);
    });

    // Update canvas size and redraw background/drawing when resolution inputs change
    drawingResXInput.addEventListener('input', updateCanvasResolution);
    drawingResYInput.addEventListener('input', updateCanvasResolution);
}

function draw(e) {
    if (!isDrawing) return;

    currentDrawingContext.strokeStyle = drawingColorPicker.value;
    currentDrawingContext.lineWidth = 2; // Fixed brush size for now
    currentDrawingContext.lineCap = 'round';
    currentDrawingContext.lineJoin = 'round';

    currentDrawingContext.beginPath();
    currentDrawingContext.moveTo(lastX, lastY);
    currentDrawingContext.lineTo(e.offsetX, e.offsetY);
    currentDrawingContext.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function clearDrawingCanvas() {
    currentDrawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    currentDrawingContext.fillStyle = backgroundColorPicker.value; // Fill with current background color
    currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

function validateResolutionInput(inputElement) {
    let value = parseInt(inputElement.value);
    const min = parseInt(inputElement.min);
    const max = parseInt(inputElement.max);

    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }
    inputElement.value = value;
    updateCanvasResolution();
}

function updateCanvasResolution() {
    const newWidth = parseInt(drawingResXInput.value);
    const newHeight = parseInt(drawingResYInput.value);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 2 || newHeight < 2) {
        console.warn("Invalid resolution values, cannot resize canvas.");
        return;
    }

    // Save current drawing (pixels) before resizing
    const imageData = currentDrawingContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Resize canvas
    drawingCanvas.width = newWidth;
    drawingCanvas.height = newHeight;

    // Redraw background first
    currentDrawingContext.fillStyle = backgroundColorPicker.value;
    currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Draw the saved image data, scaling it to the new canvas size
    // Create a temporary canvas/image to draw the imageData correctly scaled
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);

    currentDrawingContext.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
}


async function applyDrawingModification() {
    if (!currentSelectedAsset) {
        alert('Please select an image asset to apply drawing to.');
        return;
    }

    const assetId = getAssetId(currentSelectedAsset);
    const newWidth = parseInt(drawingResXInput.value);
    const newHeight = parseInt(drawingResYInput.value);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 2 || newHeight < 2 || newWidth > 2048 || newHeight > 2048) {
        alert('Invalid resolution for drawing. Please ensure X and Y are between 2 and 2048.');
        return;
    }

    // Create a final canvas at the specified resolution
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = newWidth;
    finalCanvas.height = newHeight;
    const finalCtx = finalCanvas.getContext('2d');

    // 1. Draw the chosen background color
    finalCtx.fillStyle = backgroundColorPicker.value;
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // 2. Draw the current drawing from drawingCanvas onto the finalCanvas, scaled
    // Ensure the drawing from the original canvas is drawn scaled correctly
    finalCtx.drawImage(drawingCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

    // Get the image data from the final canvas
    const imageDataUrl = finalCanvas.toDataURL('image/png'); // Always save as PNG for transparency support

    let mod = modifiedAssets.get(assetId) || {};
    mod.drawing = imageDataUrl; // Store the Data URL of the new image
    mod.resolution = { x: newWidth, y: newHeight }; // Store the resolution
    mod.backgroundColor = backgroundColorPicker.value; // Store the background color
    
    // If a drawing exists, it takes precedence over color/saturation mods for this asset's final image
    // So we can remove color/saturation if a drawing is applied for clarity, or just let generateZip handle precedence
    // For now, let generateZip handle it: if mod.drawing exists, ignore mod.color/saturation for that file.
    
    modifiedAssets.set(assetId, mod);
    markGroupAsModified(currentSelectedAsset.folder);
    alert(`Drawing applied to ${currentSelectedAsset.filename} with resolution ${newWidth}x${newHeight}!`);
}


function clearDrawingModification() {
    if (!currentSelectedAsset) return;
    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId);
    if (mod && mod.drawing) {
        delete mod.drawing;
        delete mod.resolution;
        delete mod.backgroundColor;
        if (Object.keys(mod).length === 0) {
            modifiedAssets.delete(assetId);
            const assetsInGroup = allAssets.filter(asset => asset.folder === currentSelectedAsset.folder);
            const isGroupModified = assetsInGroup.some(asset => modifiedAssets.has(getAssetId(asset)));
            if (!isGroupModified) {
                unmarkGroupAsModified(currentSelectedAsset.folder);
            }
        } else {
            modifiedAssets.set(assetId, mod);
        }
        clearDrawingCanvas(); // Clear canvas and refill with background color
        // Reload original image to drawing canvas if asset exists and there are no other mods.
        // If there were other mods (color/saturation), they won't show on drawing canvas anyway.
        loadImageForDrawing(currentSelectedAsset);
        alert(`Drawing cleared for ${currentSelectedAsset.filename}.`);
    }
}


// === ZIP GENERATION FUNCTIONS ===

// Generic function to display progress
function updateProgress(current, total, filename = '') {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
    consoleLog.textContent += `Adding: ${filename}...\n`;
    consoleLog.scrollTop = consoleLog.scrollHeight; // Auto-scroll
}

// Function to fetch an image and apply modifications (color/saturation)
async function getModifiedImageData(asset, color, saturation) {
    return new Promise(async (resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Required for tainted canvas with some images
        img.src = `./mod-assets/${asset.type.toLowerCase()}/${asset.folder}/${asset.filename}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0); // Draw original image

            // Apply color filter if specified
            if (color && color !== '#ffffff') { // #ffffff means no change
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over'; // Reset blend mode
            }

            // Apply saturation filter if specified
            if (saturation !== undefined && saturation !== 100) {
                ctx.filter = `saturate(${saturation}%)`;
                ctx.drawImage(img, 0, 0); // Redraw image with saturation filter
                ctx.filter = 'none'; // Reset filter
            }

            // Convert canvas content to Blob
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/png'); // Use PNG to preserve quality and transparency
        };
        img.onerror = (e) => {
            console.error(`Error loading image for modification: ${img.src}`, e);
            reject(new Error(`Failed to load image for modification: ${asset.filename}`));
        };
    });
}


// Generate ZIP for all assets (used by "Download All as ZIP" button)
async function generateFullZip(assetsToZip) {
    const zip = new JSZip();
    let filesProcessed = 0;

    loadingOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    consoleLog.textContent = 'Starting ZIP generation...\n';

    try {
        for (const asset of assetsToZip) {
            filesProcessed++;
            updateProgress(filesProcessed, assetsToZip.length, asset.filename);

            const filePathInZip = `${asset.folder}/${asset.filename}`;
            const assetUrl = `./mod-assets/${asset.type.toLowerCase()}/${asset.folder ? asset.folder + '/' : ''}${asset.filename}`;

            const response = await fetch(assetUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${asset.filename}: ${response.statusText}`);
            }
            const blob = await response.blob();
            zip.file(filePathInZip, blob);
        }

        const content = await zip.generateAsync({ type: "blob" }, function update(metadata) {
            // This is for internal JSZip progress, not directly tied to our UI progress bar
            // console.log("progression: " + metadata.percent.toFixed(2) + "%");
        });

        saveAs(content, "all_mod_assets.zip");
        consoleLog.textContent += `\n[SUCCESS] "all_mod_assets.zip" downloaded!\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;

    } catch (error) {
        console.error("Error generating or saving zip:", error);
        consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save ZIP: ${error.message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
        alert('Failed to generate or save the ZIP file. Please check console for errors.');
    } finally {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
        }, 3000); // Hide after 3 seconds
    }
}


// Generate ZIP for MODIFIED assets (used by "Create Mod Pack" button)
async function generateModPackZip(modifiedAssetIds) {
    const zip = new JSZip();
    let filesProcessed = 0;

    loadingOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    consoleLog.textContent = 'Starting Mod Pack generation...\n';

    try {
        for (const assetId of modifiedAssetIds) {
            filesProcessed++;
            updateProgress(filesProcessed, modifiedAssetIds.length, assetId.split('/').pop()); // Show just filename

            const mod = modifiedAssets.get(assetId);
            const originalAsset = allAssets.find(asset => getAssetId(asset) === assetId);

            if (!originalAsset) {
                console.warn(`Original asset for ${assetId} not found. Skipping.`);
                continue;
            }

            const filePathInZip = `${originalAsset.folder}/${originalAsset.filename}`;

            let fileBlob;

            if (mod && mod.drawing) {
                // If drawing exists, use the drawing as the new image
                // Convert Data URL to Blob
                const response = await fetch(mod.drawing);
                fileBlob = await response.blob();
            } else if (mod && (mod.color || (mod.saturation !== undefined && mod.saturation !== 100))) {
                // If only color/saturation, apply to original image
                fileBlob = await getModifiedImageData(originalAsset, mod.color, mod.saturation);
            } else {
                // Should not happen if filtered by modifiedAssets.keys(), but as a fallback
                console.warn(`No active modification for ${assetId}. Skipping or fetching original.`);
                const response = await fetch(`./mod-assets/${originalAsset.type.toLowerCase()}/${originalAsset.folder}/${originalAsset.filename}`);
                fileBlob = await response.blob();
            }

            zip.file(filePathInZip, fileBlob);
        }

        const content = await zip.generateAsync({ type: "blob" }, function update(metadata) {
            // This is for internal JSZip progress, not directly tied to our UI progress bar
            // console.log("progression: " + metadata.percent.toFixed(2) + "%");
        });

        saveAs(content, "custom_mod_pack.zip");
        consoleLog.textContent += `\n[SUCCESS] "custom_mod_pack.zip" downloaded!\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;

    } catch (error) {
        console.error("Error generating or saving mod pack zip:", error);
        consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save mod pack ZIP: ${error.message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
        alert('Failed to generate or save the mod pack ZIP file. Please check console for errors.');
    } finally {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
        }, 3000); // Hide after 3 seconds
    }
}