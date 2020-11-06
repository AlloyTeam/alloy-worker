/*
 * image filter
 * @Author: CntChen
 * @Date: 2020-05-24
 */

/**
 * to white-black
 * @param pixels
 * @param threshold 0-255
 */
export const threshold = ({ data, threshold = 128 }: { data: Uint8ClampedArray; threshold?: number }) => {
    const d = data;
    for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const v = 0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
    }
    return {
        data,
    };
};

/**
 * 模糊算法
 */
export const baseBlur = ({
    data,
    width,
    height,
    radius = 0,
}: {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    radius?: number;
}) => {
    function getColor(x: number, y: number) {
        let minX = x - radius;
        let maxX = x + radius;
        let minY = y - radius;
        let maxY = y + radius;
        if (minX < 0) {
            minX = 0;
        }
        if (maxX > width) {
            maxX = width;
        }
        if (minY < 0) {
            minY = 0;
        }
        if (maxY > height) {
            maxY = height;
        }

        let r = data[(width * x + y) * 4];
        let g = data[(width * x + y) * 4 + 1];
        let b = data[(width * x + y) * 4 + 2];
        let count = 1;

        for (let i = minX; i < maxX; i++) {
            for (let j = minY; j < maxY; j++) {
                if (i === x && j === y) {
                    continue;
                }

                r += data[(width * i + j) * 4];
                g += data[(width * i + j) * 4 + 1];
                b += data[(width * i + j) * 4 + 2];
                count += 1;
            }
        }

        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    }

    const newData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const colorArray = getColor(i, j);
            newData[(width * i + j) * 4] = colorArray[0];
            newData[(width * i + j) * 4 + 1] = colorArray[1];
            newData[(width * i + j) * 4 + 2] = colorArray[2];
            newData[(width * i + j) * 4 + 3] = data[(width * i + j) * 4 + 3];
        }
    }

    return {
        data: newData,
    };
};
