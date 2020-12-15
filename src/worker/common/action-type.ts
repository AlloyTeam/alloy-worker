/*
 * Worker 事务标识
 * 每类事务有命名空间, 包含多个具体事务
 */

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
