/* eslint-disable dot-notation */
import report from 'worker/external/report';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('report', () => {
    const realConsoleError = console.error;

    beforeEach(() => {
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = realConsoleError;
    });

    it('monitor', () => {
        report.monitor('1024');

        expect(console.error).toBeCalled();
    });

    it('raven', () => {
        report.raven(new Error('2014'));

        expect(console.error).toBeCalled();
    });

    it('weblog', () => {
        report.weblog({
            id: 1024
        });

        expect(console.error).toBeCalled();
    });
});

