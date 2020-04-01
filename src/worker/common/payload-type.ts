declare namespace WorkerPayload {
    namespace WorkerReport {
        type CaptureWorkerException = {
            message: string;
            stack: string;
        };
        type Weblog = any;
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
}
