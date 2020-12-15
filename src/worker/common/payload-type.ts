/**
 * 跨线程通信各事务的发送数据类型声明
 */
export declare namespace WorkerPayload {
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

/**
 * 跨线程通信各事务的响应数据类型声明
 */
export declare namespace WorkerReponse {
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
export interface Transfer {
    /**
     * 转换为 transfer 传输的属性列表
     */
    transferProps?: string[];
}
