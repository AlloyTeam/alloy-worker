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
        type Weblog = any;
        type Monitor = string;
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

type Transfer = {
    /**
     * 转换为 transfer 传输的属性列表
     */
    transferProps?: string[];
};
