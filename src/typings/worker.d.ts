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
