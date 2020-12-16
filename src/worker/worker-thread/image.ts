import type { IWorkerThreadAction } from './index';
import BaseAction from '../common/base-action';
import { WorkerPayload, WorkerReponse } from '../common/payload-type';
import { ImageActionType } from '../common/action-type';
import { threshold, baseBlur } from '../../lib/image-filter';
import { isIE10 } from '../../lib/utils';

/**
 *
 */
export default class Image extends BaseAction {
    protected threadAction: IWorkerThreadAction;

    protected addActionHandler(): void {
        this.controller.addActionHandler(ImageActionType.Threshold, this.threshold.bind(this));
        this.controller.addActionHandler(ImageActionType.BaseBlur, this.baseBlur.bind(this));
    }

    /**
     * 响应主线程的处理器
     */
    private threshold(payload: WorkerPayload.Image.Threshold): WorkerReponse.Image.Threshold {
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

    private baseBlur(payload: WorkerPayload.Image.BaseBlur): WorkerReponse.Image.BaseBlur {
        const startTime = Date.now();

        const response = baseBlur({
            data: payload.data,
            width: payload.width,
            height: payload.height,
            radius: payload.radius,
        });

        console.log('worker run baseBlur time: ', Date.now() - startTime, 'ms');
        return {
            transferProps: isIE10 ? [] : ['data'],
            data: response.data as any,
        };
    }
}
