// image-converter.js
// This file contains a utility function for converting image blobs between different formats.

/**
 * Converts an image Blob from its current format to a target MIME type (e.g., 'image/png', 'image/jpeg').
 * This function utilizes a temporary canvas to perform the image rendering and then re-exporting
 * to the desired format.
 *
 * @param {Blob} imageBlob The source image Blob that needs to be converted.
 * @param {string} targetMimeType The desired output MIME type for the image (e.g., 'image/png', 'image/jpeg').
 * This must be a MIME type supported by `canvas.toBlob()`.
 * @returns {Promise<Blob|null>} A promise that resolves with the new Blob in the target format,
 * or `null` if the image fails to load or the conversion fails.
 */
window.convertImageBlob = async (imageBlob, targetMimeType) => {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            // Create a temporary canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match the image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);

            // Attempt to convert the canvas content to the target MIME type Blob
            // The quality argument (third parameter) is optional and typically applies to 'image/jpeg'.
            // For 'image/png', it's ignored or defaults to lossless.
            canvas.toBlob((blob) => {
                // Revoke the object URL created from the original blob to free up memory
                URL.revokeObjectURL(img.src);
                resolve(blob); // Resolve the promise with the new Blob
            }, targetMimeType);
        };

        img.onerror = (e) => {
            // Log an error if the image fails to load for conversion
            console.error('Error loading image for conversion:', e);
            // Revoke the object URL on error as well
            URL.revokeObjectURL(img.src);
            resolve(null); // Resolve with null to indicate failure
        };

        // Create an object URL from the input Blob and set it as the image source
        // This allows the Image object to load the image data.
        img.src = URL.createObjectURL(imageBlob);
    });
};
