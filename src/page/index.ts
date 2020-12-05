import createAlloyWorker from 'worker/index';

// 写入测试 cookie
document.cookie = 'xsrf=alloy,token=worker';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
    // isDebugMode: true,
});

// 挂载到全局环境, 用于调试
// @ts-ignore
window.alloyWorker = alloyWorker;

alloyWorker.workerAbilityTest.communicationTest().then((res) => console.log(`worker test result: ${res}`));

console.log('alloyWorker', alloyWorker);
