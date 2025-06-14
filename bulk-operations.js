// bulk-operations.js
// This file handles multi-selection mode and bulk operations on assets.

// Global state variables
let isMultiSelectMode = false;
const selectedAssets = new Set(); // Stores references to asset objects (from allAssets array)

// DOM Elements
let toggleMultiSelectButton;
let multiSelectActionsContainer;
let selectedAssetsCountDisplay;
let openBulkModifyButton;
let openBulkCreateButton;

let bulkOperationsModal;
let closeBulkModalButton;
let bulkSaturationSlider;
let bulkSaturationValueDisplay;
let applyBulkSaturationButton;
let bulkNewTextureWidthInput;
let bulkNewTextureHeightInput;
let bulkNewTextureColorInput;
let saveBulkNewTextureButton;

document.addEventListener('DOMContentLoaded', () => {
    // Get multi-select DOM elements
    toggleMultiSelectButton = document.getElementById('toggle-multi-select-button');
    multiSelectActionsContainer = document.getElementById('multi-select-actions');
    selectedAssetsCountDisplay = document.getElementById('selected-assets-count');
    openBulkModifyButton = document.getElementById('open-bulk-modify-button');
    openBulkCreateButton = document.getElementById('open-bulk-create-button');

    // Get bulk operations modal DOM elements
    bulkOperationsModal = document.getElementById('bulk-operations-modal');
    closeBulkModalButton = document.getElementById('close-bulk-modal');
    bulkSaturationSlider = document.getElementById('bulk-saturation-slider');
    bulkSaturationValueDisplay = document.getElementById('bulk-saturation-value');
    applyBulkSaturationButton = document.getElementById('apply-bulk-saturation');
    bulkNewTextureWidthInput = document.getElementById('bulk-new-texture-width');
    bulkNewTextureHeightInput = document.getElementById('bulk-new-texture-height');
    bulkNewTextureColorInput = document.getElementById('bulk-new-texture-color');
    saveBulkNewTextureButton = document.getElementById('save-bulk-new-texture');

    // Add Event Listeners
    if (toggleMultiSelectButton) {
        toggleMultiSelectButton.addEventListener('click', toggleMultiSelectMode);
    }

    if (openBulkModifyButton) {
        openBulkModifyButton.addEventListener('click', openBulkOperationsModal);
    }
    if (openBulkCreateButton) {
        openBulkCreateButton.addEventListener('click', () => openBulkOperationsModal('create'));
    }

    if (closeBulkModalButton) {
        closeBulkModalButton.addEventListener('click', closeBulkOperationsModal);
    }

    if (bulkSaturationSlider) {
        bulkSaturationSlider.addEventListener('input', () => {
            bulkSaturationValueDisplay.textContent = `${bulkSaturationSlider.value}%`;
        });
    }

    if (applyBulkSaturationButton) {
        applyBulkSaturationButton.addEventListener('click', applyBulkSaturation);
    }

    if (saveBulkNewTextureButton) {
        saveBulkNewTextureButton.addEventListener('click', saveBulkNewTexture);
    }

    // Export functions to global scope so asset-list-page.js can access them
    // when creating cards and handling clicks.
    window.toggleAssetSelection = toggleAssetSelection;
    window.isMultiSelectModeActive = () => isMultiSelectMode;
    window.updateBulkActionButtonsState = updateBulkActionButtonsState; // Function to be called from asset-list-page.js
});

/**
 * Toggles multi-selection mode on and off.
 */
function toggleMultiSelectMode() {
    isMultiSelectMode = !isMultiSelectMode;
    document.body.classList.toggle('multi-select-active', isMultiSelectMode);

    if (isMultiSelectMode) {
        toggleMultiSelectButton.textContent = 'Exit Selection';
        multiSelectActionsContainer.style.display = 'flex'; // Show bulk action buttons container
        console.log('Multi-select mode ON');
    } else {
        toggleMultiSelectButton.textContent = 'Select Assets';
        multiSelectActionsContainer.style.display = 'none'; // Hide bulk action buttons container
        clearSelectedAssets(); // Clear all selections when exiting mode
        console.log('Multi-select mode OFF');
    }

    // Update visibility of individual card edit buttons
    const editButtons = document.querySelectorAll('.edit-asset-button');
    editButtons.forEach(button => {
        // Disable edit button if multi-select is active, re-enable otherwise
        // Only re-enable if the card itself is not an MP3 (as MP3s never have edit buttons)
        const card = button.closest('.texture-card');
        if (card && !card.classList.contains('mp3')) {
            button.disabled = isMultiSelectMode;
            button.style.pointerEvents = isMultiSelectMode ? 'none' : 'auto';
            button.style.opacity = isMultiSelectMode ? '0.5' : '1';
        }
    });

    // Hide/show individual copy/download buttons for non-MP3s
    const imageCardButtons = document.querySelectorAll('.buttons-container .download-button, .buttons-container .copy-button');
    imageCardButtons.forEach(button => {
        button.disabled = isMultiSelectMode;
        button.style.pointerEvents = isMultiSelectMode ? 'none' : 'auto';
        button.style.opacity = isMultiSelectMode ? '0.5' : '1';
    });
}

/**
 * Toggles the selection state of an individual asset.
 * This function will be called from asset-list-page.js when a card is clicked in multi-select mode.
 * @param {Object} asset The asset object to select/deselect.
 * @param {HTMLElement} cardElement The DOM element of the asset card.
 */
function toggleAssetSelection(asset, cardElement) {
    // Only allow selection of PNG/JPG assets (exclude MP3s)
    if (asset.type.toLowerCase() === 'mp3') {
        console.log('MP3 files cannot be selected for bulk image operations.');
        // Optionally provide a visual cue or message to the user here
        return;
    }

    if (selectedAssets.has(asset)) {
        selectedAssets.delete(asset);
        cardElement.classList.remove('selected-for-bulk');
    } else {
        selectedAssets.add(asset);
        cardElement.classList.add('selected-for-bulk');
    }
    updateSelectedCountDisplay();
    updateBulkActionButtonsState();
}

/**
 * Clears all currently selected assets.
 */
function clearSelectedAssets() {
    selectedAssets.forEach(asset => {
        if (asset.cardElement) {
            asset.cardElement.classList.remove('selected-for-bulk');
        }
    });
    selectedAssets.clear();
    updateSelectedCountDisplay();
    updateBulkActionButtonsState();
}

/**
 * Updates the display of how many assets are selected.
 */
function updateSelectedCountDisplay() {
    selectedAssetsCountDisplay.textContent = `${selectedAssets.size} Asset${selectedAssets.size === 1 ? '' : 's'} Selected`;
}

/**
 * Enables or disables the bulk action buttons based on the number of selected assets.
 */
function updateBulkActionButtonsState() {
    const enableButtons = selectedAssets.size >= 1; // Changed to 1 as per later conversation, allowing single selection for bulk modal
    if (openBulkModifyButton) {
        openBulkModifyButton.disabled = !enableButtons;
        openBulkModifyButton.style.opacity = enableButtons ? '1' : '0.5';
    }
    if (openBulkCreateButton) {
        openBulkCreateButton.disabled = !enableButtons;
        openBulkCreateButton.style.opacity = enableButtons ? '1' : '0.5';
    }
}

/**
 * Opens the bulk operations modal.
 * @param {string} [initialTab='modify'] The tab to open initially ('modify' or 'create').
 */
function openBulkOperationsModal(initialTab = 'modify') {
    if (!bulkOperationsModal) {
        console.error('Bulk operations modal not found!');
        return;
    }
    bulkOperationsModal.classList.add('active');

    // Reset slider and inputs to default values
    bulkSaturationSlider.value = 100;
    bulkSaturationValueDisplay.textContent = '100%';
    bulkNewTextureWidthInput.value = 512;
    bulkNewTextureHeightInput.value = 512;
    bulkNewTextureColorInput.value = '#6c5ce7';

    // Show/hide relevant sections based on initial tab (though for bulk, both are always visible,
    // this could be for initial focus or future tab implementation within the bulk modal)
    // For now, it's just about setting initial values for the controls.
}

/**
 * Closes the bulk operations modal.
 */
function closeBulkOperationsModal() {
    if (bulkOperationsModal) {
        bulkOperationsModal.classList.remove('active');
    }
    // No need to clear selected assets here, that happens when exiting multi-select mode.
    // However, we do want to exit multi-select mode after a bulk operation is complete.
}

/**
 * Applies saturation to all selected image assets.
 */
async function applyBulkSaturation() {
    if (selectedAssets.size === 0) {
        console.warn('No assets selected for bulk saturation.');
        return;
    }

    // Show loading overlay for bulk operation
    window.showLoadingOverlay('Applying Saturation...');
    const totalAssets = selectedAssets.size;
    let processedCount = 0;

    const saturationFactor = bulkSaturationSlider.value / 100;

    for (const asset of selectedAssets) {
        if (asset.type.toLowerCase() === 'mp3') {
            continue; // Skip MP3s (should already be filtered by selection logic, but good double check)
        }

        try {
            window.updateConsoleLog(`Processing saturation for: ${asset.filename}`);
            let imageBlob = null;

            // Prioritize previously modified or original image blob
            if (asset.modifiedImageBlob) {
                imageBlob = asset.modifiedImageBlob;
            } else if (asset.originalImageBlob) {
                imageBlob = asset.originalImageBlob;
            } else {
                // If no blob is present, fetch the original image
                const response = await fetch(asset.mediaPath);
                if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                imageBlob = await response.blob();
                asset.originalImageBlob = imageBlob; // Store original blob
            }

            const img = new Image();
            const imgLoadPromise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (e) => reject(new Error('Image load error for bulk processing: ' + e.type));
                img.src = URL.createObjectURL(imageBlob);
            });
            await imgLoadPromise;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;

            tempCtx.drawImage(img, 0, 0); // Draw original image to get pixel data

            // Apply saturation directly to pixel data
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                pixels[i] = luminance + (r - luminance) * saturationFactor;
                pixels[i + 1] = luminance + (g - luminance) * saturationFactor;
                pixels[i + 2] = luminance + (b - luminance) * saturationFactor;

                pixels[i] = Math.min(255, Math.max(0, pixels[i]));
                pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1]));
                pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2]));
            }
            tempCtx.putImageData(imageData, 0, 0);

            const modifiedBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
            asset.modifiedImageBlob = modifiedBlob;
            asset.isModified = true;
            asset.isNew = false;

            window.updateCardVisualState(asset); // Update individual card visual state
            URL.revokeObjectURL(img.src); // Clean up blob URL

            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssets, `Applying Saturation to ${asset.filename}`);

        } catch (error) {
            console.error(`Error applying saturation to ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Saturation failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk saturation complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Saturation Complete!'); // Show message for 3 seconds
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
}

/**
 * Creates new identical textures for all selected image assets.
 */
async function saveBulkNewTexture() {
    if (selectedAssets.size === 0) {
        console.warn('No assets selected for bulk new texture creation.');
        return;
    }

    // Show loading overlay for bulk operation
    window.showLoadingOverlay('Creating New Textures...');
    const totalAssets = selectedAssets.size;
    let processedCount = 0;

    const width = parseInt(bulkNewTextureWidthInput.value);
    const height = parseInt(bulkNewTextureHeightInput.value);
    const color = bulkNewTextureColorInput.value;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        console.error('Invalid width or height for bulk new texture.');
        window.updateConsoleLog('[ERROR] Invalid width or height for new texture. Operation aborted.');
        window.hideLoadingOverlayWithDelay(3000, 'Error: Invalid Dimensions');
        return;
    }

    for (const asset of selectedAssets) {
        if (asset.type.toLowerCase() === 'mp3') {
            continue; // Skip MP3s
        }

        try {
            window.updateConsoleLog(`Creating new texture for: ${asset.filename}`);
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = width;
            tempCanvas.height = height;

            tempCtx.fillStyle = color;
            tempCtx.fillRect(0, 0, width, height);

            const newBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
            asset.newImageBlob = newBlob;
            asset.isNew = true;
            asset.isModified = false; // Ensure it's marked as new, not modified

            window.updateCardVisualState(asset); // Update individual card visual state

            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssets, `Creating new texture for ${asset.filename}`);

        } catch (error) {
            console.error(`Error creating new texture for ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] New texture creation failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk new texture creation complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Creation Complete!'); // Show message for 3 seconds
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
}

// Global helper functions for loading overlay (exposed from asset-list-page.js)
// These functions will be defined in asset-list-page.js and exposed via window object.
// We'll call these functions from here.
// window.showLoadingOverlay(message);
// window.updateLoadingProgress(processed, total, currentFileMessage);
// window.updateConsoleLog(message);
// window.hideLoadingOverlayWithDelay(delay, finalMessage);
