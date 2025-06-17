// config-manager.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to the new buttons and file input
    const exportConfigButton = document.getElementById('export-config-button');
    const importConfigButton = document.getElementById('import-config-button');
    const importConfigInput = document.getElementById('import-config-input');

    if (exportConfigButton && importConfigButton && importConfigInput) {
        exportConfigButton.addEventListener('click', exportConfig);
        importConfigButton.addEventListener('click', () => importConfigInput.click()); // Trigger file input click
        importConfigInput.addEventListener('change', handleImportConfig);
    } else {
        console.error('One or more config management DOM elements not found!');
    }
});

/**
 * Exports the current state of modified asset cards to a JSON file.
 * The file includes details about saturation changes and new textures created.
 */
function exportConfig() {
    if (typeof allAssets === 'undefined' || !Array.isArray(allAssets)) {
        console.error('allAssets array is not available or not an array.');
        window.updateConsoleLog('[ERROR] Cannot export config: Asset data not available.');
        return;
    }

    const config = [];

    allAssets.forEach(asset => {
        // Only include assets that have been modified or are newly created
        if (asset.isModified || asset.isNew) {
            const assetConfig = {
                id: asset.id, // Assuming each asset has a unique 'id'
                filename: asset.filename,
                type: asset.type,
                modifiedState: {}
            };

            if (asset.isModified && asset.modifiedSaturation !== undefined) {
                assetConfig.modifiedState.saturation = asset.modifiedSaturation;
            }

            if (asset.isNew && asset.newImageDetails) {
                // If it's a new texture, save its creation details
                assetConfig.modifiedState.newTexture = {
                    width: asset.newImageDetails.width,
                    height: asset.newImageDetails.height,
                    color: asset.newImageDetails.color
                };
            }
            // Add other modification types here if they are introduced (e.g., cropping, rotation)
            // if (asset.isCropped) { assetConfig.modifiedState.crop = asset.cropDetails; }

            config.push(assetConfig);
        }
    });

    if (config.length === 0) {
        window.updateConsoleLog('No modified assets to export.');
        alert('No modified or new assets to export.');
        return;
    }

    const configJson = JSON.stringify(config, null, 2); // Pretty print JSON
    const blob = new Blob([configJson], { type: 'application/json' });
    saveAs(blob, `venge-texture-gallery-config-${new Date().toISOString().slice(0,10)}.json`);
    window.updateConsoleLog('Configuration exported successfully.');
}

/**
 * Handles the selected file for importing configuration.
 * @param {Event} event The change event from the file input.
 */
function handleImportConfig(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    if (file.type !== 'application/json') {
        window.updateConsoleLog('[ERROR] Invalid file type. Please select a JSON file.');
        alert('Invalid file type. Please select a JSON file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedConfig = JSON.parse(e.target.result);
            window.updateConsoleLog('Attempting to import configuration...');
            await applyImportedConfig(importedConfig);
            window.updateConsoleLog('Configuration imported successfully. Please refresh or check asset states.');
            alert('Configuration imported. Visual changes may require reloading or re-applying operations.');
        } catch (error) {
            console.error('Error parsing or applying imported config:', error);
            window.updateConsoleLog(`[ERROR] Failed to import config: ${error.message}`);
            alert(`Error importing configuration: ${error.message}`);
        }
    };
    reader.readAsText(file);
}

/**
 * Applies the imported configuration to the allAssets array.
 * @param {Array} importedConfig The parsed configuration array.
 */
async function applyImportedConfig(importedConfig) {
    if (typeof allAssets === 'undefined' || !Array.isArray(allAssets)) {
        console.error('allAssets array is not available or not an array.');
        window.updateConsoleLog('[ERROR] Cannot apply config: Asset data not available.');
        return;
    }

    const updates = [];

    for (const configItem of importedConfig) {
        const targetAsset = allAssets.find(asset => asset.id === configItem.id || asset.filename === configItem.filename);

        if (targetAsset) {
            if (configItem.modifiedState) {
                if (configItem.modifiedState.saturation !== undefined) {
                    targetAsset.modifiedSaturation = configItem.modifiedState.saturation;
                    targetAsset.isModified = true;
                    // Re-apply saturation if image blob is already loaded
                    if (targetAsset.imageBlob) {
                         // This is a simplified re-application.
                         // In a real scenario, you'd re-draw the original image onto a temp canvas
                         // and then apply saturation, similar to asset-editor-modal.js
                         // For now, we just mark it as modified and update visual state.
                    }
                    updates.push(`Applied saturation ${targetAsset.modifiedSaturation} to ${targetAsset.filename}`);
                }

                if (configItem.modifiedState.newTexture) {
                    // For new textures, we'll mark them as new and store the creation details.
                    // The actual texture creation (canvas drawing) would typically happen
                    // when the asset is 'loaded' or 'rendered' based on its 'isNew' status.
                    targetAsset.newImageDetails = configItem.modifiedState.newTexture;
                    targetAsset.isNew = true;
                    targetAsset.isModified = false; // A new texture is not a modification of an existing one in this context
                    // We don't create the blob here, as it might be heavy. Let the rendering logic handle it.
                    updates.push(`Marked ${targetAsset.filename} as new texture (W:${targetAsset.newImageDetails.width}, H:${targetAsset.newImageDetails.height}, C:${targetAsset.newImageDetails.color})`);
                }
            }
            // Update the card's visual state to reflect changes (e.g., 'modified' badge)
            if (typeof window.updateCardVisualState === 'function') {
                window.updateCardVisualState(targetAsset);
            }
        } else {
            updates.push(`[WARN] Asset not found for config: ${configItem.filename}`);
        }
    }
    window.updateConsoleLog('Config application summary:');
    updates.forEach(msg => window.updateConsoleLog(`- ${msg}`));
}