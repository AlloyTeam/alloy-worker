import createAlloyWorker from '../worker/index';

// console.log('test', __WORKER__);

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});

console.log('alloyWorker', alloyWorker);
