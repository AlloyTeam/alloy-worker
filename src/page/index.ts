import createAlloyWorker from '../worker/index';

// 写入2个测试 cookie
document.cookie = 'xsrf=alloy,token=worker';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});

// 挂载到全局环境, 用于调试
// @ts-ignore
window.alloyWorker = alloyWorker;

console.log('alloyWorker', alloyWorker);
