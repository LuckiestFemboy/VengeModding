// session-manager.js
// This file handles exporting and importing the state of edited textures.

// Function to convert Blob to Base64 string
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Function to convert Base64 string to Blob
function base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
}

/**
 * Exports the current state of edited textures to a JSON file.
 */
window.exportSession = async () => {
    if (typeof window.showLoadingOverlay === 'function') {
        window.showLoadingOverlay();
        window.updateLoadingProgress(0, 1, 'Preparing session export...');
        window.updateConsoleLog('Starting session export...');
    }

    try {
        const sessionData = [];
        const totalAssets = window.allAssets.filter(asset => asset.isModified || asset.isNew).length;
        let processedCount = 0;

        for (const asset of window.allAssets) {
            if (asset.isModified || asset.isNew) {
                if (asset.newImageBlob) {
                    window.updateLoadingProgress(processedCount, totalAssets, `Exporting: ${asset.filename}`);
                    window.updateConsoleLog(`Serializing ${asset.filename}...`);
                    const base64Image = await blobToBase64(asset.newImageBlob);
                    sessionData.push({
                        folder: asset.folder,
                        filename: asset.filename,
                        type: asset.type,
                        mediaPath: asset.mediaPath, // Keep original path for reference
                        newImageBase64: base64Image,
                        newImageMimeType: asset.newImageBlob.type,
                        isNew: asset.isNew,
                        isModified: asset.isModified
                    });
                    processedCount++;
                } else {
                    window.updateConsoleLog(`[WARNING] No newImageBlob found for modified/new asset: ${asset.filename}`);
                }
            }
        }

        const jsonString = JSON.stringify(sessionData, null, 2);
        const sessionBlob = new Blob([jsonString], { type: 'application/json' });
        saveAs(sessionBlob, 'texture_session.json'); // saveAs is from FileSaver.js

        window.updateConsoleLog('Session export complete!');
        window.hideLoadingOverlayWithDelay(3000, 'Session Export Complete!');
    } catch (error) {
        console.error('Error exporting session:', error);
        window.updateConsoleLog(`[ERROR] Session export failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Session Export Failed!');
    }
};

/**
 * Initiates the import of a session file.
 */
window.importSession = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json'; // Accept only JSON files
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (typeof window.showLoadingOverlay === 'function') {
            window.showLoadingOverlay();
            window.updateLoadingProgress(0, 1, 'Reading session file...');
            window.updateConsoleLog('Starting session import...');
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    const totalEntries = importedData.length;
                    let processedCount = 0;

                    for (const importedAssetData of importedData) {
                        window.updateLoadingProgress(processedCount, totalEntries, `Importing: ${importedAssetData.filename}`);
                        window.updateConsoleLog(`Processing ${importedAssetData.filename}...`);

                        // Find the corresponding asset in the global allAssets array
                        const targetAsset = window.allAssets.find(asset =>
                            asset.filename === importedAssetData.filename && asset.folder === importedAssetData.folder
                        );

                        if (targetAsset && importedAssetData.newImageBase64) {
                            const newBlob = base64ToBlob(importedAssetData.newImageBase64, importedAssetData.newImageMimeType);
                            targetAsset.newImageBlob = newBlob;
                            targetAsset.isNew = importedAssetData.isNew;
                            targetAsset.isModified = importedAssetData.isModified;
                            
                            // Update the card's visual state if the function exists
                            if (typeof window.updateCardVisualState === 'function') {
                                window.updateCardVisualState(targetAsset);
                            }
                            window.updateConsoleLog(`Applied imported state to ${targetAsset.filename}`);
                        } else if (!targetAsset) {
                            window.updateConsoleLog(`[WARNING] Asset not found for imported data: ${importedAssetData.filename}. Skipping.`);
                        } else {
                             window.updateConsoleLog(`[WARNING] No newImageBase64 found for imported asset: ${importedAssetData.filename}. Skipping.`);
                        }
                        processedCount++;
                    }

                    window.updateConsoleLog('Session import complete!');
                    window.hideLoadingOverlayWithDelay(3000, 'Session Import Complete!');
                } catch (parseError) {
                    console.error('Error parsing session file:', parseError);
                    window.updateConsoleLog(`[ERROR] Failed to parse session file: ${parseError.message}`);
                    window.hideLoadingOverlayWithDelay(3000, 'Import Failed (Parse Error)!');
                }
            };
            reader.onerror = (readError) => {
                console.error('Error reading file:', readError);
                window.updateConsoleLog(`[ERROR] Failed to read session file: ${readError.message}`);
                window.hideLoadingOverlayWithDelay(3000, 'Import Failed (Read Error)!');
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Error initiating session import:', error);
            window.updateConsoleLog(`[ERROR] Session import initiation failed: ${error.message}`);
            window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
        }
    };
    input.click(); // Programmatically click the input to open file dialog
};