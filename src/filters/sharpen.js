import { applyConvolution } from './convolution.js';

/**
 * @param {ImageData} imageData 
 */
export const sharpen = (imageData) => {
    const kernel = [
        0, -1,  0,
       -1,  5, -1,
        0, -1,  0
    ];
    applyConvolution(imageData.data, imageData.width, imageData.height, kernel);
    return imageData;
};
