// bulk-operations.js
// This file handles multi-selection mode and bulk operations on assets.

// Global state variables
let isMultiSelectMode = false;
const selectedAssets = new Set(); // Stores references to asset objects (from allAssets array)

// DOM Elements
let toggleMultiSelectButton;
let multiSelectActionsContainer;
let selectedAssetsCountDisplay;
// Removed: openBulkModifyButton, openBulkCreateButton
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

document.addEventListener('DOMContentLoaded', () => {
    // Get multi-select DOM elements
    toggleMultiSelectButton = document.getElementById('toggle-multi-select-button');
    multiSelectActionsContainer = document.getElementById('multi-select-actions');
    selectedAssetsCountDisplay = document.getElementById('selected-assets-count');
    openBulkEditButton = document.getElementById('open-bulk-edit-button'); // NEW: Get reference to the single button

    // Add robust error logging for DOM element retrieval
    if (!toggleMultiSelectButton) console.error('ERROR: toggle-multi-select-button not found!');
    if (!multiSelectActionsContainer) console.error('ERROR: multi-select-actions container not found!');
    if (!selectedAssetsCountDisplay) console.error('ERROR: selected-assets-count display not found!');
    if (!openBulkEditButton) console.error('ERROR: open-bulk-edit-button not found!'); // NEW check


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

    // Add robust error logging for bulk modal DOM elements
    if (!bulkOperationsModal) console.error('ERROR: bulk-operations-modal not found!');
    if (!closeBulkModalButton) console.error('ERROR: close-bulk-modal button not found!');
    // ... add more checks for other bulk modal elements if needed

    // Add Event Listeners
    if (toggleMultiSelectButton) {
        toggleMultiSelectButton.addEventListener('click', toggleMultiSelectMode);
    }

    // NEW: Listen for click on the single bulk edit button
    if (openBulkEditButton) {
        openBulkEditButton.addEventListener('click', openBulkOperationsModal);
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
    window.toggleAssetSelection = toggleAssetSelection;
    window.isMultiSelectModeActive = () => isMultiSelectMode;
    window.updateBulkActionButtonsState = updateBulkActionButtonsState;
});

/**
 * Toggles multi-selection mode on and off.
 */
function toggleMultiSelectMode() {
    isMultiSelectMode = !isMultiSelectMode;
    document.body.classList.toggle('multi-select-active', isMultiSelectMode);
    console.log(`toggleMultiSelectMode: isMultiSelectMode is now ${isMultiSelectMode}`);

    if (isMultiSelectMode) {
        toggleMultiSelectButton.textContent = 'Exit Selection';
        // Show bulk action buttons container
        if (multiSelectActionsContainer) {
            multiSelectActionsContainer.style.display = 'flex';
            console.log('Multi-select mode ON: multi-select-actions container display set to flex.');
        }
    } else {
        toggleMultiSelectButton.textContent = 'Select Assets';
        // Hide bulk action buttons container
        if (multiSelectActionsContainer) {
            multiSelectActionsContainer.style.display = 'none';
            console.log('Multi-select mode OFF: multi-select-actions container display set to none.');
        }
        clearSelectedAssets(); // Clear all selections when exiting mode
    }

    // Update visibility/interactivity of individual card elements
    const editButtons = document.querySelectorAll('.edit-asset-button');
    editButtons.forEach(button => {
        const card = button.closest('.texture-card');
        if (card && !card.classList.contains('mp3')) {
            button.disabled = isMultiSelectMode;
            button.style.pointerEvents = isMultiSelectMode ? 'none' : 'auto';
            button.style.opacity = isMultiSelectMode ? '0.5' : '1';
        }
    });

    const imageCardButtons = document.querySelectorAll('.buttons-container .download-button, .buttons-container .copy-button');
    imageCardButtons.forEach(button => {
        button.disabled = isMultiSelectMode;
        button.style.pointerEvents = isMultiSelectMode ? 'none' : 'auto';
        button.style.opacity = isMultiSelectMode ? '0.5' : '1';
    });

    // Ensure initial button state is updated based on selected count
    updateBulkActionButtonsState();
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
        console.log('Attempted to select MP3 file for bulk image operations. Skipping.');
        // Optionally provide a visible message to the user here instead of just console.log
        return;
    }

    if (selectedAssets.has(asset)) {
        selectedAssets.delete(asset);
        cardElement.classList.remove('selected-for-bulk');
        console.log(`Asset deselected: ${asset.filename}. Total selected: ${selectedAssets.size}`);
    } else {
        selectedAssets.add(asset);
        cardElement.classList.add('selected-for-bulk');
        console.log(`Asset selected: ${asset.filename}. Total selected: ${selectedAssets.size}`);
    }
    updateSelectedCountDisplay();
    updateBulkActionButtonsState(); // Crucial call to update button disabled state
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
    console.log('All selected assets cleared.');
}

/**
 * Updates the display of how many assets are selected.
 */
function updateSelectedCountDisplay() {
    if (selectedAssetsCountDisplay) {
        selectedAssetsCountDisplay.textContent = `${selectedAssets.size} Asset${selectedAssets.size === 1 ? '' : 's'} Selected`;
        console.log(`Updated selected count display: ${selectedAssets.size}`);
    }
}

/**
 * Enables or disables the single bulk edit button based on the number of selected assets.
 */
function updateBulkActionButtonsState() {
    const enableButton = selectedAssets.size >= 1; // Enable if at least one asset is selected
    console.log(`updateBulkActionButtonsState: Selected assets = ${selectedAssets.size}, enableButton = ${enableButton}`);

    if (openBulkEditButton) { // Check the new single button
        openBulkEditButton.disabled = !enableButton;
        openBulkEditButton.style.opacity = enableButton ? '1' : '0.5';
        openBulkEditButton.style.pointerEvents = enableButton ? 'auto' : 'none'; // Ensure clicks are enabled/disabled
    }
}

/**
 * Opens the bulk operations modal.
 * The initialTab parameter is no longer needed as there are no tabs to pre-select.
 */
function openBulkOperationsModal() {
    if (!bulkOperationsModal) {
        console.error('Bulk operations modal not found!');
        return;
    }
    bulkOperationsModal.classList.add('active');
    console.log(`Bulk operations modal opened.`);

    // Reset slider and inputs to default values each time modal is opened
    if (bulkSaturationSlider) bulkSaturationSlider.value = 100;
    if (bulkSaturationValueDisplay) bulkSaturationValueDisplay.textContent = '100%';
    if (bulkNewTextureWidthInput) bulkNewTextureWidthInput.value = 512;
    if (bulkNewTextureHeightInput) bulkNewTextureHeightInput.value = 512;
    if (bulkNewTextureColorInput) bulkNewTextureColorInput.value = '#6c5ce7';
}

/**
 * Closes the bulk operations modal.
 */
function closeBulkOperationsModal() {
    if (bulkOperationsModal) {
        bulkOperationsModal.classList.remove('active');
        console.log('Bulk operations modal closed.');
    }
    // Note: Selected assets are cleared when exiting multi-select mode, not just closing the modal.
}

/**
 * Applies saturation to all selected image assets.
 */
async function applyBulkSaturation() {
    if (selectedAssets.size === 0) {
        console.warn('No assets selected for bulk saturation. Operation aborted.');
        // Consider a user-facing message here.
        return;
    }

    // Show loading overlay for bulk operation
    window.showLoadingOverlay('Applying Saturation...');
    const totalAssets = selectedAssets.size;
    let processedCount = 0;

    const saturationFactor = bulkSaturationSlider.value / 100;
    console.log(`Starting bulk saturation for ${totalAssets} assets with factor: ${saturationFactor}`);

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
                window.updateConsoleLog(`Using cached modified blob for ${asset.filename}`);
            } else if (asset.originalImageBlob) {
                imageBlob = asset.originalImageBlob;
                window.updateConsoleLog(`Using cached original blob for ${asset.filename}`);
            } else {
                // If no blob is present, fetch the original image
                window.updateConsoleLog(`Fetching original image for ${asset.filename}`);
                const response = await fetch(asset.mediaPath);
                if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                imageBlob = await response.blob();
                asset.originalImageBlob = imageBlob; // Store original blob for future use
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
            window.updateLoadingProgress(processedCount, totalAssets, `Applied saturation to ${asset.filename}`);

        } catch (error) {
            console.error(`Error applying saturation to ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Saturation failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk saturation complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Saturation Complete!'); // Show message for 3 seconds
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
    console.log('Bulk saturation operation finished.');
}

/**
 * Creates new identical textures for all selected image assets.
 */
async function saveBulkNewTexture() {
    if (selectedAssets.size === 0) {
        console.warn('No assets selected for bulk new texture creation. Operation aborted.');
        // Consider a user-facing message here.
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
        console.error('Invalid width or height for bulk new texture. Operation aborted.');
        window.updateConsoleLog('[FATAL ERROR] Invalid width or height for new texture. Operation aborted.');
        window.hideLoadingOverlayWithDelay(3000, 'Error: Invalid Dimensions');
        return;
    }
    console.log(`Starting bulk new texture creation for ${totalAssets} assets with dimensions ${width}x${height} and color ${color}`);


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
            window.updateLoadingProgress(processedCount, totalAssets, `Created new texture for ${asset.filename}`);

        } catch (error) {
            console.error(`Error creating new texture for ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] New texture creation failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk new texture creation complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Creation Complete!'); // Show message for 3 seconds
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
    console.log('Bulk new texture creation operation finished.');
}
