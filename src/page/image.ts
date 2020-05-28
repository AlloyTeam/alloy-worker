import createAlloyWorker from '../worker/index';
import { threshold } from '../lib/image-filter';
import { isIE10, isIE11 } from '../lib/utils';

// https://stackoverflow.com/questions/22062313/imagedata-set-in-internetexplorer
// imgData.data.set polyfill for IE10
if (isIE10) {
    // @ts-ignore
    if (window.CanvasPixelArray) {
        // @ts-ignore
        CanvasPixelArray.prototype.set = function (arr) {
            const l = this.length;
            let i = 0;

            for (; i < l; i++) {
                this[i] = arr[i];
            }
        };
    }
}

const image: HTMLImageElement = document.getElementById('original')! as HTMLImageElement;
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});

let imageHiddenCanvas: HTMLCanvasElement;
function getImageData(image: HTMLImageElement) {
    if (!imageHiddenCanvas) {
        imageHiddenCanvas = document.createElement('canvas');
        const tempCtx = imageHiddenCanvas.getContext('2d')!;
        imageHiddenCanvas.width = image.width;
        imageHiddenCanvas.height = image.height;
        tempCtx.drawImage(image, 0, 0, image.width, image.height);
    }

    const tempCtx = imageHiddenCanvas.getContext('2d')!;
    const imageDataObj = tempCtx.getImageData(0, 0, image.width, image.height);
    return imageDataObj;
}

async function thresholdImage(pixelData: ImageData) {
    const thresholdLevel = Math.floor(Math.random() * 256); // 0-255

    // const newImageData = threshold({
    //      pixels: (pixelData as any),
    //      threshold: thresholdLevel,
    // });
    const newImageData = await alloyWorker.image.Threshold({
        transferProps: isIE10 ? [] : ['data'],
        data: pixelData.data as any,
        threshold: thresholdLevel,
    });

    return newImageData;
}

function drawImageToCanvas({ data }: { data: Uint8ClampedArray }) {
    const imageHiddenCanvas = document.createElement('canvas');
    imageHiddenCanvas.className = 'img-canvas';
    const tempCtx = imageHiddenCanvas.getContext('2d')!;
    imageHiddenCanvas.width = image.width;
    imageHiddenCanvas.height = image.height;

    if (isIE10 || isIE11) {
        // IE10, IE11 不支持 new ImageData()
        const newImageData = tempCtx.createImageData(image.width, image.height);
        newImageData.data.set(data);
        tempCtx.putImageData(newImageData, 0, 0);
    } else {
        const newImageData = new ImageData(data, image.width, image.height);
        tempCtx.putImageData(newImageData, 0, 0);
    }

    document.getElementById('container')?.appendChild(imageHiddenCanvas);
}

function getImage() {
    console.log('Original Image: %s, %d x %d', image.src, image.width, image.height);

    // Extract data from the image object
    const imageDataObj = getImageData(image);

    console.log(
        "Pixels: type '%s', %d bytes, %d x %d, data: %s...",
        typeof imageDataObj.data,
        imageDataObj.data.length,
        imageDataObj.width,
        imageDataObj.height,
        Array.prototype.slice.call(imageDataObj.data, 0, 10).toString()
    );
}

function addEvent() {
    const addCanvas = document.getElementById('add-canvas');
    addCanvas?.addEventListener('click', async () => {
        const startTime = Date.now();
        const imageDataObj = getImageData(image);

        const startTimeForThreshold = Date.now();
        const newImageData = await thresholdImage(imageDataObj);

        const startTimeForDrawImage = Date.now();
        drawImageToCanvas(newImageData);

        console.log('====');
        console.log('GetImageData time: %d ms', startTimeForThreshold - startTime);
        console.log('Threshold time: %d ms', startTimeForDrawImage - startTimeForThreshold);
        console.log('DrawImage time: %d ms', Date.now() - startTimeForDrawImage);
        console.log('AddCanvas time: %d ms', Date.now() - startTime);
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
