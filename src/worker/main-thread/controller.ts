import { IAlloyWorkerOptions } from '../type';
import BaseController from '../common/base-controller';
import Channel from '../common/channel';

/**
 * 主线程通信控制器
 *
 * @class Controller
 */
export default class Controller extends BaseController {
    constructor(options: IAlloyWorkerOptions) {
        super();

        // 主线程通过 new Worker() 获取 Worker 实例
        this.worker = new Worker(options.workerUrl, {
            name: options.workerName,
        });
        this.channel = new Channel(this.worker, this);
    }
}
