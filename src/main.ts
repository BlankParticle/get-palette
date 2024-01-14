import { getPixelsFromURL } from "./get-pixels";
import quantize, { type RgbTuple } from "./quantize";

function createPixelArray(pixels: Uint8Array, pixelCount: number, quality: number) {
	const pixelArray: RgbTuple[] = [];
	for (let i = 0; i < pixelCount; i = i + quality) {
		const offset = i * 4;
		const r = pixels[offset + 0];
		const g = pixels[offset + 1];
		const b = pixels[offset + 2];
		const a = pixels[offset + 3];

		if (typeof a === "undefined" || a >= 125) {
			if (!(r > 250 && g > 250 && b > 250)) {
				pixelArray.push([r, g, b]);
			}
		}
	}
	return pixelArray;
}

/**
 * Get Color Palette for any image with its url
 *
 * @param url URL for a remote Image, Only PNG/JPG for now
 * @param colorCount Number of Colors to generate, Default is 10
 * @param quality Image Sampling Quality, Default is 10
 * @returns Array with 3 values as `[r,g,b]`
 */
export const getPalette = async (url: string | URL, colorCount = 10, quality = 10) => {
	const imgData = await getPixelsFromURL(url);
	const pixelCount = imgData.shape[0] * imgData.shape[1];
	const pixelArray = createPixelArray(imgData.data, pixelCount, quality);
	return quantize(pixelArray, colorCount).palette();
};

/**
 * Get Dominant Color in any image with its url
 *
 * @param url URL for a remote Image, Only PNG/JPG for now
 * @param quality Image Sampling Quality, Default is 10
 * @returns Array with 3 values as `[r,g,b]`
 */
export const getColor = async (url: string | URL, quality = 10) =>
	(await getPalette(url, 5, quality))[0];
