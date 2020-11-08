import MainThreadWorker from '../worker/main-thread';
import createAlloyWorker from '../worker/index';
import { threshold, baseBlur } from '../lib/image-filter';
import { isIE10, isIE11 } from '../lib/utils';

// https://stackoverflow.com/questions/22062313/imagedata-set-in-internetexplorer
// imgData.data.set polyfill for IE10
if (isIE10) {
    // @ts-ignore
    if (window.CanvasPixelArray) {
        // @ts-ignore
        // eslint-disable-next-line no-undef
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
if (image.complete) {
    getImage();
    initWorker();
    addEvent();
} else {
    image.onload = function () {
        getImage();
        initWorker();
        addEvent();
    };
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

    document.getElementById('range-info')!.innerText = `${image.width}`;
}

let alloyWorker: MainThreadWorker;
function initWorker() {
    alloyWorker = createAlloyWorker({
        workerName: 'alloyWorker',
    });
}

function addEvent() {
    image.addEventListener('click', () => {
        if (document.getElementById('original-info')!.innerText.length) {
            document.getElementById('original-info')!.innerHTML = '';
        } else {
            document.getElementById('original-info')!.innerHTML += '**************';
        }
    });

    const startImageProcess = document.getElementById('start-image-process');
    startImageProcess?.addEventListener('click', () => {
        document.getElementById('container')!.innerHTML = '';
        document.getElementById('operation-info')!.innerHTML = '';

        // 2 次 requestAnimationFrame 确保上面的 DOM 修改可以渲染
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const isMainThreadSetTimeout: boolean = (document.getElementById('use-settimeout') as HTMLInputElement)
                    .checked;
                const isUseWorker: boolean = (document.getElementById('use-worker') as HTMLInputElement).checked;
                const isUseMultiWorker: boolean = (document.getElementById('use-multi-worker') as HTMLInputElement).checked;

                const startTime = Date.now();
                const taskPromiseArray = [2, 5, 10, 15, 20, 25].map((redius) => {
                    return new Promise((resolve) => {
                        if (isUseWorker) {
                            addCanvasElement(redius, true).then(resolve);
                            return;
                        } else if (isUseMultiWorker) {
                            addCanvasElement(redius, true, true).then(resolve);
                            return;
                        } else if (isMainThreadSetTimeout) {
                            setTimeout(() => {
                                addCanvasElement(redius, false).then(resolve);
                            }, 0);
                            return;
                        }
                        addCanvasElement(redius, false).then(resolve);
                    });
                });

                Promise.all(taskPromiseArray).then(() => {
                    const processTime = Date.now() - startTime;
                    console.log('Time', processTime);
                    document.getElementById('operation-info')!.innerHTML = `${processTime} ms`;
                });
            });
        });
    });

    const rangeInput = document.getElementById('range-input');
    let imageWidthValue = Number(image.style.width);
    console.log(rangeInput);
    rangeInput?.addEventListener('mousemove', (event) => {
        const newValue = Number((event.target as HTMLInputElement).value);

        // @ts-ignore
        if (imageWidthValue !== newValue) {
            imageWidthValue = newValue;
            image.style.width = `${imageWidthValue}px`;
            image.style.height = `${imageWidthValue}px`;
            document.getElementById('range-info')!.innerText = `${image.width}`;
        }
    });

    let rotateZDeg = 180;
    const anmimotionImage = document.getElementById('animotion-image');
    setInterval(() => {
        rotateZDeg = (rotateZDeg + 6) % 360;
        anmimotionImage!.style.transform = `rotateZ(${rotateZDeg}deg)`;
    }, 20);
}

async function addCanvasElement(processRangeValue: number, isUseWorker: boolean, isUseMultiWorker: boolean = false) {
    const startTime = Date.now();
    const imageDataObj = getImageData(image);

    const startTimeForThreshold = Date.now();
    const newImageData = await processImage(imageDataObj, processRangeValue, isUseWorker, isUseMultiWorker);

    const startTimeForDrawImage = Date.now();
    drawImageToCanvas(newImageData);

    console.log('====');
    console.log('GetImageData time: %d ms', startTimeForThreshold - startTime);
    console.log('Threshold time: %d ms', startTimeForDrawImage - startTimeForThreshold);
    console.log('DrawImage time: %d ms', Date.now() - startTimeForDrawImage);
    console.log('AddCanvas time: %d ms', Date.now() - startTime);
}

let imageHiddenCanvas: HTMLCanvasElement;
function getImageData(image: HTMLImageElement) {
    if (!imageHiddenCanvas) {
        imageHiddenCanvas = document.createElement('canvas');
    }
    const tempCtx = imageHiddenCanvas.getContext('2d')!;
    imageHiddenCanvas.width = image.width;
    imageHiddenCanvas.height = image.height;
    tempCtx.drawImage(image, 0, 0, image.width, image.height);

    const imageDataObj = tempCtx.getImageData(0, 0, image.width, image.height);
    return imageDataObj;
}

async function processImage(pixelData: ImageData, processRangeValue: number, isUseWorker: boolean, isUseMultiWorker: boolean = false) {
    let newImageData: {
        data: Uint8ClampedArray;
    };

    if (isUseWorker) {
        const oldAlloyWorker = alloyWorker;
        if (isUseMultiWorker) {
            // 新建一条线程备用
            initWorker();
        }

        newImageData = await alloyWorker.image.baseBlur({
            transferProps: isIE10 ? [] : ['data'],
            data: pixelData.data,
            width: pixelData.width,
            height: pixelData.height,
            radius: processRangeValue,
        });

        if (isUseMultiWorker) {
            oldAlloyWorker.terminate();
        }

        // newImageData = await alloyWorker.image.threshold({
        //     transferProps: isIE10 ? [] : ['data'],
        //     data: pixelData.data,
        //     threshold: processRangeValue * 10 % 256,
        // });
    } else {
        newImageData = baseBlur({
            data: pixelData.data,
            width: pixelData.width,
            height: pixelData.height,
            radius: processRangeValue,
        });

        // newImageData = threshold({
        //     data: pixelData.data,
        //     threshold: processRangeValue * 10 % 256,
        // });
    }

    return newImageData;
}

function drawImageToCanvas({ data }: { data: Uint8ClampedArray }) {
    // let imageCanvas : HTMLCanvasElement = document.getElementsByClassName('img-canvas')[0] as any;
    // if (!imageCanvas) {
    const imageCanvas = document.createElement('canvas');
    imageCanvas.className = 'img-canvas';
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;
    // }
    const tempCtx = imageCanvas.getContext('2d')!;

    if (isIE10 || isIE11) {
        // IE10, IE11 不支持 new ImageData()
        const newImageData = tempCtx.createImageData(image.width, image.height);
        newImageData.data.set(data);
        tempCtx.putImageData(newImageData, 0, 0);
    } else {
        const newImageData = new ImageData(data, image.width, image.height);
        tempCtx.putImageData(newImageData, 0, 0);
    }

    document.getElementById('container')?.appendChild(imageCanvas);
}
