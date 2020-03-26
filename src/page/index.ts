import createAlloyWorker from '../worker/index';

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

console.log('alloyWorker', alloyWorker);

setTimeout(() => {
    const workerStatus = alloyWorker.workerStatus;

    const workerStatusHtml = `
        <ul>
            <li><h4>Has Worker Class:</h4> ${workerStatus.hasWorkerClass}</li>
            <li><h4>Can New Worker:</h4> ${workerStatus.canNewWorker}</li>
            <li><h4>Can Post Message:</h4> ${workerStatus.canPostMessage}</li>
            <li><h4>Worker Ready Duration:</h4> ${workerStatus.workerReadyDuration}ms</li>
            <li><h4>New Worker Duration:</h4> ${workerStatus.newWorkerDuration}ms</li>
        <ul>
        `;

    document.getElementById('test-result').innerHTML = workerStatusHtml; 
}, 1000);
