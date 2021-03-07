/* eslint-disable dot-notation */

import { MessageType } from 'worker/type';
import reportProxy from 'worker/external/report-proxy';
import ChannelReport from 'worker/common/channel-report';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('channel report', () => {
    const TestActionType = 'testActionType';
    const TestSessionId = 'testSessionId';

    const TestMessage = {
        messageType: MessageType.REQUEST,
        actionType: TestActionType,
        sessionId: TestSessionId,
        payload: '',
        time: 1024,
    };

    const realConsoleLog = console.log;

    beforeEach(() => {
        // @ts-ignore
        global.__WORKER__ = true;
    });

    afterEach(() => {
        // @ts-ignore
        global.__WORKER__ = false;
    });

    it('new -- debugMode', () => {
        const channelReport = new ChannelReport(true);

        expect(channelReport['isDebugMode']).toEqual(true);
    });

    it('timeoutReport', () => {
        const channelReport = new ChannelReport(true);

        reportProxy.weblog = jest.fn();

        channelReport.timeoutReport({
            actionType: TestMessage.actionType,
            isInWorker: true,
        });

        expect(reportProxy.weblog).toBeCalledTimes(1);
    });

    it('requestDurationReport', () => {
        const channelReport = new ChannelReport(true);

        reportProxy.weblog = jest.fn();

        // 请求未超时
        channelReport.requestDurationReport(100, 1000, TestMessage.actionType);

        expect(reportProxy.weblog).toBeCalledTimes(0);

        // 请求超时
        channelReport.requestDurationReport(2000, 1000, TestMessage.actionType);

        expect(reportProxy.weblog).toBeCalledTimes(1);
    });

    it('onmesssageDebugLog', () => {
        const channelReport = new ChannelReport(true);

        console.log = jest.fn();

        channelReport.onmesssageDebugLog(TestMessage);

        expect(console.log).toBeCalledTimes(1);

        console.log = realConsoleLog;
    });

    it('postMessageDebugLog', () => {
        const channelReport = new ChannelReport(true);

        console.log = jest.fn();

        channelReport.postMessageDebugLog(TestMessage);

        expect(console.log).toBeCalledTimes(1);

        console.log = realConsoleLog;
    });
});
