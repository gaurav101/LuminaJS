import { applyConvolution } from './convolution.js';

/**
 * @param {ImageData} imageData 
 */
export const emboss = (imageData) => {
    const kernel = [
       -2, -1,  0,
       -1,  1,  1,
        0,  1,  2
    ];
    applyConvolution(imageData.data, imageData.width, imageData.height, kernel);
    return imageData;
};
