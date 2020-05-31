import BaseAction from '../common/base-action';
import { ImageActionType } from '../common/action-type';
import Controller from './controller';

/**
 *
 */
export default class Image extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler(): void {}

    /**
     * 主线程去调用 Worker 线程
     */
    threshold(payload: WorkerPayload.Image.Threshold): Promise<WorkerReponse.Image.Threshold> {
        return this.controller.requestPromise(ImageActionType.Threshold, payload);
    }

    baseBlur(payload: WorkerPayload.Image.BaseBlur): Promise<WorkerReponse.Image.BaseBlur> {
        return this.controller.requestPromise(ImageActionType.BaseBlur, payload);
    }
}
