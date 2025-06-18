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

                let processedCount = 0;
                const totalAssetsToProcess = importedData.modifiedAssets.length;

                for (const importedAssetData of importedData.modifiedAssets) {
                    const existingAsset = window.allAssets.find(a =>
                        a.folder === importedAssetData.folder && a.filename === importedAssetData.filename
                    );

                    if (existingAsset) {
                        // Restore image blobs if present
                        if (importedAssetData.modifiedImageBlobBase64) {
                            existingAsset.modifiedImageBlob = await dataURLtoBlob(importedAssetData.modifiedImageBlobBase64);
                        }
                        if (importedAssetData.newImageBlobBase64) {
                            existingAsset.newImageBlob = await dataURLtoBlob(importedAssetData.newImageBlobBase64);
                        }

                        // NEW: Restore audio blobs if present
                        if (importedAssetData.newAudioBlobBase64) {
                            existingAsset.newAudioBlob = await dataURLtoBlob(importedAssetData.newAudioBlobBase64);
                            // Set type for consistency if imported
                            existingAsset.type = 'mp3'; // Ensure type is correctly set if a new audio blob is imported
                        }

                        existingAsset.isModified = importedAssetData.isModified;
                        existingAsset.isNew = importedAssetData.isNew;
                        // Ensure card visual state is updated after import
                        window.updateCardVisualState(existingAsset);
                        window.updateConsoleLog(`Imported changes for: ${existingAsset.filename}`);
                    } else {
                        window.updateConsoleLog(`[WARNING] Asset not found in current list: ${importedAssetData.filename} in folder ${importedAssetData.folder}`);
                        // Optionally, add logic here to create new assets if they didn't exist in the original lists
                    }
                    processedCount++;
                    window.updateLoadingProgress(processedCount, totalAssetsToProcess, `Processed: ${importedAssetData.filename}`);
                }
                window.hideLoadingOverlayWithDelay(3000, 'Import Complete!');
                window.updateConsoleLog('Import process finished. Refreshing gallery...');
            } catch (parseError) {
                console.error('Error parsing JSON or processing imported data:', parseError);
                window.updateConsoleLog(`[ERROR] Invalid JSON file or data structure: ${parseError.message}`);
                window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error handling import file:', error);
        window.updateConsoleLog(`[ERROR] Failed to read file: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
    } finally {
        // Reset the file input to allow selecting the same file again if needed
        event.target.value = '';
    }
}

/**
 * Exports currently modified/new assets to a JSON file.
 */
async function exportChanges() {
    window.showLoadingOverlay('Exporting Changes...');
    window.updateConsoleLog('Collecting modified assets...');

    const modifiedAssetsToExport = [];
    let processedCount = 0;
    // Filter only assets that are marked as modified or new
    const assetsForExport = window.allAssets.filter(asset => asset.isModified || asset.isNew);
    const totalAssets = assetsForExport.length;

    for (const asset of assetsForExport) {
        window.updateConsoleLog(`Preparing ${asset.filename} for export...`);
        const exportAsset = {
            folder: asset.folder,
            filename: asset.filename,
            type: asset.type, // Include the type
            isModified: asset.isModified,
            isNew: asset.isNew,
            modifiedImageBlobBase64: null,
            newImageBlobBase64: null,
            newAudioBlobBase64: null // NEW: Placeholder for audio blob
        };

        try {
            // Handle image blobs
            if (asset.modifiedImageBlob) {
                exportAsset.modifiedImageBlobBase64 = await blobToBase64(asset.modifiedImageBlob);
            }
            if (asset.newImageBlob) {
                exportAsset.newImageBlobBase64 = await blobToBase64(asset.newImageBlob);
            }
            // NEW: Handle audio blobs
            if (asset.newAudioBlob) {
                exportAsset.newAudioBlobBase64 = await blobToBase64(asset.newAudioBlob);
            }

            modifiedAssetsToExport.push(exportAsset);
        } catch (error) {
            console.error(`Error converting blob for ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Failed to convert blob for: ${asset.filename} - ${error.message}`);
        }
        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssets, `Exporting: ${asset.filename}`);
    }

    const exportData = {
        exportedAt: new Date().toISOString(),
        modifiedAssets: modifiedAssetsToExport
    };

    const jsonString = JSON.stringify(exportData, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Use FileSaver.js to prompt download
    saveAs(blob, 'venge_mod_changes.json'); // Changed filename slightly for clarity

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