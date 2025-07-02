/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// export-options-popup.js

// DOM Elements (these are also referenced in asset-list-page.js, but
// we need local references here for direct manipulation of the popup)
let exportOptionsPopup;
let closeExportPopupButton;
// exportClientButton and exportBrowserButton are now handled by asset-list-page.js directly

document.addEventListener('DOMContentLoaded', () => {
    exportOptionsPopup = document.getElementById('export-options-popup');
    closeExportPopupButton = document.getElementById('close-export-popup');

    if (exportOptionsPopup && closeExportPopupButton) {
        // Event listeners for closing the popup
        closeExportPopupButton.addEventListener('click', hideExportOptionsPopup);
        // Close popup if clicked outside content
        exportOptionsPopup.addEventListener('click', (event) => {
            if (event.target === exportOptionsPopup) {
                hideExportOptionsPopup();
            }
        });

        // The click listeners for exportClientButton and exportBrowserButton
        // are now exclusively managed in asset-list-page.js, where they call
        // initiateZipDownload directly. This file no longer needs to manage them.

    } else {
        console.error('One or more export options popup elements not found in export-options-popup.js!');
        if (!exportOptionsPopup) console.error('export-options-popup not found!');
        if (!closeExportPopupButton) console.error('close-export-popup not found!');
    }
});

/**
 * Shows the export options popup.
 * This function is called from asset-list-page.js.
 */
function showExportOptionsPopup() {
    if (exportOptionsPopup) {
        exportOptionsPopup.classList.add('active');
    }
}

/**
 * Hides the export options popup.
 * This function is called from asset-list-page.js.
 */
function hideExportOptionsPopup() {
    if (exportOptionsPopup) {
        exportOptionsPopup.classList.remove('active');
    }
}

// Expose these functions globally so asset-list-page.js can call them
window.showExportOptionsPopup = showExportOptionsPopup;
window.hideExportOptionsPopup = hideExportOptionsPopup;


// REMOVED REDUNDANT LOADING/CONSOLE UTILITY FUNCTIONS:
// The following functions were previously defined here but are now
// properly defined and managed in asset-list-page.js.
// Keeping them here would lead to re-declarations and potential conflicts.

/*
if (typeof window.showLoadingOverlay === 'undefined') {
    window.showLoadingOverlay = (message) => {
        // ... (removed content)
    };
}

if (typeof window.updateLoadingProgress === 'undefined') {
    window.updateLoadingProgress = (processed, total, message) => {
        // ... (removed content)
    };
}

if (typeof window.updateConsoleLog === 'undefined') {
    window.updateConsoleLog = (message) => {
        // ... (removed content)
    };
}

if (typeof window.hideLoadingOverlayWithDelay === 'undefined') {
    window.hideLoadingOverlayWithDelay = (delay, finalMessage) => {
        // ... (removed content)
    };
}
*/

// REMOVED REDUNDANT handleExport FUNCTION:
// This function is no longer needed as initiateZipDownload is called directly
// from asset-list-page.js on button clicks.
/*
async function handleExport(exportType) {
    // ... (removed content)
}
*/