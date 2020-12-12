export const enum WorkerAbilityTestActionType {
    CommunicationTest = 'CommunicationTest',
    HeartBeatTest = 'HeartBeatTest',
}

export const enum WorkerReportActionType {
    CaptureWorkerException = 'CaptureWorkerException',
    Monitor = 'Monitor',
    Raven = 'Raven',
    Weblog = 'Weblog',
}

export const enum CookieActionType {
    Cookie = 'Cookie',
}

export const enum ImageActionType {
    Threshold = 'Threshold',
    BaseBlur = 'BaseBlur',
}
