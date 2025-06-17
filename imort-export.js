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
    window.updateConsoleLog('Reading import file...');

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                window.updateConsoleLog('File parsed. Processing assets...');

                await processImportedAssets(importedData);

                window.hideLoadingOverlayWithDelay(2000, 'Import Complete!');
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                window.updateConsoleLog(`[ERROR] Failed to parse JSON: ${parseError.message}`);
                window.hideLoadingOverlayWithDelay(3000, 'Import Failed (Invalid JSON)!');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error handling import file:', error);
        window.updateConsoleLog(`[ERROR] Error reading file: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
    } finally {
        // Clear the input so selecting the same file again triggers change event
        event.target.value = '';
    }
}

/**
 * Processes the imported asset data, updating the global allAssets array.
 * @param {Array<Object>} importedData An array of asset objects from the JSON.
 */
async function processImportedAssets(importedData) {
    if (!Array.isArray(importedData)) {
        window.updateConsoleLog('[ERROR] Imported data is not an array. Expected asset list.');
        return;
    }

    let processedCount = 0;
    const totalAssetsToProcess = importedData.length;

    for (const importedAsset of importedData) {
        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssetsToProcess, `Processing: ${importedAsset.filename}`);

        const existingAssetIndex = window.allAssets.findIndex(
            a => a.folder === importedAsset.folder && a.filename === importedAsset.filename && a.type === importedAsset.type
        );

        if (importedAsset.isNew && importedAsset.imageData) { // It's a new asset
            const newBlob = await dataURLtoBlob(importedAsset.imageData);
            const newAsset = {
                folder: importedAsset.folder,
                filename: importedAsset.filename,
                type: importedAsset.type,
                mediaPath: `./mod-assets/<span class="math-inline">\{importedAsset\.type\}/</span>{importedAsset.filename}`, // Reconstruct mediaPath
                originalImageBlob: null, // New assets don't have an original blob
                modifiedImageBlob: null,
                newImageBlob: newBlob,
                isModified: false,
                isNew: true
            };
            window.allAssets.push(newAsset);
            window.createAndAppendCard(newAsset); // Add new card to DOM
            window.updateConsoleLog(`Added new asset: ${importedAsset.filename}`);
        } else if (existingAssetIndex !== -1) {
            const existingAsset = window.allAssets[existingAssetIndex];

            if (importedAsset.isModified && importedAsset.imageData) {
                // Update existing asset with modified data
                const modifiedBlob = await dataURLtoBlob(importedAsset.imageData);
                existingAsset.modifiedImageBlob = modifiedBlob;
                existingAsset.isModified = true;
                existingAsset.isNew = false; // Cannot be both new and modified existing

                window.updateConsoleLog(`Updated modified asset: ${existingAsset.filename}`);
            } else if (!importedAsset.isModified && importedAsset.imageData && !existingAsset.originalImageBlob) {
                // If the imported asset wasn't marked modified, but has image data,
                // and our local originalImageBlob is missing, potentially load it.
                // This scenario might occur if the asset was imported as 'original' initially.
                // Be careful not to overwrite a locally present originalImageBlob unless intended.
                // For simplicity, we assume 'imageData' only comes with 'isModified' or 'isNew'.
                window.updateConsoleLog(`Asset ${existingAsset.filename} has imageData but no modification flag. Skipping blob update.`);
            } else if (!importedAsset.isModified && !importedAsset.isNew && existingAsset.isModified) {
                // Imported version is not modified, but local is. Reset local.
                // This means the imported JSON is "undoing" a local modification.
                existingAsset.modifiedImageBlob = null;
                existingAsset.isModified = false;
                window.updateConsoleLog(`Resetting local modification for: ${existingAsset.filename}`);
            }

            // Always update card visual state to reflect changes (or lack thereof)
            if (existingAsset.cardElement) {
                window.updateCardVisualState(existingAsset);
            } else {
                // If the card element doesn't exist (e.g., gallery not fully rendered yet),
                // it will be created with the correct state when initializeGallery runs.
                // For a robust solution, you might re-call createAndAppendCard if it's missing,
                // but usually, all cards are present if an import is happening after initial load.
                window.createAndAppendCard(existingAsset); // Re-create if somehow missing
                window.updateConsoleLog(`Recreated card for: ${existingAsset.filename}`);
            }
        } else {
            // Asset in imported JSON not found locally and not marked as new.
            // This might happen if your local asset list is older.
            // You might want to log a warning or add it as a new asset if appropriate.
            window.updateConsoleLog(`[WARNING] Asset from import not found locally and not marked new: ${importedAsset.filename}`);
        }
    }
    window.allCards = document.querySelectorAll('.texture-card'); // Re-query allCards after potential additions/updates
}


/**
 * Exports modified and new assets to a JSON file.
 */
async function exportChanges() {
    window.showLoadingOverlay('Exporting Changes...');
    window.updateConsoleLog('Collecting modified and new assets...');

    const changesToExport = [];
    let processedCount = 0;
    const totalAssetsToProcess = window.allAssets.filter(a => a.isModified || a.isNew).length;

    for (const asset of window.allAssets) {
        if (asset.isModified || asset.isNew) {
            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssetsToProcess, `Exporting: ${asset.filename}`);

            let imageData = null;
            if (asset.type !== 'mp3' && (asset.modifiedImageBlob || asset.newImageBlob)) {
                // Convert the relevant image blob to Base64 for export
                try {
                    const blobToConvert = asset.isNew ? asset.newImageBlob : asset.modifiedImageBlob;
                    if (blobToConvert) {
                        imageData = await blobToBase64(blobToConvert);
                        window.updateConsoleLog(`Encoded blob for ${asset.filename}`);
                    }
                } catch (encodeError) {
                    console.error(`Error encoding blob for ${asset.filename}:`, encodeError);
                    window.updateConsoleLog(`[ERROR] Failed to encode image for export: ${asset.filename}`);
                }
            } else if (asset.type === 'mp3' && asset.isModified) {
                // MP3s are currently not modified via the editor, but if they were,
                // you'd handle their data similarly or by re-fetching the original if needed.
                // For now, only image blobs are handled for export.
                window.updateConsoleLog(`MP3 ${asset.filename} is marked modified, but MP3s are not directly exportable with data yet.`);
            }

            changesToExport.push({
                folder: asset.folder,
                filename: asset.filename,
                type: asset.type,
                isModified: asset.isModified,
                isNew: asset.isNew,
                imageData: imageData // Base64 representation of the image blob
                // Note: mediaPath is not exported as it's relative to the original source.
                // We reconstruct it on import.
            });
            window.updateConsoleLog(`Added ${asset.filename} to export list.`);
        }
    }

    if (changesToExport.length === 0) {
        window.hideLoadingOverlayWithDelay(2000, 'No changes to export.');
        return;
    }

    window.updateConsoleLog('\nAll relevant assets collected. Generating JSON...');

    const jsonString = JSON.stringify(changesToExport, null, 2); // Pretty print JSON
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