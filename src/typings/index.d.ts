/*
 * Worker 需要用到类型声明
 * @Author: CntChen
 * @Date: 2020-03-23
 */

/**
 * 给全局添加上 __WORKER__ 变量
 */
declare const __WORKER__: boolean;

interface Window {
    /**
     * worker 资源路径
     */
    __globalWorkerFilePath: string;
}

/**
 * jest 单元测试的全局变量声明
 */
declare namespace NodeJS {
    export interface Global {
        /**
         * 环境变量
         */
        __WORKER__: boolean;
        /**
         * AlloyWorker 挂载到全局
         */
        alloyWorker: any;
        /**
         * worker 线程名称
         */
        name: string;
    }
}

/**
 * alloy-worker! 表示构建为独立 worker js 资源, 并返回资源 url
 * 将加载的 worker 线程源码类型声明为 string, 避免 ts-check 报错
 * 比如:
 * import workerThread from 'alloy-worker!./worker-thread';
 */
declare module 'alloy-worker!*' {
    const type: string;
    export = type;
}
