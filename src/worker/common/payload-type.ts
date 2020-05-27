declare namespace WorkerPayload {
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
    namespace WorkerAbilityTest {
        type CommunicationTest = number;
        type HeartBeatTest = number;
    }

    namespace Cookie {
        type Cookie = string;
    }
}

type Transfer = {
    transferProps?: string[];
};
