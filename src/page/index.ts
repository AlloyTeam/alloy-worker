import createAlloyWorker from '../worker/index';

// console.log('test', __WORKER__);

// 写入2个测试 cookie
document.cookie = 'xsrf=alloy,token=worker';

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
