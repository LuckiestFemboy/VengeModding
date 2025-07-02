/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// import-export.js

// Get references to the new buttons and file input
const importFileInput = document.getElementById('import-file-input');
const importChangesButton = document.getElementById('import-changes-button');
const exportChangesButton = document.getElementById('export-changes-button');

document.addEventListener('DOMContentLoaded', () => {
    if (importFileInput && importChangesButton && exportChangesButton) {
        importChangesButton.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', handleImportFile);
        exportChangesButton.addEventListener('click', exportChanges);
    } else {
        console.error('Import/Export DOM elements not found!');
    }
});

/**
 * Handles the selected JSON file for import.
 * @param {Event} event The change event from the file input.
 */
async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    if (file.type !== 'application/json') {
        alert('Please select a valid JSON file.');
        return;
    }

    window.showLoadingOverlay('Importing Changes...');

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Assuming allAssets is available globally from asset-list-page.js
                if (!window.allAssets) {
                    throw new Error('window.allAssets is not defined. Asset list not loaded.');
                }

                let processedCount = 0;
                const totalChanges = Object.keys(importedData.modifications).length + Object.keys(importedData.newAssets).length;
                window.updateConsoleLog(`Processing ${totalChanges} changes...`);

                // Process modified assets
                for (const mediaPath in importedData.modifications) {
                    const modifiedAssetData = importedData.modifications[mediaPath];
                    const targetAsset = window.allAssets.find(asset => asset.mediaPath === mediaPath);

                    if (targetAsset) {
                        if (modifiedAssetData.dataURL) {
                            targetAsset.modifiedImageBlob = await dataURLtoBlob(modifiedAssetData.dataURL);
                            targetAsset.isModified = true;
                            // Update filename if it was changed
                            if (modifiedAssetData.filename && targetAsset.filename !== modifiedAssetData.filename) {
                                targetAsset.filename = modifiedAssetData.filename;
                                // Update the displayed filename on the card
                                const filenameElement = targetAsset.cardElement.querySelector('.texture-filename');
                                if (filenameElement) {
                                    filenameElement.textContent = targetAsset.filename;
                                }
                            }
                        } else {
                            console.warn(`No dataURL found for modified asset: ${mediaPath}`);
                        }
                    } else {
                        window.updateConsoleLog(`[WARN] Original asset not found for modified entry: ${mediaPath}`);
                    }
                    processedCount++;
                    window.updateLoadingProgress(processedCount, totalChanges, `Applied: ${targetAsset ? targetAsset.filename : mediaPath}`);
                }

                // Process new assets
                for (const newAssetKey in importedData.newAssets) {
                    const newAssetData = importedData.newAssets[newAssetKey];
                    // Check if an asset with this mediaPath already exists to prevent duplicates on re-import
                    let existingAsset = window.allAssets.find(asset => asset.mediaPath === newAssetData.mediaPath);

                    if (!existingAsset) {
                        const newAssetBlob = await dataURLtoBlob(newAssetData.dataURL);
                        const newAsset = {
                            folder: newAssetData.folder,
                            filename: newAssetData.filename,
                            type: newAssetData.type,
                            mediaPath: newAssetData.mediaPath, // Use the new mediaPath to identify it
                            originalImageBlob: null,
                            modifiedImageBlob: null, // New assets are not 'modified' originals
                            newImageBlob: newAssetBlob, // Store the blob for the new asset
                            isModified: false,
                            isNew: true,
                            isExcluded: false // New assets start as not excluded
                        };
                        window.allAssets.push(newAsset);
                        window.createAndAppendCard(newAsset); // Add to the DOM
                        window.updateConsoleLog(`Added new asset: ${newAsset.filename}`);
                    } else {
                        // If it exists, update its newImageBlob and mark as new (useful for re-importing the same file)
                        existingAsset.newImageBlob = await dataURLtoBlob(newAssetData.dataURL);
                        existingAsset.isNew = true;
                        existingAsset.isModified = false;
                        window.updateConsoleLog(`Updated existing new asset: ${existingAsset.filename}`);
                    }
                    processedCount++;
                    window.updateLoadingProgress(processedCount, totalChanges, `Added: ${newAssetData.filename}`);
                }

                // After processing all, update card visuals
                window.allAssets.forEach(asset => {
                    if (asset.cardElement) {
                        window.updateCardVisualState(asset);
                    }
                });


                window.updateConsoleLog('\nImport complete. Refreshing gallery display...');
                window.hideLoadingOverlayWithDelay(2000, 'Import Successful!');

            } catch (parseError) {
                console.error('Error parsing or processing imported JSON:', parseError);
                window.updateConsoleLog(`[ERROR] Failed to import changes: ${parseError.message}`);
                window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error reading import file:', error);
        window.updateConsoleLog(`[ERROR] Error reading file: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
    } finally {
        event.target.value = ''; // Clear the file input
    }
}

/**
 * Exports modified and new assets to a JSON file.
 * This function now filters out assets marked as `isExcluded`.
 */
async function exportChanges() {
    window.showLoadingOverlay('Exporting Changes...');
    const exportData = {
        modifications: {},
        newAssets: {},
        // No need to export an 'excluded' list for now, as exclusion is for local filtering
        // If we wanted to re-import exclusion states, we would add:
        // excludedAssets: []
    };

    let processedCount = 0;
    // Filter out excluded assets before processing for export
    const assetsToExport = window.allAssets.filter(asset => !asset.isExcluded);
    const totalAssetsToExport = assetsToExport.filter(asset => asset.isModified || asset.isNew).length;


    if (totalAssetsToExport === 0) {
        window.updateConsoleLog('No modified or new assets to export (or all are excluded).');
        window.hideLoadingOverlayWithDelay(2000, 'Nothing to Export!');
        return;
    }

    window.updateConsoleLog(`Preparing ${totalAssetsToExport} assets for export...`);

    for (const asset of assetsToExport) {
        if (asset.isModified && asset.modifiedImageBlob) {
            window.updateConsoleLog(`Processing modified: ${asset.filename}`);
            try {
                const dataURL = await blobToBase64(asset.modifiedImageBlob);
                exportData.modifications[asset.mediaPath] = {
                    dataURL: dataURL,
                    filename: asset.filename, // Store filename to allow changes on import
                    type: asset.type
                };
            } catch (error) {
                console.error(`Error converting modified asset ${asset.filename} to Base64:`, error);
                window.updateConsoleLog(`[ERROR] Failed to encode modified: ${asset.filename}`);
            }
        } else if (asset.isNew && asset.newImageBlob) {
            window.updateConsoleLog(`Processing new: ${asset.filename}`);
            // For new assets, we might need a unique identifier or just use their mediaPath in a separate object
            try {
                const dataURL = await blobToBase64(asset.newImageBlob);
                exportData.newAssets[asset.mediaPath] = { // Use mediaPath as key for new assets too
                    dataURL: dataURL,
                    folder: asset.folder,
                    filename: asset.filename,
                    type: asset.type,
                    mediaPath: asset.mediaPath // Store mediaPath for re-creation
                };
            } catch (error) {
                console.error(`Error converting new asset ${asset.filename} to Base64:`, error);
                window.updateConsoleLog(`[ERROR] Failed to encode new: ${asset.filename}`);
            }
        }
        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssetsToExport, `Processed: ${asset.filename}`);
    }

    const jsonString = JSON.stringify(exportData, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Use FileSaver.js to prompt download
    saveAs(blob, 'venge_texture_swapper_changes.json');

    window.hideLoadingOverlayWithDelay(3000, 'Changes exported successfully!');
}

/**
 * Converts a Blob object to a Base64 Data URL.
 * @param {Blob} blob The Blob to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 Data URL.
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Converts a Base64 Data URL string back to a Blob object.
 * @param {string} dataURL The Base64 Data URL string.
 * @returns {Promise<Blob>} A promise that resolves with the Blob object.
 */
function dataURLtoBlob(dataURL) {
    return new Promise((resolve) => {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        resolve(new Blob([uInt8Array], { type: contentType }));
    });
}

// Expose these functions globally if needed by other scripts (e.g., direct calls from console or other modules)
window.handleImportFile = handleImportFile;
window.exportChanges = exportChanges;
window.blobToBase64 = blobToBase64;
window.dataURLtoBlob = dataURLtoBlob;