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
