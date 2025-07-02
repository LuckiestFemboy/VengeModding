/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


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
let textureEditorImageInput; // New: for uploading an image to modify
let textureEditorImagePreview; // New: for previewing uploaded image

// Global variable to hold the reference to the asset being currently edited
// This will be an object from the `allAssets` array in asset-list-page.js
let currentEditedAsset = null;
let currentImage = new Image(); // Image object to draw on canvas


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
    textureEditorCtx = textureEditorCanvas.getContext('2d');
    newTextureWidthInput = document.getElementById('new-texture-width');
    newTextureHeightInput = document.getElementById('new-texture-height');
    newTextureColorInput = document.getElementById('new-texture-color');
    saveModifiedTextureButton = document.getElementById('save-modified-texture');
    saveNewTextureButton = document.getElementById('save-new-texture');
    textureEditorImageInput = document.getElementById('texture-editor-image-input');
    textureEditorImagePreview = document.getElementById('texture-editor-image-preview');


    // Event Listeners
    if (closeEditorModalButton) {
        closeEditorModalButton.addEventListener('click', closeAssetEditorModal);
    }
    // Close modal if clicked outside content
    if (assetEditorModal) {
        assetEditorModal.addEventListener('click', (event) => {
            if (event.target === assetEditorModal) {
                closeAssetEditorModal();
            }
        });
    }

    if (tabModify && tabCreate && contentModify && contentCreate) {
        tabModify.addEventListener('click', () => showTab('modify'));
        tabCreate.addEventListener('click', () => showTab('create'));
    }

    if (saturationSlider && saturationValueDisplay && saveModifiedTextureButton) {
        saturationSlider.addEventListener('input', (event) => {
            saturationValueDisplay.textContent = event.target.value;
            applyFilter(); // Apply filter live
        });
        saveModifiedTextureButton.addEventListener('click', saveModifiedTexture);
    }

    if (saveNewTextureButton) {
        saveNewTextureButton.addEventListener('click', createNewTexture);
    }

    if (textureEditorImageInput) {
        textureEditorImageInput.addEventListener('change', handleImageUploadForModification);
    }

    // Set initial active tab
    showTab('modify');
});


// --- Modal Visibility and State Management ---

/**
 * Opens the asset editor modal and sets up the asset for editing.
 * @param {Object} asset The asset object to be edited.
 * @param {HTMLElement} cardElement The DOM element of the card associated with the asset.
 */
window.openAssetEditorModal = async (asset, cardElement) => {
    if (!asset || !assetEditorModal) {
        console.error('Asset or modal element not found.');
        return;
    }

    // If an asset is opened for editing, it means the user intends to use it,
    // so it should not be excluded from export.
    if (asset.isExcluded) {
        asset.isExcluded = false; // Unmark as excluded
        if (typeof window.updateCardVisualState === 'function') {
            window.updateCardVisualState(asset); // Update card to remove 'is-excluded' style
        }
        window.updateConsoleLog(`Asset '${asset.filename}' deselected from exclusion due to editing.`);
    }

    currentEditedAsset = asset; // Store reference to the asset
    assetEditorModal.classList.add('active'); // Show the modal
    modalAssetName.textContent = `${asset.filename} (Folder: ${asset.folder})`;

    // Reset and prepare for modification tab
    showTab('modify');
    saturationSlider.value = 100;
    saturationValueDisplay.textContent = 100;

    // Reset the texture upload input and preview
    textureEditorImageInput.value = ''; // Clear selected file
    textureEditorImagePreview.src = '';
    textureEditorImagePreview.style.display = 'none'; // Hide preview

    // Load the image onto the canvas for modification
    // Prioritize modifiedImageBlob, then newImageBlob, then originalImageBlob, then mediaPath
    const sourceBlobOrPath = asset.modifiedImageBlob || asset.newImageBlob || asset.originalImageBlob || asset.mediaPath;

    if (sourceBlobOrPath instanceof Blob) {
        currentImage.src = URL.createObjectURL(sourceBlobOrPath);
    } else if (typeof sourceBlobOrPath === 'string') {
        currentImage.src = sourceBlobOrPath;
    } else {
        console.error('No valid image source found for currentEditedAsset.');
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height); // Clear canvas
        return;
    }

    window.showLoadingOverlay('Loading Image for Editor...');
    currentImage.onload = () => {
        URL.revokeObjectURL(currentImage.src); // Clean up blob URL if created

        // Set canvas dimensions to image dimensions
        textureEditorCanvas.width = currentImage.naturalWidth;
        textureEditorCanvas.height = currentImage.naturalHeight;

        // Draw image initially without filters
        textureEditorCtx.filter = 'none';
        textureEditorCtx.drawImage(currentImage, 0, 0);

        window.hideLoadingOverlayWithDelay(500, 'Editor Ready!');
        window.updateConsoleLog(`Loaded ${asset.filename} into editor.`);
    };
    currentImage.onerror = (e) => {
        console.error('Error loading image into editor canvas:', e);
        window.updateConsoleLog(`[ERROR] Failed to load ${asset.filename} into editor.`);
        window.hideLoadingOverlayWithDelay(1000, 'Error Loading Image!');
        // Clear canvas and reset
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
        URL.revokeObjectURL(currentImage.src); // Clean up
    };
};

function closeAssetEditorModal() {
    if (assetEditorModal) {
        assetEditorModal.classList.remove('active');
        currentEditedAsset = null; // Clear the reference
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height); // Clear canvas
        currentImage.src = ''; // Clear image source
        // No need to revoke URL here, as it's done in image.onload
        window.updateConsoleLog('Editor closed.');
    }
}

function showTab(tabName) {
    // Deactivate all tabs and content
    tabModify.classList.remove('active');
    tabCreate.classList.remove('active');
    contentModify.classList.remove('active');
    contentCreate.classList.remove('active');

    // Activate the selected tab and content
    if (tabName === 'modify') {
        tabModify.classList.add('active');
        contentModify.classList.add('active');
        // If switching to modify tab, ensure original image is drawn
        if (currentEditedAsset && currentImage.src) {
            // Redraw the original or current modified image to reset filters before applying new ones
            textureEditorCtx.filter = 'none';
            textureEditorCtx.drawImage(currentImage, 0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
            applyFilter(); // Apply current saturation
        }
    } else if (tabName === 'create') {
        tabCreate.classList.add('active');
        contentCreate.classList.add('active');
        // Clear canvas when switching to create tab
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
    }
}


// --- Image Modification Functions ---

function applyFilter() {
    if (!currentEditedAsset || !currentImage.src) {
        return;
    }
    const saturation = saturationSlider.value;

    // Clear canvas
    textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);

    // Apply filter and redraw image
    textureEditorCtx.filter = `saturate(${saturation}%)`;
    textureEditorCtx.drawImage(currentImage, 0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
}

async function saveModifiedTexture() {
    if (!currentEditedAsset) {
        window.updateConsoleLog('[ERROR] No asset selected for modification.');
        return;
    }

    // Determine the MIME type for saving (PNG for transparency, JPEG for others)
    const targetMimeType = currentEditedAsset.type === 'png' ? 'image/png' : 'image/jpeg';

    window.showLoadingOverlay('Saving Modified Texture...');

    // Use image-converter.js's convertImageBlob to handle the canvas output conversion
    // The canvas itself holds the modified image. We need to get a blob from it.
    try {
        const modifiedBlob = await new Promise(resolve => {
            textureEditorCanvas.toBlob(resolve, targetMimeType);
        });

        if (modifiedBlob) {
            currentEditedAsset.modifiedImageBlob = modifiedBlob;
            currentEditedAsset.isModified = true;
            currentEditedAsset.isNew = false; // It's a modification of an existing asset

            // Update the card's visual state to show it's modified
            if (typeof window.updateCardVisualState === 'function') {
                window.updateCardVisualState(currentEditedAsset);
            } else {
                console.error('updateCardVisualState function not found in global scope.');
            }

            window.updateConsoleLog(`Changes saved for: ${currentEditedAsset.filename}`);
            window.hideLoadingOverlayWithDelay(1000, 'Texture Saved!');
            closeAssetEditorModal();
        } else {
            throw new Error('Failed to create blob from canvas.');
        }
    } catch (error) {
        console.error('Error saving modified texture:', error);
        window.updateConsoleLog(`[ERROR] Failed to save texture: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Save Failed!');
    }
}

async function handleImageUploadForModification(event) {
    const file = event.target.files[0];
    if (file && currentEditedAsset) {
        if (!file.type.startsWith('image/')) {
            window.updateConsoleLog('[WARN] Please upload an image file.');
            textureEditorImageInput.value = '';
            return;
        }

        window.showLoadingOverlay('Processing Uploaded Image...');

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                currentImage.src = e.target.result; // Set the uploaded image as the new currentImage
                currentImage.onload = () => {
                    // Update canvas size to match the uploaded image
                    textureEditorCanvas.width = currentImage.naturalWidth;
                    textureEditorCanvas.height = currentImage.naturalHeight;
                    applyFilter(); // Draw the new image with current filter
                    window.updateConsoleLog('Uploaded image loaded into editor.');
                    window.hideLoadingOverlayWithDelay(500, 'Image Loaded!');
                    textureEditorImagePreview.src = e.target.result;
                    textureEditorImagePreview.style.display = 'block';
                };
                currentImage.onerror = (imgErr) => {
                    console.error('Error loading uploaded image to currentImage:', imgErr);
                    window.updateConsoleLog('[ERROR] Failed to load uploaded image.');
                    window.hideLoadingOverlayWithDelay(1000, 'Upload Failed!');
                };
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error handling image upload:', error);
            window.updateConsoleLog(`[ERROR] Image upload failed: ${error.message}`);
            window.hideLoadingOverlayWithDelay(3000, 'Upload Failed!');
        }
    } else {
        textureEditorImagePreview.src = '';
        textureEditorImagePreview.style.display = 'none';
        window.updateConsoleLog('No file selected for upload.');
    }
}


// --- New Texture Creation Functions ---

async function createNewTexture() {
    if (!currentEditedAsset) {
        window.updateConsoleLog('[ERROR] No target asset selected for new texture creation.');
        return;
    }

    const width = parseInt(newTextureWidthInput.value);
    const height = parseInt(newTextureHeightInput.value);
    const color = newTextureColorInput.value;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        window.updateConsoleLog('[WARN] Invalid width or height for new texture.');
        return;
    }

    window.showLoadingOverlay('Generating New Texture...');

    // Create a temporary canvas to draw the new texture
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, width, height);

    try {
        const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png')); // Always create PNG for new textures
        if (!blob) throw new Error('Failed to create new texture blob from canvas.');

        currentEditedAsset.newImageBlob = blob;
        currentEditedAsset.isNew = true;
        currentEditedAsset.isModified = false; // Ensure it's not marked as a modification

        window.updateConsoleLog(`New texture created and saved in memory for: ${currentEditedAsset.filename}`);
        // IMPORTANT: Update the visual state of the card
        if (typeof window.updateCardVisualState === 'function') {
            window.updateCardVisualState(currentEditedAsset);
        } else {
            console.error('updateCardVisualState function not found in global scope.');
        }
        window.hideLoadingOverlayWithDelay(1000, 'New Texture Created!');
        closeAssetEditorModal();
    } catch (error) {
        console.error('Error creating new texture blob:', error);
        window.updateConsoleLog(`[ERROR] Failed to create new texture: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Creation Failed!');
    }
}

// Global scope functions (will be called from asset-list-page.js)
window.openAssetEditorModal = window.openAssetEditorModal;