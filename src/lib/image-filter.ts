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
export const threshold = ({
    pixels,
    threshold = 128,
}: {
    pixels: {
        data: number[];
    };
    threshold?: number;
}) => {
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
