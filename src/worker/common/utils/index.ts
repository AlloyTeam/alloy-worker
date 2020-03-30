/**
 * 判断当前是否在 Worker 环境
 *
 * @returns {boolean}
 */
function checkIsInWorker(): boolean {
    // 判断条件为:
    // 1. 没有 Window 全局 Class
    // 2. 加载的资源是一个 js 文件
    return typeof Window !== 'function' && /\.js$/.test(location.pathname);
}

export const isInWorker = checkIsInWorker();

/**
 * 获取当前时刻, 范围为当前的分钟数, 精度到 ms
 *
 * @returns {string} 当前时刻
 */
export function getDebugTimeStamp(): string {
    const now = new Date();
    const minutes = `0${now.getMinutes()}`.slice(-2);
    const seconds = `0${now.getSeconds()}`.slice(-2);
    const milliseconds = `000${now.getMilliseconds()}`.slice(-3);

    return `${minutes}:${seconds}.${milliseconds}`;
}

/**
 * 判断是不是 promise
 * @param obj 要判断的对象
 * @returns {boolean} 判断结果
 */
export function isPromise(obj: any): obj is Promise<any> {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
