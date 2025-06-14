// Global variables for Mod Builder
let allAssetsForModding = []; // This will be populated by mod-builder itself
let modGroupsConfig = []; // This will be defined internally
let mirrorDrawing = false; // Global variable to control drawing mirroring

// Mod Builder DOM Elements
let modBuilderOverlay;
let modBuilderCloseButton;
let textureGroupList;
let createModPackButtonGroupsPage; // Button on the groups page
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
let mirrorDrawingCheckbox; // Checkbox for mirroring

// Mod Builder State
let currentGroupAssets = []; // Assets belonging to the currently selected group
let currentSelectedAsset = null; // The specific asset being modified (e.g., for drawing)
let currentDrawingContext; // 2D context for the drawing canvas

// Store modifications: { "assetId": { color: "#RRGGBB", saturation: "value", drawing: Blob/DataURL, resolution: {x,y}, backgroundColor: "color" } }
// assetId will be constructed as folder + '/' + filename for uniqueness
const modifiedAssets = new Map();

// Helper to get asset ID
function getAssetId(asset) {
    // Note: asset.folder here is the logical group folder, not the physical file system subfolder
    return `${asset.folder}/${asset.filename}`;
}

// Base URL for assets. This should be the root path where your pnglist.txt, jpgurl.txt,
// mp3list.txt, and the 'mod-assets' folder are located relative to your domain.
// E.g., if your website is example.com and mod-assets is at example.com/mod-assets, use '/'.
// If your app is at example.com/my-app/ and mod-assets is at example.com/my-app/mod-assets, use '/my-app/'.
const BASE_URL = '/';


// --- Mod Builder Configuration (MOVED HERE to be self-contained) ---
const modGroups = [
    {
        name: "Walls Sierra",
        folder: "WallsSierra", // Logical group folder, for categorization
        modifiable: true,
        files: ["Wall-Texture-dirty.jpg", "Wall-Texture-v1.jpg", "Wall-Texture-Snow.jpg", "Wall-Texture.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Walls Tundra",
        folder: "WallsTundra",
        modifiable: true,
        files: ["Wall-Texture-4M-Dungeon.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Walls Mistle",
        folder: "WallsMistle",
        modifiable: true,
        files: ["Green-Wall.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Sierra Top Floor",
        folder: "SierraTopFloor",
        modifiable: true,
        files: ["Floor-Low.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Sierra Ground",
        folder: "SierraGround",
        modifiable: true,
        files: ["Ground-Sand.png", "Sand-Corner.jpg", "Sierra-Grass.jpg", "Sierra-Road.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Sierra Temple Roof",
        folder: "SierraTempleRoof",
        modifiable: true,
        files: ["Hallway-Texture.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Sierra Pillar",
        folder: "SierraPillar",
        modifiable: true,
        files: ["Pillar-Texture.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Mistle Pillar",
        folder: "MistlePillar",
        modifiable: true,
        files: ["Snake-Pillar.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Mistle Rock",
        folder: "MistleRock",
        modifiable: true,
        files: ["rock_formation_01_wall_tile.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Xibalba Roof",
        folder: "XibalbaRoof",
        modifiable: true,
        files: ["floor_tile_01_metal.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Xibalba Cube",
        folder: "XibalbaCube",
        modifiable: true,
        files: ["Xibalba_Cube_BaseColor.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Tundra Cube",
        folder: "TundraCube",
        modifiable: true,
        files: ["Tundra_Cube_BaseColor.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Xibalba Walls & Buildings",
        folder: "XibalbaWallsBuildings",
        modifiable: true,
        files: ["dungeon_set_02_atlas_01.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Xibalba Floor Carve/Ornament",
        folder: "XibalbaFloorCarveOrnament",
        modifiable: true,
        files: ["Floor-Ornament.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Tundra Building Floor",
        folder: "TundraBuildingFloor",
        modifiable: true,
        files: ["snake_temple_floor_01_tex.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Mistle Tunnel",
        folder: "MistleTunnel",
        modifiable: true,
        files: ["Snake-Tunnel.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Tundra Ground",
        folder: "TundraGround",
        modifiable: true,
        files: ["snowy_rock.jpg", "ice.jpg", "snow.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Xibalba Gravestone",
        folder: "XibalbaGravestone",
        modifiable: true,
        files: ["T_PROP_gravestone_01_BC.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Sierra Roof Pillars",
        folder: "SierraRoofPillars",
        modifiable: true,
        files: ["wall-trials1.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "All Maps Sky",
        folder: "AllMapsSky",
        modifiable: true,
        files: [
            "wall-trials1.jpg", "FattySky00_Night_01.png", "FattySky00_Night_04.png", "FattySky00_Night_05.png",
            "FattySky00_Night_03.png", "FattySky00_Night_02.png", "FattySky00_Sunset_02.png", "FattySky00_Sunset_06.png",
            "FattySky00_Sunset_03.png", "FattySky00_Sunset_01.png", "FattySky00_Sunset_04.png", "FattySky00_Sunset_05.png",
            "FattySky00_Cloudy_06.png", "FattySky00_Cloudy_01.png", "FattySky00_Cloudy_03.png", "FattySky00_Cloudy_05.png",
            "FattySky00_Cloudy_02.png", "FattySky00_Cloudy_04.png", "FattySkybox03_Cloudy_01.png", "FattySkybox03_Cloudy_02.png",
            "FattySkybox03_Cloudy_04.png", "FattySkybox03_Cloudy_03.png", "FattySkybox03_Cloudy_06.png", "FattySkybox03_Cloudy_05.png",
            "FattySkybox03_Night_06.png", "FattySkybox03_Night_02.png", "FattySkybox03_Night_03.png", "FattySkybox03_Night_04.png",
            "FattySkybox03_Night_05.png", "FattySkybox03_Night_01.png", "FattySkybox03_Sunset_04.png", "FattySkybox03_Sunset_01.png",
            "FattySkybox03_Sunset_02.png", "FattySkybox03_Sunset_03.png", "FattySkybox03_Sunset_06.png", "FattySkybox03_Sunset_05.png",
            "FattySky00_Sunny_06.png", "FattySky00_Sunny_02.png", "FattySkybox03_Sunny_05.png", "FattySkybox03_Sunny_02.png",
            "FattySky00_Sunny_04.png", "FattySky00_Sunny_05.png", "FattySkybox03_Sunny_06.png", "FattySky00_Sunny_01.png",
            "FattySky00_Sunny_03.png", "FattySkybox03_Sunny_03.png", "FattySkybox03_Sunny_01.png", "FattySkybox03_Sunny_04.png",
            "FattySky00_Sunny_01.png"
        ],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Bounce Pad",
        folder: "BouncePad",
        modifiable: true,
        files: ["BouncePad-Texture.jpg"],
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    }
];

// Helper function to get the correct asset path based on file extension
function getAssetPath(filename) {
    const fileExtension = filename.split('.').pop().toLowerCase();
    if (fileExtension === 'jpg') {
        return `${BASE_URL}mod-assets/jpg/${filename}`;
    } else if (fileExtension === 'png') {
        return `${BASE_URL}mod-assets/png/${filename}`;
    } else if (fileExtension === 'mp3') {
        return `${BASE_URL}mod-assets/mp3/${filename}`;
    } else {
        console.warn(`[getAssetPath] Unknown file type for path construction: ${filename}`);
        return null; // Return null for unsupported types
    }
}


// Function to fetch assets specifically for Mod Builder
async function fetchAssetsForModBuilder() {
    try {
        allAssetsForModding.length = 0; // Clear previous assets if any

        // Fetch PNG files
        const pngResponse = await fetch(`${BASE_URL}pnglist.txt`);
        const pngText = pngResponse.ok ? await pngResponse.text() : '';
        const pngLines = pngText.trim().split('\n');
        for (const line of pngLines) {
            const [folder, filename] = line.split(' ');
            if (folder && filename) {
                // 'folder' here is the logical group name, 'type' is from extension
                allAssetsForModding.push({ folder, filename, type: 'png' });
            }
        }

        // Fetch JPG files
        const jpgResponse = await fetch(`${BASE_URL}jpgurl.txt`);
        const jpgText = jpgResponse.ok ? await jpgResponse.text() : '';
        const jpgLines = jpgText.trim().split('\n');
        for (const line of jpgLines) {
            const [folder, filename] = line.split(' ');
            if (folder && filename) {
                allAssetsForModding.push({ folder, filename, type: 'jpg' });
            }
        }

        // Fetch MP3 files
        const mp3Response = await fetch(`${BASE_URL}mp3list.txt`);
        const mp3Text = mp3Response.ok ? await mp3Response.text() : '';
        const mp3Lines = mp3Text.trim().split('\n');
        for (const line of mp3Lines) {
            const [folder, filename] = line.split(' ');
            if (folder && filename) {
                allAssetsForModding.push({ folder, filename, type: 'mp3' });
            }
        }

        console.log("Mod Builder fetched assets successfully for internal use.");
        console.log("allAssetsForModding contents:", allAssetsForModding); // ADDED FOR DEBUGGING
        modGroupsConfig = modGroups; // Assign the internally defined modGroups to config
    } catch (error) {
        console.error('Error fetching assets for Mod Builder:', error);
    }
}


// === MOD BUILDER UI FUNCTIONS ===

// Show/Hide Mod Builder Overlay
function showModBuilder() {
    modBuilderOverlay.classList.add('active');
    showTextureGroupList(); // Always show groups first when opening
}

function hideModBuilder() {
    modBuilderOverlay.classList.remove('active');
}

// Function to mark a group button as modified
function markGroupAsModified(folderName) {
    const groupButton = document.querySelector(`.mod-group-button[data-group-folder="${folderName}"]`);
    if (groupButton && !groupButton.classList.contains('has-modifications')) {
        groupButton.classList.add('has-modifications');
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
function unmarkGroupAsModified(folderName) {
    const groupButton = document.querySelector(`.mod-group-button[data-group-folder="${folderName}"]`);
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

// Show Texture Group List / Hide Customization Panel
function showTextureGroupList() {
    if (customizationPanel) customizationPanel.style.display = 'none';
    if (textureGroupList) textureGroupList.style.display = 'grid'; // Ensure grid for groups
    // The main Create Mod Pack button is always visible on this page
    if (createModPackButtonGroupsPage) createModPackButtonGroupsPage.style.display = 'block';
}

// Populate groups based on modGroupsConfig
function populateTextureGroups() {
    if (textureGroupList) textureGroupList.innerHTML = ''; // Clear previous buttons
    modGroupsConfig.forEach(group => {
        const button = document.createElement('button');
        button.className = 'mod-group-button';
        button.textContent = group.name;
        button.dataset.groupFolder = group.folder; // Store folder name for reference

        // Check if any asset in this group has modifications and mark button
        const assetsInGroup = allAssetsForModding.filter(asset => asset.folder === group.folder);
        const isGroupModified = assetsInGroup.some(asset => modifiedAssets.has(getAssetId(asset)));
        if (isGroupModified) {
            markGroupAsModified(group.folder);
        }

        if (group.modifiable) {
            button.addEventListener('click', () => {
                showCustomizationPanel(group);
            });
        } else {
            button.classList.add('non-modifiable');
            button.title = 'This group is not modifiable';
            button.onclick = () => alert('This group is not currently set as modifiable.');
        }
        if (textureGroupList) textureGroupList.appendChild(button);
    });
}

// Show Customization Panel for a selected group
async function showCustomizationPanel(group) {
    if (customizationPanelTitle) customizationPanelTitle.textContent = `Customize Group: ${group.name}`;
    if (createModPackButtonGroupsPage) createModPackButtonGroupsPage.style.display = 'none'; // Hide main mod pack button
    if (textureGroupList) textureGroupList.style.display = 'none';
    if (customizationPanel) customizationPanel.style.display = 'flex'; // Use flex for panel layout

    console.log("Showing customization panel for group:", group); // ADDED FOR DEBUGGING

    // Filter currentGroupAssets based on the selected group's folder AND file list
    // This is the crucial filter to ensure only relevant images for the clicked group are shown.
    currentGroupAssets = allAssetsForModding.filter(asset =>
        asset.folder === group.folder && // <--- CRITICAL FIX: Ensure asset's logical folder matches group's folder
        group.files.includes(asset.filename) &&
        asset.type !== 'mp3' // Only show image assets for customization
    );

    console.log("Filtered currentGroupAssets:", currentGroupAssets); // ADDED FOR DEBUGGING


    // Toggle visibility of customization options based on group config
    if (document.getElementById('color-customization-option')) document.getElementById('color-customization-option').style.display = group.canAdjustColor ? 'block' : 'none';
    if (document.getElementById('saturation-customization-option')) document.getElementById('saturation-customization-option').style.display = group.canAdjustSaturation ? 'block' : 'none';
    if (document.getElementById('drawing-customization-option')) document.getElementById('drawing-customization-option').style.display = group.canDraw ? 'block' : 'none';


    // Dynamically populate image previews in the customization panel
    const customizationOption = document.getElementById('drawing-customization-option');
    let imagePreviewsContainer = customizationOption ? customizationOption.querySelector('.image-previews-container') : null;
    if (!imagePreviewsContainer && customizationOption) {
        imagePreviewsContainer = document.createElement('div');
        imagePreviewsContainer.className = 'image-previews-container';
        // Insert before drawing canvas for better layout
        customizationOption.insertBefore(imagePreviewsContainer, drawingCanvas);
    }
    if (imagePreviewsContainer) imagePreviewsContainer.innerHTML = ''; // Clear existing previews

    if (currentGroupAssets.length === 0) {
        if (imagePreviewsContainer) imagePreviewsContainer.innerHTML = '<p style="color: #bbb; text-align: center;">No modifiable image assets in this group.</p>';
        // Reset drawing panel if no images
        currentSelectedAsset = null;
        if (drawingCanvas) {
            drawingCanvas.width = 256;
            drawingCanvas.height = 256;
            if (currentDrawingContext) currentDrawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
        if (drawingResXInput) drawingResXInput.value = 256;
        if (drawingResYInput) drawingResYInput.value = 256;
        return; // Exit here as no modifiable assets for this group
    }

    // Load first image as the default for drawing canvas and initial UI state
    currentSelectedAsset = currentGroupAssets[0];
    await loadImageForDrawing(currentSelectedAsset);
    // Apply any existing modifications (color/saturation/drawing) to the main canvas and UI
    applyExistingModificationsToCanvas(currentSelectedAsset);


    // Populate the preview container with actual image previews or placeholder if not image
    for (const asset of currentGroupAssets) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.assetId = getAssetId(asset); // For easy selection tracking

        // No need for type check, already filtered currentGroupAssets to exclude mp3
        const imgPath = getAssetPath(asset.filename); // Use getAssetPath for correct loading!
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

        const filenameP = document.createElement('p');
        filenameP.textContent = asset.filename;
        previewItem.appendChild(filenameP);

        previewItem.addEventListener('click', async () => {
            // Remove active class from previous preview item
            const currentActive = imagePreviewsContainer ? imagePreviewsContainer.querySelector('.preview-item.active') : null;
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            previewItem.classList.add('active'); // Add active class to clicked item

            currentSelectedAsset = asset; // Set the asset for modification
            await loadImageForDrawing(currentSelectedAsset); // Load this image onto the main drawing canvas
            applyExistingModificationsToCanvas(currentSelectedAsset); // Apply any existing mods
        });

        if (imagePreviewsContainer) imagePreviewsContainer.appendChild(previewItem);
    }
    // Set first preview as active by default
    if (imagePreviewsContainer && imagePreviewsContainer.firstChild) {
        imagePreviewsContainer.firstChild.classList.add('active');
    }
}


// === MODIFICATION LOGIC ===

// Loads an image onto the drawing canvas
async function loadImageForDrawing(asset) {
    if (!currentDrawingContext || !drawingCanvas || !drawingResXInput || !drawingResYInput || !backgroundColorPicker) {
        console.error("Drawing elements not fully initialized for loadImageForDrawing.");
        return;
    }

    // Handle cases where no image asset is selected or it's an MP3 (drawing canvas will be blank)
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
        img.src = getAssetPath(asset.filename); // Use getAssetPath for correct loading!
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
    if (!asset || !colorPicker || !saturationSlider || !backgroundColorPicker || !drawingResXInput || !drawingResYInput) return;

    const assetId = getAssetId(asset);
    const mod = modifiedAssets.get(assetId);

    // Reset UI elements first
    colorPicker.value = '#ffffff';
    saturationSlider.value = 100;
    updateSaturationValueDisplay();
    clearDrawingCanvas(); // Clear drawing canvas to prepare for new/existing drawing
    backgroundColorPicker.value = '#000000'; // Default background color

    // Load the base image for drawing canvas again to ensure it's clean before applying mods
    await loadImageForDrawing(asset); // This will draw the original image or fill with background.

    if (mod) {
        if (mod.color) {
            colorPicker.value = mod.color;
        }
        if (mod.saturation) {
            saturationSlider.value = mod.saturation;
            updateSaturationValueDisplay();
        }
        if (mod.drawing) {
            // If there's an existing drawing, load it onto the canvas
            const img = new Image();
            img.src = mod.drawing; // This is a Data URL or Blob URL
            img.onload = () => {
                const resX = parseInt(drawingResXInput.value);
                const resY = parseInt(drawingResYInput.value);
                if (drawingCanvas && currentDrawingContext) {
                    drawingCanvas.width = resX;
                    drawingCanvas.height = resY;
                    // Redraw background first based on current picker value
                    currentDrawingContext.fillStyle = backgroundColorPicker.value;
                    currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                    // Then draw the saved drawing on top
                    currentDrawingContext.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
                }
            };
            if (mod.resolution) {
                drawingResXInput.value = mod.resolution.x;
                drawingResYInput.value = mod.resolution.y;
            }
        }
        if (mod.backgroundColor) {
            backgroundColorPicker.value = mod.backgroundColor;
            // If a drawing is present, need to re-apply background then drawing
            if (mod.drawing && drawingCanvas && currentDrawingContext) {
                   const img = new Image();
                   img.src = mod.drawing;
                   img.onload = () => {
                       currentDrawingContext.fillStyle = backgroundColorPicker.value;
                       currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                       currentDrawingContext.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
                   };
            } else if (drawingCanvas && currentDrawingContext) {
                // If no drawing, just update background without redrawing anything on top
                currentDrawingContext.fillStyle = backgroundColorPicker.value;
                currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
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
    if (!colorPicker) return;

    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId) || {};
    mod.color = colorPicker.value;
    modifiedAssets.set(assetId, mod);
    markGroupAsModified(currentSelectedAsset.folder);
    alert(`Color applied to ${currentSelectedAsset.filename}!`);
}

function clearColorModification() {
    if (!currentSelectedAsset) return;
    if (!colorPicker) return;

    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId);
    if (mod && mod.color) {
        delete mod.color;
        if (Object.keys(mod).length === 0) {
            modifiedAssets.delete(assetId);
            const assetsInGroup = allAssetsForModding.filter(asset => asset.folder === currentSelectedAsset.folder);
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
    if (saturationSlider && saturationValueDisplay) {
        saturationValueDisplay.textContent = `${saturationSlider.value}%`;
    }
}

function applySaturationModification() {
    if (!currentSelectedAsset) {
        alert('Please select an image asset to modify.');
        return;
    }
    if (!saturationSlider) return;

    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId) || {};
    mod.saturation = parseInt(saturationSlider.value);
    modifiedAssets.set(assetId, mod);
    markGroupAsModified(currentSelectedAsset.folder);
    alert(`Saturation applied to ${currentSelectedAsset.filename}!`);
}

function clearSaturationModification() {
    if (!currentSelectedAsset) return;
    if (!saturationSlider) return;

    const assetId = getAssetId(currentSelectedAsset);
    let mod = modifiedAssets.get(assetId);
    if (mod && mod.saturation) {
        delete mod.saturation;
        if (Object.keys(mod).length === 0) {
            modifiedAssets.delete(assetId);
            const assetsInGroup = allAssetsForModding.filter(asset => asset.folder === currentSelectedAsset.folder);
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
    if (!drawingCanvas || !currentDrawingContext || !backgroundColorPicker || !drawingResXInput || !drawingResYInput) {
        console.error("drawingCanvas or its context/inputs not found for setupDrawing!");
        return;
    }

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
    if (!isDrawing || !currentDrawingContext || !drawingColorPicker) return;

    currentDrawingContext.strokeStyle = drawingColorPicker.value;
    currentDrawingContext.lineWidth = 2; // Fixed brush size for now
    currentDrawingContext.lineCap = 'round';
    currentDrawingContext.lineJoin = 'round';

    // Get current coordinates
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    // Draw original stroke
    currentDrawingContext.beginPath();
    currentDrawingContext.moveTo(lastX, lastY);
    currentDrawingContext.lineTo(currentX, currentY);
    currentDrawingContext.stroke();

    // Draw mirrored stroke if mirrorDrawing is enabled
    if (mirrorDrawing) {
        const mirroredLastX = drawingCanvas.width - lastX;
        const mirroredCurrentX = drawingCanvas.width - currentX;

        currentDrawingContext.beginPath();
        currentDrawingContext.moveTo(mirroredLastX, lastY);
        currentDrawingContext.lineTo(mirroredCurrentX, currentY);
        currentDrawingContext.stroke();
    }

    // Update last coordinates for next stroke
    [lastX, lastY] = [currentX, currentY];
}

function clearDrawingCanvas() {
    if (currentDrawingContext && drawingCanvas && backgroundColorPicker) {
        currentDrawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        currentDrawingContext.fillStyle = backgroundColorPicker.value; // Fill with current background color
        currentDrawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
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
    if (!drawingResXInput || !drawingResYInput || !drawingCanvas || !currentDrawingContext || !backgroundColorPicker) {
        console.error("Missing elements for updateCanvasResolution.");
        return;
    }

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
    if (!drawingResXInput || !drawingResYInput || !drawingCanvas || !backgroundColorPicker) return;

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
            const assetsInGroup = allAssetsForModding.filter(asset => asset.folder === currentSelectedAsset.folder);
            const isGroupModified = assetsInGroup.some(asset => modifiedAssets.has(getAssetId(asset)));
            if (!isGroupModified) {
                unmarkGroupAsModified(currentSelectedAsset.folder);
            }
        } else {
            modifiedAssets.set(assetId, mod);
        }
        clearDrawingCanvas(); // Clear canvas and refill with background color
        // Reload original image to drawing canvas if asset exists and there are no other mods.
        loadImageForDrawing(currentSelectedAsset);
        alert(`Drawing cleared for ${currentSelectedAsset.filename}.`);
    }
}


// === ZIP GENERATION FUNCTIONS (for mod pack) ===

// Generic function to display progress (shares DOM elements with asset-list-page.js)
// Assumes loadingOverlay, progressBar, progressPercentage, consoleLog are globally accessible
// (they are initialized in asset-list-page.js and are global in the browser window)
function updateProgress(current, total, filename = '') {
    // Check if elements exist before trying to update (they might not if asset-list.js failed or loaded after)
    // Access global variables from the window object
    const glLoadingOverlay = window.loadingOverlay;
    const glProgressBar = window.progressBar;
    const glProgressPercentage = window.progressPercentage;
    const glConsoleLog = window.consoleLog;

    if (glProgressBar && glProgressPercentage && glConsoleLog) {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        glProgressBar.style.width = `${percentage}%`;
        glProgressPercentage.textContent = `${percentage}%`;
        glConsoleLog.textContent += `Adding: ${filename}...\n`;
        glConsoleLog.scrollTop = glConsoleLog.scrollHeight; // Auto-scroll
    }
}

// Function to fetch an image and apply modifications (color/saturation)
async function getModifiedImageData(asset, color, saturation) {
    return new Promise(async (resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Required for tainted canvas with some images
        img.src = getAssetPath(asset.filename); // Use getAssetPath for correct loading!

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
                // Apply filter to the entire canvas content after color or original image
                // Note: Filter is a property of the context, subsequent draws will be affected.
                // It's more robust to draw the image with the filter if possible, or apply it to pixel data.
                // For simplicity here, we re-draw with filter.
                ctx.filter = `saturate(${saturation}%)`;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Re-draw original image with saturation
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


// Generate ZIP for MODIFIED assets (used by "Create Mod Pack" button)
async function generateModPackZip(modifiedAssetIds) {
    const zip = new JSZip();
    let filesProcessed = 0;

    // Access global variables from the window object
    const glLoadingOverlay = window.loadingOverlay;
    const glProgressBar = window.progressBar;
    const glProgressPercentage = window.progressPercentage;
    const glConsoleLog = window.consoleLog;

    // Ensure loading overlay is active
    if (glLoadingOverlay) glLoadingOverlay.classList.add('active');
    if (glProgressBar) glProgressBar.style.width = '0%';
    if (glProgressPercentage) glProgressPercentage.textContent = '0%';
    if (glConsoleLog) glConsoleLog.textContent = 'Starting Mod Pack generation...\n';

    try {
        for (const assetId of modifiedAssetIds) {
            filesProcessed++;
            updateProgress(filesProcessed, modifiedAssetIds.length, assetId.split('/').pop()); // Show just filename

            const mod = modifiedAssets.get(assetId);
            const originalAsset = allAssetsForModding.find(asset => getAssetId(asset) === assetId);

            if (!originalAsset) {
                console.warn(`Original asset for ${assetId} not found in modding list. Skipping.`);
                continue;
            }

            // The filePathInZip should follow your desired output structure, which usually involves the logical group folder
            const filePathInZip = `${originalAsset.folder}/${originalAsset.filename}`;

            let fileBlob;

            if (mod && mod.drawing) {
                // If drawing exists, use the drawing as the new image (which already has the background and drawing)
                const response = await fetch(mod.drawing); // mod.drawing is a Data URL
                fileBlob = await response.blob();
            } else if (mod && (mod.color || (mod.saturation !== undefined && mod.saturation !== 100))) {
                // If only color/saturation, apply to original image and get the modified blob
                fileBlob = await getModifiedImageData(originalAsset, mod.color, mod.saturation);
            } else {
                // Fallback: If no modification, fetch the original file. This branch should ideally not be hit if filtered by modifiedAssets.keys().
                console.warn(`No specific drawing/color/saturation mod found for ${assetId}. Using original for ZIP.`);
                const response = await fetch(getAssetPath(originalAsset.filename)); // Use getAssetPath for original
                fileBlob = await response.blob();
            }

            zip.file(filePathInZip, fileBlob);
        }

        const content = await zip.generateAsync({ type: "blob" }, function update(metadata) {
            // This is for internal JSZip progress, not directly tied to our UI progress bar
            // console.log("progression: " + metadata.percent.toFixed(2) + "%");
        });

        saveAs(content, "custom_mod_pack.zip");
        if (glConsoleLog) glConsoleLog.textContent += `\n[SUCCESS] "custom_mod_pack.zip" downloaded!\n`;
        if (glConsoleLog) glConsoleLog.scrollTop = glConsoleLog.scrollHeight;

    } catch (error) {
        console.error("Error generating or saving mod pack zip:", error);
        if (glConsoleLog) glConsoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save mod pack ZIP: ${error.message}\n`;
        if (glConsoleLog) glConsoleLog.scrollTop = glConsoleLog.scrollHeight;
        alert('Failed to generate or save the mod pack ZIP file. Please check console for errors.');
    } finally {
        setTimeout(() => {
            if (glLoadingOverlay) glLoadingOverlay.classList.remove('active');
        }, 3000); // Hide after 3 seconds
    }
}


// === Initialization Function for Mod Builder ===
// This will now be called on mod-builder.js's own DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize DOM elements for Mod Builder
    modBuilderOverlay = document.getElementById('mod-builder-overlay');
    modBuilderCloseButton = document.getElementById('mod-builder-close-button');
    textureGroupList = document.getElementById('texture-group-list');
    createModPackButtonGroupsPage = document.getElementById('create-mod-pack-button-groups-page');
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
    mirrorDrawingCheckbox = document.getElementById('mirror-drawing-checkbox');

 
    // Fetch assets for mod builder
    await fetchAssetsForModBuilder(); // This populates allAssetsForModding and modGroupsConfig

    // Basic Mod Builder UI Setup
    if (modBuilderOverlay && modBuilderCloseButton && textureGroupList && customizationPanel && modBackButton) {
        // Event Listeners
        modBuilderCloseButton.addEventListener('click', hideModBuilder);
        modBackButton.addEventListener('click', showTextureGroupList);
        if (applyColorButton) applyColorButton.addEventListener('click', applyColorModification);
        if (clearColorButton) clearColorButton.addEventListener('click', clearColorModification);
        if (saturationSlider) saturationSlider.addEventListener('input', updateSaturationValueDisplay);
        if (applySaturationButton) applySaturationButton.addEventListener('click', applySaturationModification);
        if (clearSaturationButton) clearSaturationButton.addEventListener('click', clearSaturationModification);
        if (applyDrawingButton) applyDrawingButton.addEventListener('click', applyDrawingModification);
        if (clearDrawingButton) clearDrawingButton.addEventListener('click', clearDrawingModification);

        // Resolution input event listeners with validation
        if (drawingResXInput) drawingResXInput.addEventListener('input', (e) => validateResolutionInput(e.target));
        if (drawingResYInput) drawingResYInput.addEventListener('input', (e) => validateResolutionInput(e.target));

        // Event listener for mirroring checkbox
        if (mirrorDrawingCheckbox) {
            mirrorDrawingCheckbox.addEventListener('change', (e) => {
                mirrorDrawing = e.target.checked;
                console.log(`Mirror drawing set to: ${mirrorDrawing}`);
            });
        }


        // Event listener for the "Create Mod Pack" button on the groups page
        if (createModPackButtonGroupsPage) {
            createModPackButtonGroupsPage.addEventListener('click', () => {
                const modifiedAssetPaths = Array.from(modifiedAssets.keys()); // Get unique modified asset IDs
                if (modifiedAssetPaths.length === 0) {
                    alert('No modifications to create a mod pack for. Please make some changes first!');
                    return;
                }
                generateModPackZip(modifiedAssetPaths);
            });
        }

        // Drawing functionality setup
        if (drawingCanvas) {
            currentDrawingContext = drawingCanvas.getContext('2d');
            setupDrawing(); // Initialize drawing canvas event listeners
        }


        // Initial population of groups
        populateTextureGroups();

        // Enable the "Create Mod Pack" button only if there are existing mods
        if (createModPackButtonGroupsPage) {
            createModPackButtonGroupsPage.disabled = modifiedAssets.size === 0;
        }

        // Add a button to open the mod builder to the main page (if it doesn't already exist)
        let modBuilderOpenButton = document.getElementById('open-mod-builder-button');
        if (!modBuilderOpenButton) {
            modBuilderOpenButton = document.createElement('button');
            modBuilderOpenButton.id = 'open-mod-builder-button';
            modBuilderOpenButton.className = 'search-button'; // Re-use styling
            modBuilderOpenButton.innerHTML = '<i class="fas fa-hammer"></i> Mod Builder';
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.appendChild(modBuilderOpenButton);
                modBuilderOpenButton.addEventListener('click', showModBuilder);
            }
        }

    } else {
        console.error('One or more required Mod Builder DOM elements not found during initialization!');
    }
});
