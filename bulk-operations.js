/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// bulk-operations.js
// This file handles multi-selection mode and bulk operations on assets.

// Global state variables
let isMultiSelectMode = false;
const selectedAssets = new Set(); // Stores references to asset objects (from allAssets array)

// DOM Elements
let toggleMultiSelectButton;
let multiSelectActionsContainer;
let selectedAssetsCountDisplay;
let openBulkEditButton; // NEW: Single button for bulk editing

let bulkOperationsModal;
let closeBulkModalButton;
let bulkSaturationSlider;
let bulkSaturationValueDisplay;
let applyBulkSaturationButton;
let bulkNewTextureWidthInput;
let bulkNewTextureHeightInput;
let bulkNewTextureColorInput;
let saveBulkNewTextureButton;

// New: DOM elements for the bulk upload texture section
let bulkUploadImageInput;
let bulkUploadImagePreview;
let applyBulkUploadTextureButton;
let bulkUploadPreviewPlaceholder;

let uploadedImageBlob = null; // Stores the actual uploaded image blob for bulk application

document.addEventListener('DOMContentLoaded', () => {
    // Get multi-select DOM elements
    toggleMultiSelectButton = document.getElementById('toggle-multi-select-button');
    multiSelectActionsContainer = document.getElementById('multi-select-actions');
    selectedAssetsCountDisplay = document.getElementById('selected-assets-count');
    openBulkEditButton = document.getElementById('open-bulk-edit-button'); // Get the new button

    // Get Bulk Operations Modal elements
    bulkOperationsModal = document.getElementById('bulk-operations-modal');
    closeBulkModalButton = document.getElementById('close-bulk-modal');
    bulkSaturationSlider = document.getElementById('bulk-saturation-slider');
    bulkSaturationValueDisplay = document.getElementById('bulk-saturation-value');
    applyBulkSaturationButton = document.getElementById('apply-bulk-saturation');
    bulkNewTextureWidthInput = document.getElementById('bulk-new-texture-width');
    bulkNewTextureHeightInput = document.getElementById('bulk-new-texture-height');
    bulkNewTextureColorInput = document.getElementById('bulk-new-texture-color');
    saveBulkNewTextureButton = document.getElementById('save-bulk-new-texture');

    // Get Bulk Upload Texture elements
    bulkUploadImageInput = document.getElementById('bulk-upload-image-input');
    bulkUploadImagePreview = document.getElementById('bulk-upload-image-preview');
    applyBulkUploadTextureButton = document.getElementById('apply-bulk-upload-texture');
    bulkUploadPreviewPlaceholder = document.getElementById('bulk-upload-preview-placeholder');


    // Event Listeners
    if (toggleMultiSelectButton) {
        toggleMultiSelectButton.addEventListener('click', toggleMultiSelectMode);
    }
    if (openBulkEditButton) {
        openBulkEditButton.addEventListener('click', openBulkOperationsModal);
    }
    if (closeBulkModalButton) {
        closeBulkModalButton.addEventListener('click', closeBulkOperationsModal);
    }
    // Close modal if clicked outside content
    if (bulkOperationsModal) {
        bulkOperationsModal.addEventListener('click', (event) => {
            if (event.target === bulkOperationsModal) {
                closeBulkOperationsModal();
            }
        });
    }

    // Bulk Saturation Controls
    if (bulkSaturationSlider && bulkSaturationValueDisplay && applyBulkSaturationButton) {
        bulkSaturationSlider.addEventListener('input', (event) => {
            bulkSaturationValueDisplay.textContent = event.target.value;
        });
        applyBulkSaturationButton.addEventListener('click', applyBulkSaturation);
    }

    // Bulk New Texture Controls
    if (saveBulkNewTextureButton) {
        saveBulkNewTextureButton.addEventListener('click', createBulkNewTexture);
    }

    // Bulk Upload Texture Controls
    if (bulkUploadImageInput && bulkUploadImagePreview && applyBulkUploadTextureButton && bulkUploadPreviewPlaceholder) {
        bulkUploadImageInput.addEventListener('change', handleBulkUploadImageSelect);
        applyBulkUploadTextureButton.addEventListener('click', applyBulkUploadedTexture);
    }
});


// --- Multi-Select Mode Functions ---

function toggleMultiSelectMode() {
    isMultiSelectMode = !isMultiSelectMode;
    if (isMultiSelectMode) {
        multiSelectActionsContainer.classList.add('active');
        toggleMultiSelectButton.textContent = 'Exit Multi-Select';
        // Clear previous selections when entering multi-select mode
        selectedAssets.clear();
        updateSelectedAssetsCount();
        // Ensure all cards are reset visually
        window.allAssets.forEach(asset => {
            if (asset.cardElement) {
                asset.cardElement.classList.remove('selected');
                const checkbox = asset.cardElement.querySelector('.select-checkbox');
                if (checkbox) {
                    checkbox.style.display = 'none'; // Hide initially
                }
            }
        });

        // Show checkboxes for non-MP3s when entering multi-select mode
        window.allAssets.filter(asset => asset.type !== 'mp3').forEach(asset => {
            if (asset.cardElement) {
                const checkbox = asset.cardElement.querySelector('.select-checkbox');
                if (checkbox) {
                    checkbox.style.display = 'block';
                }
            }
        });

        window.updateConsoleLog('Entered multi-select mode.');
    } else {
        multiSelectActionsContainer.classList.remove('active');
        toggleMultiSelectButton.textContent = 'Multi-Select';
        // Clear selections when exiting
        selectedAssets.clear();
        updateSelectedAssetsCount();
        // Hide checkboxes for non-MP3s when exiting multi-select mode
        window.allAssets.filter(asset => asset.type !== 'mp3').forEach(asset => {
            if (asset.cardElement) {
                asset.cardElement.classList.remove('selected'); // Also remove 'selected' class
                const checkbox = asset.cardElement.querySelector('.select-checkbox');
                if (checkbox) {
                    checkbox.style.display = 'none';
                }
            }
        });
        window.updateConsoleLog('Exited multi-select mode.');
    }
}

// Expose isMultiSelectModeActive globally
window.isMultiSelectModeActive = () => isMultiSelectMode;

// Function to toggle selection of an asset
window.toggleAssetSelection = (asset, cardElement) => {
    // Only allow selection of non-MP3 assets for bulk operations
    if (asset.type.toLowerCase() === 'mp3') {
        window.updateConsoleLog('MP3 assets cannot be selected for bulk texture operations.');
        return;
    }

    if (selectedAssets.has(asset)) {
        selectedAssets.delete(asset);
        cardElement.classList.remove('selected');
    } else {
        selectedAssets.add(asset);
        cardElement.classList.add('selected');
        // If an asset is selected for bulk operation, it cannot be excluded from export.
        // This prevents conflicting states.
        if (asset.isExcluded) {
            asset.isExcluded = false; // Unmark as excluded
            window.updateCardVisualState(asset); // Update card to remove 'is-excluded' style
            window.updateConsoleLog(`Asset '${asset.filename}' deselected from exclusion due to bulk selection.`);
        }
    }
    updateSelectedAssetsCount();
};

// Function to deselect an asset (used externally, e.g., when an asset is excluded)
window.deselectAsset = (asset, cardElement) => {
    if (selectedAssets.has(asset)) {
        selectedAssets.delete(asset);
        cardElement.classList.remove('selected');
        updateSelectedAssetsCount();
    }
};


function updateSelectedAssetsCount() {
    if (selectedAssetsCountDisplay) {
        selectedAssetsCountDisplay.textContent = selectedAssets.size;
        // Enable/disable bulk edit button based on selection
        if (openBulkEditButton) {
            openBulkEditButton.disabled = selectedAssets.size === 0;
        }
    }
}


// --- Bulk Operations Modal Functions ---

function openBulkOperationsModal() {
    if (bulkOperationsModal) {
        if (selectedAssets.size === 0) {
            window.updateConsoleLog('No assets selected for bulk operations.');
            return;
        }
        bulkOperationsModal.classList.add('active');
        // Reset modal state
        bulkSaturationSlider.value = 100;
        bulkSaturationValueDisplay.textContent = 100;
        bulkNewTextureWidthInput.value = '';
        bulkNewTextureHeightInput.value = '';
        bulkNewTextureColorInput.value = '#ffffff';
        bulkUploadImageInput.value = '';
        if (bulkUploadImagePreview) {
            bulkUploadImagePreview.src = '';
            bulkUploadImagePreview.style.display = 'none';
        }
        if (bulkUploadPreviewPlaceholder) {
            bulkUploadPreviewPlaceholder.style.display = 'block';
        }
        uploadedImageBlob = null;
        applyBulkUploadTextureButton.disabled = true;

        window.updateConsoleLog(`Opened bulk operations for ${selectedAssets.size} assets.`);
    }
}

function closeBulkOperationsModal() {
    if (bulkOperationsModal) {
        bulkOperationsModal.classList.remove('active');
    }
}


// --- Bulk Operations Logic ---

async function applyBulkSaturation() {
    if (selectedAssets.size === 0) {
        window.updateConsoleLog('No assets selected for bulk saturation.');
        return;
    }

    const saturationValue = parseFloat(bulkSaturationSlider.value);
    if (isNaN(saturationValue)) {
        window.updateConsoleLog('Invalid saturation value.');
        return;
    }

    window.showLoadingOverlay('Applying Bulk Saturation...');

    let processedCount = 0;
    const totalAssets = selectedAssets.size;

    // Ensure all original image blobs are loaded into memory if not already
    // This is crucial for image manipulation.
    if (typeof window.loadAllAssetsIntoMemory === 'function') {
        window.updateConsoleLog('Ensuring all selected textures are loaded into memory...');
        await window.loadAllAssetsIntoMemory(); // This also updates progress for image loading
        window.updateConsoleLog('Textures loaded. Starting saturation adjustment...');
    }


    for (const asset of selectedAssets) {
        if (asset.type === 'png' || asset.type === 'jpg') {
            try {
                const sourceBlob = asset.modifiedImageBlob || asset.newImageBlob || asset.originalImageBlob;

                if (!sourceBlob) {
                    throw new Error(`No image data found for ${asset.filename}.`);
                }

                const img = new Image();
                img.src = URL.createObjectURL(sourceBlob);

                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;

                        ctx.filter = `saturate(${saturationValue}%)`;
                        ctx.drawImage(img, 0, 0);

                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                asset.modifiedImageBlob = blob;
                                asset.isModified = true;
                                asset.isNew = false; // It's a modification, not a new creation
                                window.updateCardVisualState(asset); // Update individual card visual state
                                window.updateConsoleLog(`Applied saturation to ${asset.filename}`);
                            } else {
                                throw new Error('Failed to create blob after saturation.');
                            }
                            URL.revokeObjectURL(img.src); // Clean up blob URL
                            resolve();
                        }, asset.type === 'png' ? 'image/png' : 'image/jpeg');
                    };
                    img.onerror = reject;
                });
            } catch (error) {
                console.error(`Error applying saturation to ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Saturation failed for: ${asset.filename} - ${error.message}`);
            }
        } else {
            window.updateConsoleLog(`Skipping non-image asset for saturation: ${asset.filename}`);
        }
        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);
    }

    window.updateConsoleLog('\nBulk saturation application complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Saturation Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
    console.log('Bulk saturation operation finished.');
}


async function createBulkNewTexture() {
    if (selectedAssets.size === 0) {
        window.updateConsoleLog('No assets selected for bulk new texture creation.');
        return;
    }

    const width = parseInt(bulkNewTextureWidthInput.value);
    const height = parseInt(bulkNewTextureHeightInput.value);
    const color = bulkNewTextureColorInput.value;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        window.updateConsoleLog('Invalid width or height for new texture.');
        return;
    }

    window.showLoadingOverlay('Creating Bulk New Textures...');

    let processedCount = 0;
    const totalAssets = selectedAssets.size;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, width, height);

    let newTextureBlob = null;
    try {
        newTextureBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        if (!newTextureBlob) throw new Error('Failed to create new texture blob.');
    } catch (error) {
        console.error('Error generating common new texture blob:', error);
        window.updateConsoleLog(`[ERROR] Failed to generate new texture for all assets: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Bulk New Texture Failed!');
        return;
    }

    for (const asset of selectedAssets) {
        if (asset.type === 'png' || asset.type === 'jpg') {
            try {
                asset.newImageBlob = newTextureBlob; // Assign the same generated blob
                asset.isNew = true;
                asset.isModified = false; // It's a new asset, not a modification
                window.updateCardVisualState(asset); // Update individual card visual state
                window.updateConsoleLog(`Applied new texture to ${asset.filename}`);
            } catch (error) {
                console.error(`Error applying new texture to ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Application failed for: ${asset.filename} - ${error.message}`);
            }
        } else {
            window.updateConsoleLog(`Skipping non-image asset for new texture creation: ${asset.filename}`);
        }
        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);
    }

    window.updateConsoleLog('\nBulk new texture creation complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk New Texture Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
    console.log('Bulk new texture operation finished.');
}


// --- Bulk Upload Texture Functions ---

function handleBulkUploadImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            bulkUploadImagePreview.src = e.target.result;
            bulkUploadImagePreview.style.display = 'block';
            bulkUploadPreviewPlaceholder.style.display = 'none';
            applyBulkUploadTextureButton.disabled = false;
        };
        reader.readAsDataURL(file);
        uploadedImageBlob = file; // Store the actual Blob object
    } else {
        bulkUploadImagePreview.src = '';
        bulkUploadImagePreview.style.display = 'none';
        bulkUploadPreviewPlaceholder.style.display = 'block';
        applyBulkUploadTextureButton.disabled = true;
        uploadedImageBlob = null;
    }
}

async function applyBulkUploadedTexture() {
    if (selectedAssets.size === 0) {
        window.updateConsoleLog('No assets selected for bulk texture upload.');
        return;
    }

    if (!uploadedImageBlob) {
        window.updateConsoleLog('No image file uploaded for bulk application.');
        return;
    }

    window.showLoadingOverlay('Applying Bulk Uploaded Texture...');

    let processedCount = 0;
    const totalAssets = selectedAssets.size;

    // Ensure image-converter.js functions are available
    if (typeof window.convertImageBlob !== 'function') {
        console.error('image-converter.js not loaded or convertImageBlob function not found!');
        window.updateConsoleLog('[ERROR] Image converter not available. Cannot apply uploaded texture.');
        window.hideLoadingOverlayWithDelay(3000, 'Operation Failed!');
        return;
    }


    for (const asset of selectedAssets) {
        if (asset.type === 'png' || asset.type === 'jpg') {
            try {
                // Determine target MIME type based on the asset's original type
                const assetMimeType = asset.type === 'png' ? 'image/png' : 'image/jpeg';
                // Convert the uploaded image blob to the asset's target type
                const finalBlob = await window.convertImageBlob(uploadedImageBlob, assetMimeType);

                if (finalBlob) {
                    asset.newImageBlob = finalBlob;
                    asset.isNew = true;
                    asset.isModified = false;
                    window.updateCardVisualState(asset); // Update individual card visual state
                    window.updateConsoleLog(`Applied new texture to ${asset.filename}`);
                } else {
                    throw new Error('Image conversion failed.');
                }

                processedCount++;
                window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);

            } catch (error) {
                console.error(`Error applying uploaded texture to ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Application failed for: ${asset.filename} - ${error.message}`);
            }
        } else {
            window.updateConsoleLog(`Skipping non-image asset for bulk texture upload: ${asset.filename}`);
        }
    }

    window.updateConsoleLog('\nBulk uploaded texture application complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Upload Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
    console.log('Bulk uploaded texture operation finished.');

    // Reset the upload form
    bulkUploadImageInput.value = '';
    bulkUploadImagePreview.src = '';
    bulkUploadImagePreview.style.display = 'none';
    bulkUploadPreviewPlaceholder.style.display = 'block';
    uploadedImageBlob = null;
    applyBulkUploadTextureButton.disabled = true;
}