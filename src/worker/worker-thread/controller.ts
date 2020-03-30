import BaseController from '../common/base-controller';
import Channel from '../common/channel';

/**
 * Worker 线程通信控制器
 *
 * @class Controller
 */
export default class Controller extends BaseController {
    constructor() {
        super();

        // 从 Worker url 获取调试模式标志位
        if (location.href.indexOf('debugWorker=true') > 0) {
            this.isDebugMode = true;
        }

        // Worker 线程中的全局环境 self 就是 Worker 实例
        this.worker = self as any;
        this.channel = new Channel(this.worker, this);
    }
}
