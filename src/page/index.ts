import createAlloyWorker from 'worker/index';

// 写入测试 cookie
document.cookie = 'xsrf=alloy,token=worker';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
    isDebugMode: true,
});

// 挂载到全局环境, 用于调试
// @ts-ignore
window.alloyWorker = alloyWorker;

alloyWorker.workerAbilityTest.communicationTest().then((res) => console.log(`worker test result: ${res}`));

console.log('alloyWorker', alloyWorker);

// 轮循 alloyWorker 的状态, 并渲染到页面上
const testIntervalHandle = setInterval(() => {
    type TWorkerStatusKey = keyof typeof alloyWorker.workerStatus;

    const workerStatus: any = alloyWorker.workerStatus;

    if (!workerStatus) {
        return;
    }
    clearInterval(testIntervalHandle);

    const workerStatusTip: {
        [key in TWorkerStatusKey]: string;
    } = {
        hasWorkerClass: '是否实现了 HTML 规范的 Worker Class',
        canNewWorker: '能否创建 Worker 线程',
        canPostMessage: 'Worker 实例有无通讯能力(脚本加载失败认为无)',
        workerReadyDuration: '第一条信息从发出到收到的时间间隔',
        newWorkerDuration: '主线程创建 Worker 的同步耗时',
    };

    const workerStatusItems = Object.keys(workerStatus)
        .map((key) => {
            let status = workerStatus[key];
            if (typeof status === 'number') {
                status = status >= 0 ? `&nbsp;${status}ms` : status;
            } else {
                status = status ? '&nbsp;✔️' : '&nbsp;❌';
            }

            return `<li class="worker-status-item">
                <div class="worker-status-key">
                    ${key.slice(0, 1).toUpperCase() + key.slice(1)}
                </div>
                <div class="worker-status-value">
                    ${status}
                </div>
                <div class="worker-status-tip">
                    > ${workerStatusTip[key as TWorkerStatusKey]}
                <div>
            </li>`;
        })
        .join('\n');

    const workerStatusHtml = `
        <ul>
            ${workerStatusItems}
        </ul>
        `;

    document.getElementById('test-result')!.innerHTML = workerStatusHtml;
}, 500);
