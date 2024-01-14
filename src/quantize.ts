export type RgbTuple = [number, number, number];

const sigBits = 5;
const rightShift = 8 - sigBits;
const maxIterations = 1000;
const fractionByPopulations = 0.75;

class PriorityQueue<T> extends Array<T> {
	private sorted = false;
	constructor(private compareFn: (a: T, b: T) => number) {
		super();
	}

	public sort(compareFn?: (a: T, b: T) => number) {
		super.sort(compareFn || this.compareFn);
		this.sorted = true;
		return this;
	}

	public push(...items: T[]) {
		super.push(...items);
		this.sorted = false;
		return this.length;
	}

	public find(predicate: (value: T, index: number, obj: T[]) => boolean) {
		if (!this.sorted) this.sort();
		return super.find(predicate);
	}

	public pop() {
		if (!this.sorted) this.sort();
		return super.pop();
	}

	public forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: unknown) {
		if (!this.sorted) this.sort();
		super.forEach(callbackfn, thisArg);
	}
}

const getColorIndex = (r: number, g: number, b: number) =>
	(r << (2 * sigBits)) + (g << sigBits) + b;

class VBox {
	private cachedVolume: number | null = null;
	private cachedCount: number | null = null;
	private cachedAverageColor: RgbTuple | null = null;

	constructor(
		public r: [number, number],
		public g: [number, number],
		public b: [number, number],
		public histogram: number[],
	) {}

	public volume(force?: boolean) {
		if (!this.cachedVolume || force) {
			this.cachedVolume =
				(this.r[1] - this.r[0] + 1) * (this.g[1] - this.g[0] + 1) * (this.b[1] - this.b[0] + 1);
		}
		return this.cachedVolume;
	}

	public count(force?: boolean) {
		if (!this.cachedCount || force) {
			this.cachedCount = 0;
			for (let i = this.r[0]; i <= this.r[1]; i++) {
				for (let j = this.g[0]; j <= this.g[1]; j++) {
					for (let k = this.b[0]; k <= this.b[1]; k++) {
						const index = getColorIndex(i, j, k);
						this.cachedCount += this.histogram[index] || 0;
					}
				}
			}
		}
		return this.cachedCount;
	}

	public copy() {
		return new VBox(
			[this.r[0], this.r[1]],
			[this.g[0], this.g[1]],
			[this.b[0], this.b[1]],
			this.histogram.slice(),
		);
	}

	public average(force?: boolean) {
		if (!this.cachedAverageColor || force) {
			let totalHistogramValue = 0;
			const multiplicate = 1 << (8 - sigBits);
			let rSum = 0;
			let gSum = 0;
			let bSum = 0;

			for (let i = this.r[0]; i <= this.r[1]; i++) {
				for (let j = this.g[0]; j <= this.g[1]; j++) {
					for (let k = this.b[0]; k <= this.b[1]; k++) {
						const index = getColorIndex(i, j, k);
						const histogramValue = this.histogram[index] || 0;
						totalHistogramValue += histogramValue;
						rSum += histogramValue * (i + 0.5) * multiplicate;
						gSum += histogramValue * (j + 0.5) * multiplicate;
						bSum += histogramValue * (k + 0.5) * multiplicate;
					}
				}
			}
			if (totalHistogramValue) {
				this.cachedAverageColor = [
					Math.trunc(rSum / totalHistogramValue),
					Math.trunc(gSum / totalHistogramValue),
					Math.trunc(bSum / totalHistogramValue),
				];
			} else {
				// Empty box, return the center.
				this.cachedAverageColor = [
					Math.trunc((multiplicate * (this.r[0] + this.r[1] + 1)) / 2),
					Math.trunc((multiplicate * (this.g[0] + this.g[1] + 1)) / 2),
					Math.trunc((multiplicate * (this.b[0] + this.b[1] + 1)) / 2),
				];
			}
		}
		return this.cachedAverageColor;
	}

	public contains(pixel: RgbTuple) {
		const [r, g, b] = pixel.map((val) => val >> rightShift) as RgbTuple;
		return (
			r >= this.r[0] &&
			r <= this.r[1] &&
			g >= this.g[0] &&
			g <= this.g[1] &&
			b >= this.b[0] &&
			b <= this.b[1]
		);
	}
}

class CMap {
	private vBoxes: PriorityQueue<{
		color: RgbTuple;
		vbox: VBox;
	}>;

	constructor() {
		this.vBoxes = new PriorityQueue(
			(a, b) => a.vbox.count() * a.vbox.volume() - b.vbox.count() * b.vbox.volume(),
		);
	}

	public push(vbox: VBox) {
		this.vBoxes.push({
			vbox,
			color: vbox.average(),
		});
	}

	public palette() {
		return this.vBoxes.map(({ color }) => color);
	}

	public get size() {
		return this.vBoxes.length;
	}

	public map(color: RgbTuple) {
		return this.vBoxes.find(({ vbox }) => vbox.contains(color))?.color || this.nearest(color);
	}

	public nearest(color: RgbTuple) {
		let d1: number = Number.MAX_SAFE_INTEGER;
		let d2: number;
		let pColor: RgbTuple = [0, 0, 0];

		for (const { color: vColor } of this.vBoxes) {
			d2 = Math.sqrt(
				(color[0] - vColor[0]) ** 2 + (color[1] - vColor[1]) ** 2 + (color[2] - vColor[2]) ** 2,
			);
			if (d2 < d1) {
				d1 = d2;
				pColor = vColor;
			}
		}

		return pColor;
	}

	public forceBW() {
		this.vBoxes.sort(
			(a, b) => a.color.reduce((x, y) => x + y, 0) - b.color.reduce((x, y) => x + y, 0),
		);

		const lowest = this.vBoxes[0].color;
		if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5) this.vBoxes[0].color = [0, 0, 0];

		const idx = this.vBoxes.length - 1;
		const highest = this.vBoxes[idx].color;
		if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251) {
			this.vBoxes[idx].color = [255, 255, 255];
		}
	}
}

const getHistogram = (pixels: RgbTuple[]) => {
	const histogramSize = 1 << (3 * sigBits);
	const histogram = new Array<number>(histogramSize);
	for (const pixel of pixels) {
		const index = getColorIndex(...(pixel.map((val) => val >> rightShift) as RgbTuple));
		histogram[index] = (histogram[index] || 0) + 1;
	}

	return histogram;
};

const vBoxFromPixels = (pixels: RgbTuple[], histogram: number[]) => {
	const rRange = [Number.MAX_SAFE_INTEGER, 0] as [number, number];
	const gRange = [Number.MAX_SAFE_INTEGER, 0] as [number, number];
	const bRange = [Number.MAX_SAFE_INTEGER, 0] as [number, number];

	// find min/max
	for (const pixel of pixels) {
		const [r, g, b] = pixel.map((val) => val >> rightShift) as RgbTuple;
		if (r < rRange[0]) {
			rRange[0] = r;
		} else if (r > rRange[1]) {
			rRange[1] = r;
		}
		if (g < gRange[0]) {
			gRange[0] = g;
		} else if (g > gRange[1]) {
			gRange[1] = g;
		}
		if (b < bRange[0]) {
			bRange[0] = b;
		} else if (b > bRange[1]) {
			bRange[1] = b;
		}
	}

	return new VBox(rRange, gRange, bRange, histogram);
};

const medianCutApply = (histogram: number[], vbox: VBox) => {
	if (vbox.count() === 0) {
		throw new Error("vbox should have pixels");
	}

	if (vbox.count() === 1) {
		return [vbox.copy(), null] as const;
	}

	const rWidth = vbox.r[1] - vbox.r[0] + 1;
	const gWidth = vbox.g[1] - vbox.g[0] + 1;
	const bWidth = vbox.b[1] - vbox.b[0] + 1;
	const maxWidth = Math.max(rWidth, gWidth, bWidth);

	let total = 0;
	const partialSum: number[] = [];

	switch (maxWidth) {
		case rWidth: {
			for (let i = vbox.r[0]; i <= vbox.r[1]; i++) {
				let sum = 0;
				for (let j = vbox.g[0]; j <= vbox.g[1]; j++) {
					for (let k = vbox.b[0]; k <= vbox.b[1]; k++) {
						const index = getColorIndex(i, j, k);
						sum += histogram[index] || 0;
					}
				}
				total += sum;
				partialSum[i] = total;
			}
			break;
		}
		case gWidth: {
			for (let i = vbox.g[0]; i <= vbox.g[1]; i++) {
				let sum = 0;
				for (let j = vbox.r[0]; j <= vbox.r[1]; j++) {
					for (let k = vbox.b[0]; k <= vbox.b[1]; k++) {
						const index = getColorIndex(j, i, k);
						sum += histogram[index] || 0;
					}
				}
				total += sum;
				partialSum[i] = total;
			}
			break;
		}
		case bWidth: {
			for (let i = vbox.b[0]; i <= vbox.b[1]; i++) {
				let sum = 0;
				for (let j = vbox.r[0]; j <= vbox.r[1]; j++) {
					for (let k = vbox.g[0]; k <= vbox.g[1]; k++) {
						const index = getColorIndex(j, k, i);
						sum += histogram[index] || 0;
					}
				}
				total += sum;
				partialSum[i] = total;
			}
			break;
		}
	}

	const lookAheadSum = partialSum.map((d) => total - d);

	const cut = (color: "r" | "g" | "b") => {
		for (let i = vbox[color][0]; i <= vbox[color][1]; i++) {
			if (partialSum[i] > total / 2) {
				const vbox1 = vbox.copy();
				const vbox2 = vbox.copy();
				const left = i - vbox[color][0];
				const right = vbox[color][1] - i;
				let d =
					left <= right
						? Math.min(vbox[color][1] - 1, Math.trunc(i + right / 2))
						: Math.max(vbox[color][0], Math.trunc(i - 1 - left / 2));

				// avoid 0-count boxes
				while (!partialSum[d]) {
					d++;
				}
				let count = lookAheadSum[d];
				while (!count && partialSum[d - 1]) {
					count = lookAheadSum[--d];
				}

				vbox1[color][1] = d;
				vbox2[color][0] = vbox1[color][1] + 1;

				return [vbox1, vbox2] as const;
			}
		}
		throw new Error("VBox can't be cut");
	};

	switch (maxWidth) {
		case rWidth:
			return cut("r");
		case gWidth:
			return cut("g");
		case bWidth:
			return cut("b");
		default:
			throw new Error("Case Not Possible");
	}
};

const quantize = (pixels: RgbTuple[], maxColors: number) => {
	if (pixels.length === 0 || maxColors < 2 || maxColors > 256) {
		throw new Error("Either no pixels provided or maxColors is not in range 2 -> 256");
	}

	const histogram = getHistogram(pixels);
	const vbox = vBoxFromPixels(pixels, histogram);
	const pq = new PriorityQueue<VBox>((a, b) => a.count() - b.count());
	pq.push(vbox);

	const iter = (pq: PriorityQueue<VBox>, target: number) => {
		let nColors = pq.length;
		let nIters = 0;

		while (nIters < maxIterations) {
			if (nColors >= target) return;
			if (nIters++ > maxIterations) return;

			const vbox = pq.pop() as VBox;
			if (!vbox.count()) {
				pq.push(vbox);
				nIters++;
				continue;
			}

			// do the cut
			const vbox2 = medianCutApply(histogram, vbox)[1];
			pq.push(vbox);
			if (vbox2) {
				pq.push(vbox);
				nColors++;
			}
		}
	};

	iter(pq, fractionByPopulations * maxColors);

	// Re-sort by the product of pixel occupancy times the size in color space.
	const pq2 = new PriorityQueue<VBox>((a, b) => a.count() * a.volume() - b.count() * b.volume());

	while (pq.length) {
		pq2.push(pq.pop() as VBox);
	}

	iter(pq2, maxColors);
	const cMap = new CMap();

	while (pq2.length) {
		cMap.push(pq2.pop() as VBox);
	}

	return cMap;
};

export default quantize;
