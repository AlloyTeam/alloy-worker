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
