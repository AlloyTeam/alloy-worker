import BaseAction from '../common/base-action';
import { ImageActionType } from '../common/action-type';
import Controller from './controller';
import { threshold } from '../../lib/image-filter';

/**
 *
 */
export default class Image extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler(): void {
        this.controller.addActionHandler(ImageActionType.Threshold, this.__MainCallWorker__.bind(this));
    }

    /**
     * 响应主线程的处理器
     */
    __MainCallWorker__(payload: WorkerPayload.Image.Threshold): WorkerReponse.Image.Threshold {
        const response = threshold(payload);
        return response;
    }
}
