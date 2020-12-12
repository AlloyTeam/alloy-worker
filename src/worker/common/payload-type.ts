declare namespace WorkerPayload {
    namespace Image {
        type Threshold = {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            threshold?: number;
        } & Transfer;

        type BaseBlur = {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            radius: number;
        } & Transfer;
    }

    namespace WorkerReport {
        type CaptureWorkerException = {
            message: string;
            stack: string;
        };
        type Monitor = string;
        type Raven = any;
        type Weblog = any;
    }

    namespace WorkerAbilityTest {
        type CommunicationTest = number;
        type HeartBeatTest = number;
    }
}

declare namespace WorkerReponse {
    namespace Image {
        type Threshold = {
            data: Uint8ClampedArray;
        } & Transfer;

        type BaseBlur = {
            data: Uint8ClampedArray;
        } & Transfer;
    }

    namespace WorkerAbilityTest {
        type CommunicationTest = number;
        type HeartBeatTest = number;
    }

    namespace Cookie {
        type Cookie = string;
    }
}

/**
 * 支持 transfer 传输方式的类型声明
 * 通过 `&` 附加到 payload 类型后面
 */
interface Transfer {
    /**
     * 转换为 transfer 传输的属性列表
     */
    transferProps?: string[];
}
