import BaseAction from '../common/base-action';
import { ImageActionType } from '../common/action-type';
import Controller from './controller';
import { threshold } from '../../lib/image-filter';
import { isIE10 } from '../../lib/utils';

/**
 *
 */
export default class Image extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler(): void {
        this.controller.addActionHandler(ImageActionType.Threshold, this.Threshold.bind(this));
    }

    /**
     * 响应主线程的处理器
     */
    Threshold(payload: WorkerPayload.Image.Threshold): WorkerReponse.Image.Threshold {
        const startTime = Date.now();

        const response = threshold({
            data: payload.data,
            threshold: payload.threshold,
        });

        console.log('worker run threshold time: ', Date.now() - startTime, 'ms');
        return {
            transferProps: isIE10 ? [] : ['data'],
            data: response.data as any,
        };
    }
}
