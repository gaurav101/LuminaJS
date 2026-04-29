/**
 * Generic Convolution Engine
 * @param {Uint8ClampedArray} data - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number[]} kernel - A 3x3 matrix (array of 9 numbers)
 */
export const applyConvolution = (data, width, height, kernel) => {
    const buffer = new Uint8ClampedArray(data);

    // Iterate through every pixel except the 1-px border
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;

            // Apply the 3x3 kernel matrix
            for (let ky = 0; ky < 3; ky++) {
                for (let kx = 0; kx < 3; kx++) {
                    const nx = x + kx - 1;
                    const ny = y + ky - 1;
                    const offset = (ny * width + nx) * 4;
                    const weight = kernel[ky * 3 + kx];

                    r += buffer[offset] * weight;
                    g += buffer[offset + 1] * weight;
                    b += buffer[offset + 2] * weight;
                }
            }

            const i = (y * width + x) * 4;
            data[i] = Math.min(255, Math.max(0, r)); // Red
            data[i + 1] = Math.min(255, Math.max(0, g)); // Green
            data[i + 2] = Math.min(255, Math.max(0, b)); // Blue
        }
    }
    return data;
};
