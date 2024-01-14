import { decode } from "jpeg-js";
import ndarray from "ndarray";
import { PNG } from "pngjs";

export const parseImageBuffer = (image: {
	buffer: ArrayBuffer;
	fileType: string;
}) => {
	switch (image.fileType) {
		case "image/png": {
			const png = PNG.sync.read(Buffer.from(image.buffer));
			return ndarray(
				new Uint8Array(png.data),
				[png.width | 0, png.height | 0, 4],
				[4, (4 * png.width) | 0, 1],
				0,
			);
		}

		case "image/jpg":
		case "image/jpeg": {
			const jpeg = decode(image.buffer);
			return ndarray(new Uint8Array(jpeg.data), [jpeg.height, jpeg.width, 4]).transpose(1, 0);
		}

		default:
			throw new Error(
				`Unsupported mime-type ${image.fileType}, Only PNG and JPG are currently supported`,
			);
	}
};

export const getPixelsFromURL = async (src: string | URL) => {
	const image = await fetch(src).then(async (resp) => ({
		buffer: await resp.arrayBuffer(),
		fileType: resp.headers.get("content-type") || "",
	}));
	return parseImageBuffer(image);
};
