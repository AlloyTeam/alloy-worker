import createAlloyWorker from '../worker/index';

const Filters: {
    threshold: Function;
} = {
    threshold: () => {},
};
Filters.threshold = function (
    pixels: {
        data: number[];
    },
    threshold = 128
) {
    const d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const v = 0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
    }
    return pixels;
};

const image: HTMLImageElement = document.getElementById('original')! as HTMLImageElement;

function getImageData(image: HTMLImageElement) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0, image.width, image.height);
    const imageDataObj = tempCtx.getImageData(0, 0, image.width, image.height);
    return imageDataObj;
}

function thresholdImage(pixelData: ImageData) {
    const thresholdLevel = 100; // 0-255
    const tstart = new Date().getTime();

    const newImageDataObj = Filters.threshold(pixelData, thresholdLevel);
    const duration = new Date().getTime() - tstart;

    console.log('Filter image: %d msec', duration);
    return { newImageData: newImageDataObj, duration: duration };
}

function getImage() {
    console.log('Original Image: %s, %d x %d', image.src, image.width, image.height);

    // Extract data from the image object
    // imageDataObj: {data (Uint8ClampedArray), width, height}
    // const imageDataObj = Filters.getPixels(image);
    const imageDataObj = getImageData(image);

    console.log(
        "Pixels: type '%s', %d bytes, %d x %d, data: %s...",
        typeof imageDataObj.data,
        imageDataObj.data.length,
        imageDataObj.width,
        imageDataObj.height,
        imageDataObj.data.slice(0, 10).toString()
    );
}

function addEvent() {
    const addCanvas = document.getElementById('add-canvas');
    addCanvas?.addEventListener('click', () => {
        const imageDataObj = getImageData(image);
        const results = thresholdImage(imageDataObj);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.className = 'img-canvas';
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        // tempCtx.drawImage(image, 0, 0, image.width, image.height);
        tempCtx.putImageData(results.newImageData, 0, 0);
        document.getElementById('container')?.append(tempCanvas);
    });
}

if (image.complete) {
    getImage();
    addEvent();
} else {
    image.onload = function () {
        getImage();
        addEvent();
    };
}

const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});
