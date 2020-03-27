import createAlloyWorker from '../worker/index';
import MainThreadWorker from '../worker/main-thread/index';

// console.log('test', __WORKER__);

/** worker url 会在构建时替换到 html 中的全局变量
 * <script>window.__globalWorkerFilePath = 'WORKER_FILE_NAME_PLACEHOLDER'</script>
 * 'WORKER_FILE_NAME_PLACEHOLDER' -> 'alloy-worker-51497b48.js'
 */
const workerUrl: string = window.__globalWorkerFilePath;

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerUrl,
    workerName: 'alloyWorker--test',
});

// 暴露到全局环境
// @ts-ignore
window.alloyWorker = alloyWorker;

console.log('alloyWorker', alloyWorker);

// 轮循 alloyWorker 的状态, 并渲染到页面上
const testIntervalHandle = setInterval(() => {
    const workerStatus = alloyWorker.workerStatus;

    if (!workerStatus) {
        return;
    }
    clearInterval(testIntervalHandle);

    type TWorkerStatus = typeof alloyWorker.workerStatus;
    const workerStatusTip: {
        [key in keyof TWorkerStatus]: string;
    } = {
        hasWorkerClass: '是否实现了 HTML 规范的 Worker Class',
        canNewWorker: '是否支持 new Worker',
        canPostMessage: 'Worker 实例有无通讯能力(脚本加载失败认为无)',
        workerReadyDuration: '第一条信息从发出到收到的时间间隔',
        newWorkerDuration: '主线程创建 Worker 的同步耗时',
    };

    const workerStatusItems = Object.keys(workerStatus)
        .map((key) => {
            let status = workerStatus[key];
            if (typeof status === 'number') {
                status = status >= 0 ? `- ${status} ms` : status;
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
                    > ${workerStatusTip[key]}
                <div>
            </li>`;
        })
        .join('\n');

    const workerStatusHtml = `
        <ul>
            ${workerStatusItems}
        </ul>
        `;

    document.getElementById('test-result').innerHTML = workerStatusHtml;
}, 500);
