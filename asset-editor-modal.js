// asset-editor-modal.js
// This file handles all the interactive logic for the Asset Editor Modal.

// DOM Elements for the Modal
let assetEditorModal;
let closeEditorModalButton;
let modalAssetName;
let tabModify;
let tabCreate;
let contentModify;
let contentCreate;
let saturationSlider;
let saturationValueDisplay;
let textureEditorCanvas;
let textureEditorCtx;
let newTextureWidthInput;
let newTextureHeightInput;
let newTextureColorInput;
let saveModifiedTextureButton;
let saveNewTextureButton;

// Global variables to hold the reference(s) to the asset(s) being currently edited
// This will be an object from the `allAssets` array in asset-list-page.js for single edit,
// or an array of such objects for group edit.
let currentEditedAssets = []; // Changed to array for group editing
let isGroupEdit = false; // New flag to indicate if currently in group edit mode

let currentImage = new Image(); // Image object to draw on canvas (for preview in single/group edit)

document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary DOM elements for the modal
    assetEditorModal = document.getElementById('asset-editor-modal');
    closeEditorModalButton = document.getElementById('close-editor-modal');
    modalAssetName = document.getElementById('modal-asset-name');
    tabModify = document.getElementById('tab-modify');
    tabCreate = document.getElementById('tab-create');
    contentModify = document.getElementById('content-modify');
    contentCreate = document.getElementById('content-create');
    saturationSlider = document.getElementById('saturation-slider');
    saturationValueDisplay = document.getElementById('saturation-value');
    textureEditorCanvas = document.getElementById('texture-editor-canvas');
    textureEditorCtx = textureEditorCanvas.getContext('2d', { willReadFrequently: true });
    newTextureWidthInput = document.getElementById('new-texture-width');
    newTextureHeightInput = document.getElementById('new-texture-height');
    newTextureColorInput = document.getElementById('new-texture-color');
    saveModifiedTextureButton = document.getElementById('save-modified-texture');
    saveNewTextureButton = document.getElementById('save-new-texture');

    // Event Listeners for Modal
    closeEditorModalButton.addEventListener('click', closeAssetEditorModal);
    assetEditorModal.addEventListener('click', (e) => {
        if (e.target === assetEditorModal) {
            closeAssetEditorModal();
        }
    });

    // Tab switching logic
    tabModify.addEventListener('click', () => switchTab('modify'));
    tabCreate.addEventListener('click', () => switchTab('create'));

    // Saturation slider logic
    saturationSlider.addEventListener('input', () => {
        const value = saturationSlider.value;
        saturationValueDisplay.textContent = `${value}%`;
        drawTextureOnCanvas(); // Redraw with new saturation
    });

    // Save buttons
    saveModifiedTextureButton.addEventListener('click', saveModifiedTexture);
    saveNewTextureButton.addEventListener('click', saveNewTexture);
});

/**
 * Switches between modal tabs.
 * @param {string} tabName 'modify' or 'create'
 */
function switchTab(tabName) {
    // Deactivate all tabs and hide all content
    tabModify.classList.remove('active');
    tabCreate.classList.remove('active');
    contentModify.style.display = 'none';
    contentCreate.style.display = 'none';

    // Activate the selected tab and show its content
    if (tabName === 'modify') {
        tabModify.classList.add('active');
        contentModify.style.display = 'block';
        // When switching to modify, ensure canvas reflects current state
        drawTextureOnCanvas();
    } else if (tabName === 'create') {
        tabCreate.classList.add('active');
        contentCreate.style.display = 'block';
    }
}


/**
 * Opens the asset editor modal.
 * @param {Object|Array<Object>} assets The asset object or an array of asset objects to edit.
 * @param {HTMLElement|null} cardElement The DOM card element associated with the asset (for single edit), or null for group edit.
 * @param {boolean} groupEditFlag True if this is a group edit, false otherwise.
 */
window.openAssetEditorModal = async (assets, cardElement = null, groupEditFlag = false) => {
    isGroupEdit = groupEditFlag;
    currentEditedAssets = Array.isArray(assets) ? assets : [assets]; // Ensure it's always an array

    if (currentEditedAssets.length === 0) {
        console.error('No assets provided to openAssetEditorModal.');
        return;
    }

    // Determine modal title
    if (isGroupEdit) {
        modalAssetName.textContent = `Group Editing (${currentEditedAssets.length} Images)`;
        // Disable Create New Texture tab for group edits if it doesn't make sense to apply one new name to multiple originals
        tabCreate.style.display = 'none';
        switchTab('modify'); // Default to modify tab for group edits
    } else {
        const asset = currentEditedAssets[0]; // For single edit, take the first asset
        modalAssetName.textContent = `${asset.folder}/${asset.filename}`;
        tabCreate.style.display = 'block'; // Show create tab for single asset
        switchTab('modify'); // Default to modify for single asset
    }

    // Reset saturation slider and value
    saturationSlider.value = 100;
    saturationValueDisplay.textContent = '100%';

    // Load the image for the canvas preview (always the first asset for group edit preview)
    const previewAsset = currentEditedAssets[0];

    // Fetch original image if not already loaded, or use modified/new if available
    let imageUrl;
    if (previewAsset.newImageBlob) {
        imageUrl = URL.createObjectURL(previewAsset.newImageBlob);
    } else if (previewAsset.modifiedImageBlob) {
        imageUrl = URL.createObjectURL(previewAsset.modifiedImageBlob);
    } else if (previewAsset.originalImageBlob) {
        imageUrl = URL.createObjectURL(previewAsset.originalImageBlob);
    } else {
        // Fallback to fetching from path if no blobs are available
        imageUrl = previewAsset.mediaPath;
    }

    currentImage.onload = () => {
        textureEditorCanvas.width = currentImage.naturalWidth;
        textureEditorCanvas.height = currentImage.naturalHeight;
        drawTextureOnCanvas();
        if (imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl); // Clean up blob URL after image is loaded
        }
    };
    currentImage.onerror = () => {
        console.error('Failed to load image for modal:', imageUrl);
        // Display an error on the canvas or modal
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
        textureEditorCtx.fillStyle = '#FF6347'; // Tomato red
        textureEditorCtx.fillRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
        textureEditorCtx.fillStyle = 'white';
        textureEditorCtx.font = '20px Arial';
        textureEditorCtx.textAlign = 'center';
        textureEditorCtx.fillText('Error loading image', textureEditorCanvas.width / 2, textureEditorCanvas.height / 2);
        if (imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
    };
    currentImage.src = imageUrl;

    assetEditorModal.classList.add('active'); // Show modal
};


/**
 * Closes the asset editor modal.
 */
function closeAssetEditorModal() {
    assetEditorModal.classList.remove('active');
    currentEditedAssets = []; // Clear current edited assets
    isGroupEdit = false; // Reset group edit flag
    // Potentially revoke any remaining object URLs if not already done
}


/**
 * Draws the current image on the canvas with applied saturation.
 */
function drawTextureOnCanvas() {
    if (!currentImage.complete || currentImage.naturalWidth === 0) {
        // Image not ready or invalid, skip drawing
        return;
    }

    textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);

    // Apply saturation filter
    const saturationValue = parseFloat(saturationSlider.value) / 100;
    textureEditorCtx.filter = `saturate(${saturationValue})`;

    textureEditorCtx.drawImage(currentImage, 0, 0, textureEditorCanvas.width, textureEditorCanvas.height);

    // Reset filter for other drawings if any
    textureEditorCtx.filter = 'none';
}


/**
 * Applies saturation to a given image (or its blob) and returns a new blob.
 * This is a helper function that can be called for individual assets.
 * @param {Image} img The Image object to modify.
 * @param {number} saturation The saturation value (e.g., 1.0 for 100%, 0.5 for 50%).
 * @returns {Promise<Blob>} A Promise that resolves with the new image Blob.
 */
async function applySaturationToImage(img, saturation) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;

    tempCtx.filter = `saturate(${saturation})`;
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.filter = 'none'; // Reset filter

    return new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
}


/**
 * Saves the modified texture (applied saturation) to the asset object(s).
 */
async function saveModifiedTexture() {
    if (currentEditedAssets.length === 0) {
        console.error('No assets to save modified texture for.');
        return;
    }

    const saturationValue = parseFloat(saturationSlider.value) / 100;

    // Process each asset in currentEditedAssets
    for (const asset of currentEditedAssets) {
        let imageToModify = new Image();
        // Determine which image source to use: modified > new > original > mediaPath
        let imageUrlToLoad;
        if (asset.modifiedImageBlob) {
            imageUrlToLoad = URL.createObjectURL(asset.modifiedImageBlob);
        } else if (asset.newImageBlob) {
            imageUrlToLoad = URL.createObjectURL(asset.newImageBlob);
        } else if (asset.originalImageBlob) {
            imageUrlToLoad = URL.createObjectURL(asset.originalImageBlob);
        } else {
            imageUrlToLoad = asset.mediaPath;
        }

        imageToModify.onload = async () => {
            try {
                const newBlob = await applySaturationToImage(imageToModify, saturationValue);
                asset.modifiedImageBlob = newBlob;
                asset.isModified = true;
                asset.isNew = false; // It's now a modification, not a new texture

                console.log(`Texture modified for: ${asset.filename}`);
                if (typeof window.updateCardVisualState === 'function') {
                    window.updateCardVisualState(asset);
                } else {
                    console.error('updateCardVisualState function not found in global scope.');
                }
                if (imageUrlToLoad.startsWith('blob:')) {
                    URL.revokeObjectURL(imageUrlToLoad);
                }
            } catch (error) {
                console.error(`Error applying saturation to ${asset.filename}:`, error);
                if (imageUrlToLoad.startsWith('blob:')) {
                    URL.revokeObjectURL(imageUrlToLoad);
                }
            }
        };
        imageToModify.onerror = () => {
            console.error(`Failed to load image for modification: ${asset.filename} from ${imageUrlToLoad}`);
            if (imageUrlToLoad.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrlToLoad);
            }
        };
        imageToModify.src = imageUrlToLoad;
    }

    closeAssetEditorModal();
}

/**
 * Saves a newly created texture to the asset object(s).
 */
async function saveNewTexture() {
    if (currentEditedAssets.length === 0) {
        console.error('No assets to save new texture for.');
        return;
    }

    // We only allow "Create New Texture" for single edit or if logic is specifically added for group
    // For now, assume it applies the same new texture to all selected if in group mode.
    // However, the tab is hidden for group edit in current implementation, so this should only fire for single.
    if (isGroupEdit && currentEditedAssets.length > 1) {
        console.warn('Attempted to create new texture in group edit mode. This is currently not supported for distinct names per asset, applying one new texture to all selected.');
        // For group create, we would generate ONE new texture and apply it to ALL.
        // This is the intended behavior: create one 'template' texture and assign it to multiple assets.
    }


    const width = parseInt(newTextureWidthInput.value);
    const height = parseInt(newTextureHeightInput.value);
    const color = newTextureColorInput.value;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        console.error('Invalid width or height for new texture.');
        // Consider adding a visible message to the user here instead of just console.error
        return;
    }

    // Create a temporary canvas to draw the new texture
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, width, height);

    try {
        const newTextureBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));

        // Apply this single new texture to all assets in the currentEditedAssets array
        for (const asset of currentEditedAssets) {
            asset.newImageBlob = newTextureBlob; // Assign the same new blob
            asset.isNew = true;
            asset.isModified = false; // Ensure it's not marked as a modification
            asset.originalImageBlob = null; // Clear original if replaced by new texture

            console.log(`New texture applied for: ${asset.filename}`);
            // IMPORTANT: Update the visual state of the card
            if (typeof window.updateCardVisualState === 'function') {
                window.updateCardVisualState(asset);
            } else {
                console.error('updateCardVisualState function not found in global scope.');
            }
        }
        closeAssetEditorModal();
    } catch (error) {
        console.error('Error creating new texture blob:', error);
    }
}

// Global scope function (will be called from asset-list-page.js)
// window.openAssetEditorModal is already defined above.