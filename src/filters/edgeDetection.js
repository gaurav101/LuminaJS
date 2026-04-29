import { applyConvolution } from './convolution.js';

/**
 * @param {ImageData} imageData 
 */
export const edgeDetection = (imageData) => {
    const kernel = [
       -1, -1, -1,
       -1,  8, -1,
       -1, -1, -1
    ];
    applyConvolution(imageData.data, imageData.width, imageData.height, kernel);
    return imageData;
};
