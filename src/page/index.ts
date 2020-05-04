import createAlloyWorker from '../worker/index';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});

// 挂载到全局环境, 用于调试
// @ts-ignore
window.alloyWorker = alloyWorker;

console.log('alloyWorker', alloyWorker);
