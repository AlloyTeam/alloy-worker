import type { IMainThreadAction } from './index';
import BaseAction from '../common/base-action';
import { ImageActionType } from '../common/action-type';

/**
 *
 */
export default class Image extends BaseAction {
    protected threadAction: IMainThreadAction;

    /**
     * 主线程去调用 Worker 线程
     */
    public threshold(payload: WorkerPayload.Image.Threshold): Promise<WorkerReponse.Image.Threshold> {
        return this.controller.requestPromise(ImageActionType.Threshold, payload);
    }

    public baseBlur(payload: WorkerPayload.Image.BaseBlur): Promise<WorkerReponse.Image.BaseBlur> {
        return this.controller.requestPromise(ImageActionType.BaseBlur, payload);
    }

    protected addActionHandler(): void {}
}
