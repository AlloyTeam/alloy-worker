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

        // Worker 线程中的全局环境 self 就是 Worker 实例
        this.worker = <any>self;
        this.channel = new Channel(this.worker, this);
    }
}
