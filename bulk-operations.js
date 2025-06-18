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

// New: DOM elements for the bulk upload image texture section
let bulkUploadImageSection; // New: to control visibility of the whole section
let bulkUploadImageInput;
let bulkUploadImagePreview;
let applyBulkUploadTextureButton;
let bulkUploadPreviewPlaceholder;

let uploadedImageBlob = null; // Stores the actual uploaded image blob for bulk application

// New: DOM elements for the bulk upload audio (MP3) section
let bulkUploadAudioSection; // New: to control visibility of the whole section
let bulkUploadAudioInput;
let bulkUploadAudioPreview; // This might be a simple icon or text, not an actual audio player
let applyBulkUploadAudioButton;
let bulkUploadAudioPreviewPlaceholder;

let uploadedAudioBlob = null; // Stores the actual uploaded audio blob for bulk application


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
    if (!openBulkEditButton) console.error('ERROR: open-bulk-edit-button not found!');


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
    if (!bulkSaturationSlider) console.error('ERROR: bulk-saturation-slider not found!');
    if (!bulkSaturationValueDisplay) console.error('ERROR: bulk-saturation-value not found!');
    if (!applyBulkSaturationButton) console.error('ERROR: apply-bulk-saturation button not found!');
    if (!bulkNewTextureWidthInput) console.error('ERROR: bulk-new-texture-width input not found!');
    if (!bulkNewTextureHeightInput) console.error('ERROR: bulk-new-texture-height input not found!');
    if (!bulkNewTextureColorInput) console.error('ERROR: bulk-new-texture-color input not found!');
    if (!saveBulkNewTextureButton) console.error('ERROR: save-bulk-new-texture button not found!');

    // Get references to the bulk upload image section elements
    bulkUploadImageSection = document.getElementById('bulk-upload-image-section'); // New ID
    bulkUploadImageInput = document.getElementById('bulk-upload-image-input');
    bulkUploadImagePreview = document.getElementById('bulk-upload-image-preview');
    applyBulkUploadTextureButton = document.getElementById('apply-bulk-upload-texture');
    bulkUploadPreviewPlaceholder = document.getElementById('bulk-upload-preview-placeholder');

    if (!bulkUploadImageSection) console.error('ERROR: bulk-upload-image-section not found!');
    if (!bulkUploadImageInput) console.error('ERROR: bulk-upload-image-input not found!');
    if (!bulkUploadImagePreview) console.error('ERROR: bulk-upload-image-preview not found!');
    if (!applyBulkUploadTextureButton) console.error('ERROR: apply-bulk-upload-texture button not found!');
    if (!bulkUploadPreviewPlaceholder) console.error('ERROR: bulk-upload-preview-placeholder not found!');

    // New: Get references to the bulk upload audio section elements
    bulkUploadAudioSection = document.getElementById('bulk-upload-audio-section'); // New ID
    bulkUploadAudioInput = document.getElementById('bulk-upload-audio-input');
    bulkUploadAudioPreview = document.getElementById('bulk-upload-audio-preview');
    applyBulkUploadAudioButton = document.getElementById('apply-bulk-upload-audio');
    bulkUploadAudioPreviewPlaceholder = document.getElementById('bulk-upload-audio-preview-placeholder');

    if (!bulkUploadAudioSection) console.error('ERROR: bulk-upload-audio-section not found!');
    if (!bulkUploadAudioInput) console.error('ERROR: bulk-upload-audio-input not found!');
    if (!bulkUploadAudioPreview) console.error('ERROR: bulk-upload-audio-preview not found!');
    if (!applyBulkUploadAudioButton) console.error('ERROR: apply-bulk-upload-audio button not found!');
    if (!bulkUploadAudioPreviewPlaceholder) console.error('ERROR: bulk-upload-audio-preview-placeholder not found!');


    // Add Event Listeners
    if (toggleMultiSelectButton) {
        toggleMultiSelectButton.addEventListener('click', toggleMultiSelectMode);
    }

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

    // Add event listeners for the bulk upload image section
    if (bulkUploadImageInput) {
        bulkUploadImageInput.addEventListener('change', handleBulkImageUpload);
    }
    if (applyBulkUploadTextureButton) {
        applyBulkUploadTextureButton.addEventListener('click', applyBulkUploadedTexture);
    }

    // New: Add event listeners for the bulk upload audio section
    if (bulkUploadAudioInput) {
        bulkUploadAudioInput.addEventListener('change', handleBulkAudioUpload);
    }
    if (applyBulkUploadAudioButton) {
        applyBulkUploadAudioButton.addEventListener('click', applyBulkUploadedAudio);
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
        }
    } else {
        toggleMultiSelectButton.textContent = 'Select Assets';
        // Hide bulk action buttons container
        if (multiSelectActionsContainer) {
            multiSelectActionsContainer.style.display = 'none';
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
    // asset-list-page.js now handles the type conflict check.
    // This function simply adds/removes the asset from the selectedAssets Set.
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
    updateBulkActionButtonsState(); // Crucial call to update button disabled state and modal sections
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
 * Also controls the visibility of image/audio specific bulk operation sections in the modal.
 */
function updateBulkActionButtonsState() {
    const enableButton = selectedAssets.size >= 1; // Enable if at least one asset is selected

    if (openBulkEditButton) {
        openBulkEditButton.disabled = !enableButton;
        openBulkEditButton.style.opacity = enableButton ? '1' : '0.5';
        openBulkEditButton.style.pointerEvents = enableButton ? 'auto' : 'none';
    }

    // Determine if selected assets are all images, all audio, or mixed
    let hasImage = false;
    let hasAudio = false;

    selectedAssets.forEach(asset => {
        if (asset.type.toLowerCase() === 'png' || asset.type.toLowerCase() === 'jpg') {
            hasImage = true;
        } else if (asset.type.toLowerCase() === 'mp3') {
            hasAudio = true;
        }
    });

    // Control visibility of bulk upload sections in the modal
    // These will be controlled when the modal is opened/updated
    // For now, this function primarily updates the openBulkEditButton
    // The actual display logic for the modal sections will be in openBulkOperationsModal
    // and potentially a refreshModalContents function if selections change *while* modal is open.
}

/**
 * Opens the bulk operations modal.
 */
function openBulkOperationsModal() {
    if (!bulkOperationsModal) {
        console.error('Bulk operations modal not found!');
        return;
    }

    // Reset all modal inputs to default values each time modal is opened
    if (bulkSaturationSlider) bulkSaturationSlider.value = 100;
    if (bulkSaturationValueDisplay) bulkSaturationValueDisplay.textContent = '100%';
    if (bulkNewTextureWidthInput) bulkNewTextureWidthInput.value = 512;
    if (bulkNewTextureHeightInput) bulkNewTextureHeightInput.value = 512;
    if (bulkNewTextureColorInput) bulkNewTextureColorInput.value = '#6c5ce7';

    // Reset bulk upload image section
    if (bulkUploadImageInput) bulkUploadImageInput.value = '';
    if (bulkUploadImagePreview) {
        bulkUploadImagePreview.src = '';
        bulkUploadImagePreview.style.display = 'none';
    }
    if (bulkUploadPreviewPlaceholder) bulkUploadPreviewPlaceholder.style.display = 'block';
    uploadedImageBlob = null;
    if (applyBulkUploadTextureButton) applyBulkUploadTextureButton.disabled = true;

    // New: Reset bulk upload audio section
    if (bulkUploadAudioInput) bulkUploadAudioInput.value = '';
    if (bulkUploadAudioPreview) {
        bulkUploadAudioPreview.innerHTML = '<i class="fas fa-music"></i> Audio File'; // Display a generic audio icon
        bulkUploadAudioPreview.style.display = 'none';
    }
    if (bulkUploadAudioPreviewPlaceholder) bulkUploadAudioPreviewPlaceholder.style.display = 'block';
    uploadedAudioBlob = null;
    if (applyBulkUploadAudioButton) applyBulkUploadAudioButton.disabled = true;

    // Determine the type of selected assets to show relevant sections
    let hasImage = false;
    let hasAudio = false;

    selectedAssets.forEach(asset => {
        if (asset.type.toLowerCase() === 'png' || asset.type.toLowerCase() === 'jpg') {
            hasImage = true;
        } else if (asset.type.toLowerCase() === 'mp3') {
            hasAudio = true;
        }
    });

    // Control visibility of bulk sections based on selected asset types
    // Image-specific sections
    if (bulkUploadImageSection) {
        bulkUploadImageSection.style.display = hasImage && !hasAudio ? 'block' : 'none';
    }
    // Audio-specific sections
    if (bulkUploadAudioSection) {
        bulkUploadAudioSection.style.display = hasAudio && !hasImage ? 'block' : 'none';
    }

    // If both types somehow selected (should be prevented by asset-list-page.js)
    // or if no selection, hide all specific sections and show a message or disable operations.
    if (hasImage && hasAudio) {
        console.error('Mixed image and audio selection detected in bulk operations modal. This state should be prevented by asset-list-page.js.');
        if (bulkUploadImageSection) bulkUploadImageSection.style.display = 'none';
        if (bulkUploadAudioSection) bulkUploadAudioSection.style.display = 'none';
        window.updateConsoleLog('[ERROR] Mixed image and audio assets selected. Bulk operations not supported for mixed types.');
        // Optionally display a more prominent message in the modal itself
    } else if (!hasImage && !hasAudio) {
        // No assets selected, hide sections
        if (bulkUploadImageSection) bulkUploadImageSection.style.display = 'none';
        if (bulkUploadAudioSection) bulkUploadAudioSection.style.display = 'none';
    }


    bulkOperationsModal.classList.add('active');
    console.log(`Bulk operations modal opened.`);
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
        window.updateConsoleLog('[WARNING] No assets selected for bulk saturation.');
        return;
    }
    // Show loading overlay for bulk operation
    window.showLoadingOverlay('Applying Saturation...');
    const totalAssets = Array.from(selectedAssets).filter(asset => asset.type.toLowerCase() !== 'mp3').length;
    let processedCount = 0;
    const saturationFactor = bulkSaturationSlider.value / 100;
    console.log(`Starting bulk saturation for ${totalAssets} image assets with factor: ${saturationFactor}`);

    for (const asset of selectedAssets) {
        if (asset.type.toLowerCase() === 'mp3') {
            // This should ideally not happen if openBulkOperationsModal hides relevant sections,
            // but is a safe guard.
            window.updateConsoleLog(`Skipping saturation for MP3 asset: ${asset.filename}`);
            continue;
        }
        try {
            window.updateConsoleLog(`Processing saturation for: ${asset.filename}`);
            let imageBlob = asset.modifiedImageBlob || asset.originalImageBlob; // Use modified if exists, else original

            if (!imageBlob) {
                // Fallback: If blob not in memory, fetch it (should be pre-loaded by loadAllAssetsIntoMemory for export)
                const response = await fetch(asset.mediaPath);
                if (!response.ok) throw new Error(`Failed to fetch original image for saturation: ${response.statusText}`);
                imageBlob = await response.blob();
                asset.originalImageBlob = imageBlob; // Cache it
            }

            // Convert to PNG for saturation processing if it's JPG (image-converter.js is PNG/JPG specific)
            const assetMimeType = `image/${asset.type.toLowerCase()}`;
            let processedBlob = imageBlob;
            if (asset.type.toLowerCase() === 'jpg') {
                 // Convert JPG to PNG for saturation
                window.updateConsoleLog(`Converting JPG to PNG for saturation: ${asset.filename}`);
                processedBlob = await window.convertImageBlob(imageBlob, 'image/png');
                if (!processedBlob) throw new Error('JPG to PNG conversion failed.');
            }

            const modifiedBlob = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.filter = `saturate(${saturationFactor * 100}%)`; // Apply saturation filter
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(blob => {
                        URL.revokeObjectURL(img.src);
                        resolve(blob);
                    }, 'image/png'); // Always convert to PNG for consistency after modification
                };
                img.onerror = (e) => {
                    URL.revokeObjectURL(img.src);
                    reject(new Error(`Error loading image for saturation: ${e.message}`));
                };
                img.src = URL.createObjectURL(processedBlob); // Use the potentially converted PNG blob
            });

            if (modifiedBlob) {
                asset.modifiedImageBlob = modifiedBlob;
                asset.isModified = true;
                asset.isNew = false;
                window.updateCardVisualState(asset); // Update individual card visual state
                window.updateConsoleLog(`Applied saturation to ${asset.filename}`);
            } else {
                throw new Error('Image saturation failed.');
            }

            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);

        } catch (error) {
            console.error(`Error applying saturation to ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Saturation failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk saturation application complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Saturation Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
}

/**
 * Saves a newly created bulk texture to all selected image assets.
 */
async function saveBulkNewTexture() {
    if (selectedAssets.size === 0) {
        console.warn('No assets selected for new texture creation. Operation aborted.');
        window.updateConsoleLog('[WARNING] No assets selected for new texture creation.');
        return;
    }

    const width = parseInt(bulkNewTextureWidthInput.value);
    const height = parseInt(bulkNewTextureHeightInput.value);
    const color = bulkNewTextureColorInput.value;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        window.updateConsoleLog('[ERROR] Invalid width or height for new texture.');
        return;
    }

    window.showLoadingOverlay('Creating New Textures...');
    const totalAssets = Array.from(selectedAssets).filter(asset => asset.type.toLowerCase() !== 'mp3').length;
    let processedCount = 0;

    // Create the new texture Blob once
    let newTextureBlob = null;
    try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.fillStyle = color;
        tempCtx.fillRect(0, 0, width, height);
        newTextureBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        if (!newTextureBlob) throw new Error('Failed to create new texture blob.');
        window.updateConsoleLog('New texture blob created successfully.');
    } catch (error) {
        console.error('Error creating new texture blob:', error);
        window.updateConsoleLog(`[ERROR] New texture creation failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'New Texture Creation Failed!');
        return;
    }

    for (const asset of selectedAssets) {
        if (asset.type.toLowerCase() === 'mp3') {
            window.updateConsoleLog(`Skipping new texture creation for MP3 asset: ${asset.filename}`);
            continue;
        }
        try {
            asset.newImageBlob = newTextureBlob; // Assign the same blob reference
            asset.isNew = true;
            asset.isModified = false;
            window.updateCardVisualState(asset);
            window.updateConsoleLog(`Applied new texture to ${asset.filename}`);

            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);

        } catch (error) {
            console.error(`Error applying new texture to ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Application failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk new texture creation complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk New Texture Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation
}

/**
 * Handles the file input change for bulk image uploads.
 * @param {Event} event The change event.
 */
function handleBulkImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            window.updateConsoleLog('[WARNING] Please upload an image file (PNG/JPG).');
            // Clear input and disable button
            event.target.value = '';
            bulkUploadImagePreview.src = '';
            bulkUploadImagePreview.style.display = 'none';
            bulkUploadPreviewPlaceholder.style.display = 'block';
            applyBulkUploadTextureButton.disabled = true;
            uploadedImageBlob = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            bulkUploadImagePreview.src = e.target.result;
            bulkUploadImagePreview.style.display = 'block';
            bulkUploadPreviewPlaceholder.style.display = 'none';
            applyBulkUploadTextureButton.disabled = false;
            uploadedImageBlob = file; // Store the raw file blob
            window.updateConsoleLog(`Image selected for bulk upload: ${file.name}`);
        };
        reader.readAsDataURL(file);
    } else {
        bulkUploadImagePreview.src = '';
        bulkUploadImagePreview.style.display = 'none';
        bulkUploadPreviewPlaceholder.style.display = 'block';
        applyBulkUploadTextureButton.disabled = true;
        uploadedImageBlob = null;
        window.updateConsoleLog('No image selected for bulk upload.');
    }
}

/**
 * Applies the uploaded image texture to all selected image assets.
 */
async function applyBulkUploadedTexture() {
    if (selectedAssets.size === 0 || !uploadedImageBlob) {
        console.warn('No assets selected or no image uploaded for bulk application. Operation aborted.');
        window.updateConsoleLog('[WARNING] No assets selected or no image uploaded for bulk texture application.');
        return;
    }

    window.showLoadingOverlay('Applying Uploaded Texture...');
    const totalAssets = Array.from(selectedAssets).filter(asset => asset.type.toLowerCase() !== 'mp3').length;
    let processedCount = 0;

    for (const asset of selectedAssets) {
        if (asset.type.toLowerCase() === 'mp3') {
            window.updateConsoleLog(`Skipping texture application for MP3 asset: ${asset.filename}`);
            continue;
        }
        try {
            window.updateConsoleLog(`Processing uploaded texture for: ${asset.filename}`);
            // Determine the target MIME type for conversion based on the asset's original type
            const assetMimeType = `image/${asset.type.toLowerCase()}`; // e.g., 'image/png' or 'image/jpg'

            let finalBlob = uploadedImageBlob;
            // Only convert if the uploaded image type does not match the asset's original type
            if (uploadedImageBlob.type !== assetMimeType) {
                window.updateConsoleLog(`Converting uploaded image from ${uploadedImageBlob.type} to ${assetMimeType} for ${asset.filename}`);
                finalBlob = await window.convertImageBlob(uploadedImageBlob, assetMimeType);
            }

            if (finalBlob) {
                asset.newImageBlob = finalBlob;
                asset.isNew = true;
                asset.isModified = false;
                window.updateCardVisualState(asset); // Update individual card visual state
                window.updateConsoleLog(`Applied new texture to ${asset.filename}`);
            } else {
                throw new Error('Image conversion or application failed.');
            }

            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);

        } catch (error) {
            console.error(`Error applying uploaded texture to ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Application failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk uploaded texture application complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Upload Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation

    // Reset the upload form
    bulkUploadImageInput.value = '';
    bulkUploadImagePreview.src = '';
    bulkUploadImagePreview.style.display = 'none';
    bulkUploadPreviewPlaceholder.style.display = 'block';
    uploadedImageBlob = null;
    applyBulkUploadTextureButton.disabled = true;
}


/**
 * Handles the file input change for bulk audio (MP3) uploads.
 * @param {Event} event The change event.
 */
function handleBulkAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type !== 'audio/mpeg') { // Check specifically for MP3
            window.updateConsoleLog('[WARNING] Please upload an MP3 audio file (.mp3).');
            // Clear input and disable button
            event.target.value = '';
            if (bulkUploadAudioPreview) {
                bulkUploadAudioPreview.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Invalid File Type';
                bulkUploadAudioPreview.style.display = 'block';
            }
            if (bulkUploadAudioPreviewPlaceholder) bulkUploadAudioPreviewPlaceholder.style.display = 'none';
            if (applyBulkUploadAudioButton) applyBulkUploadAudioButton.disabled = true;
            uploadedAudioBlob = null;
            return;
        }

        // Display filename or generic audio icon for preview
        if (bulkUploadAudioPreview) {
            bulkUploadAudioPreview.innerHTML = `<i class="fas fa-music"></i> ${file.name}`;
            bulkUploadAudioPreview.style.display = 'block';
        }
        if (bulkUploadAudioPreviewPlaceholder) bulkUploadAudioPreviewPlaceholder.style.display = 'none';
        if (applyBulkUploadAudioButton) applyBulkUploadAudioButton.disabled = false;
        uploadedAudioBlob = file; // Store the raw file blob
        window.updateConsoleLog(`MP3 selected for bulk upload: ${file.name}`);

    } else {
        if (bulkUploadAudioPreview) {
            bulkUploadAudioPreview.innerHTML = '<i class="fas fa-music"></i> Audio File';
            bulkUploadAudioPreview.style.display = 'none';
        }
        if (bulkUploadAudioPreviewPlaceholder) bulkUploadAudioPreviewPlaceholder.style.display = 'block';
        if (applyBulkUploadAudioButton) applyBulkUploadAudioButton.disabled = true;
        uploadedAudioBlob = null;
        window.updateConsoleLog('No MP3 selected for bulk upload.');
    }
}

/**
 * Applies the uploaded audio (MP3) file to all selected audio assets.
 */
async function applyBulkUploadedAudio() {
    if (selectedAssets.size === 0 || !uploadedAudioBlob) {
        console.warn('No assets selected or no MP3 uploaded for bulk application. Operation aborted.');
        window.updateConsoleLog('[WARNING] No assets selected or no MP3 uploaded for bulk audio application.');
        return;
    }

    window.showLoadingOverlay('Applying Uploaded Audio...');
    const totalAssets = Array.from(selectedAssets).filter(asset => asset.type.toLowerCase() === 'mp3').length;
    let processedCount = 0;

    for (const asset of selectedAssets) {
        if (asset.type.toLowerCase() !== 'mp3') {
            window.updateConsoleLog(`Skipping audio application for non-MP3 asset: ${asset.filename}`);
            continue;
        }
        try {
            window.updateConsoleLog(`Processing uploaded audio for: ${asset.filename}`);

            // Replace the newAudioBlob with the uploaded one
            asset.newAudioBlob = uploadedAudioBlob;
            asset.isNew = true; // Treat as new/replaced for export purposes
            asset.isModified = true; // Also mark as modified
            window.updateCardVisualState(asset); // Update individual card visual state (if applicable for audio)
            window.updateConsoleLog(`Applied new audio to ${asset.filename}`);

            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);

        } catch (error) {
            console.error(`Error applying uploaded audio to ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Application failed for: ${asset.filename} - ${error.message}`);
        }
    }

    window.updateConsoleLog('\nBulk uploaded audio application complete.');
    window.hideLoadingOverlayWithDelay(3000, 'Bulk Audio Upload Complete!');
    closeBulkOperationsModal();
    toggleMultiSelectMode(); // Exit multi-select mode after operation

    // Reset the upload form
    if (bulkUploadAudioInput) bulkUploadAudioInput.value = '';
    if (bulkUploadAudioPreview) {
        bulkUploadAudioPreview.innerHTML = '<i class="fas fa-music"></i> Audio File';
        bulkUploadAudioPreview.style.display = 'none';
    }
    if (bulkUploadAudioPreviewPlaceholder) bulkUploadAudioPreviewPlaceholder.style.display = 'block';
    uploadedAudioBlob = null;
    if (applyBulkUploadAudioButton) applyBulkUploadAudioButton.disabled = true;
}