/* eslint-disable dot-notation */
import { ReportProxy } from 'worker/external/report-proxy';

/**
 * @author cntchen
 * @priority P0
 * @casetype unit
 */
describe('report proxy', () => {
    it('new', () => {
        const proxy = new ReportProxy('test');

        expect(proxy).toBeInstanceOf(ReportProxy);
    });

    it('new -- push to stack', () => {
        const proxy = new ReportProxy('testPushToStack');

        // 上报代理 push 到 stack 空间
        expect(ReportProxy['stack'].slice(-1)[0]).toEqual(proxy);
    });

    it('static eachLoad', () => {
        const proxy = new ReportProxy('test');
        const proxy1 = new ReportProxy('test1');

        proxy['initLoad'] = jest.fn();
        proxy1['initLoad'] = jest.fn();

        // 加载真正的上报模块
        ReportProxy.eachLoad({});

        // 调用各上报代理的加载模块函数
        expect(proxy['initLoad']).toBeCalled();
        expect(proxy1['initLoad']).toBeCalled();
    });

    it('getProxyFunction -- module 已加载', () => {
        const proxy = new ReportProxy('test');

        proxy['execute'] = jest.fn();
        // 假装初始化加载模块
        proxy['initLoad']({});

        const proxyFunction = proxy.getProxyFunction();
        // 上报
        proxyFunction();

        // 调用了真实上报函数
        expect(proxy['execute']).toBeCalled();
    });

    it('getProxyFunction -- module 未加载', () => {
        const proxy = new ReportProxy('test');

        const proxyFunction = proxy.getProxyFunction();
        proxyFunction();

        // 缓存了1个待执行的上报
        expect(proxy['cache'].length).toEqual(1);
    });

    it('getProxyFunction -- module 未加载, nocache', () => {
        const proxy = new ReportProxy('test');

        const proxyFunction = proxy.getProxyFunction(true);
        proxyFunction();

        // 缓存了1个待执行的上报
        expect(proxy['cache'].length).toEqual(0);
    });

    it('execute', () => {
        const proxy = new ReportProxy('test');

        const mockFunction = jest.fn();
        proxy['module'] = {
            test: mockFunction,
        };

        proxy['execute'](1024);

        expect(mockFunction).toBeCalled();
        expect(mockFunction).toBeCalledWith(1024);
    });

    it('getExecuteFunction -- 单层', () => {
        const proxy = new ReportProxy('a');

        const mockFunction = jest.fn();
        const executeFunction = proxy['getExecuteFunction']({
            a: mockFunction,
        }, ['a']);

        executeFunction.func();

        expect(mockFunction).toBeCalled();
    });

    it('getExecuteFunction -- 多层', () => {
        const proxy = new ReportProxy('a.b.c');

        const mockFunction = jest.fn();
        const executeFunction = proxy['getExecuteFunction']({
            a: {
                b: {
                    c: mockFunction,
                },
            },
        }, ['a', 'b', 'c']);

        executeFunction.func();

        expect(mockFunction).toBeCalled();
    });

    it('initLoad', () => {
        const proxy = new ReportProxy('test');

        // 没有缓存时执行, 覆盖一下逻辑
        proxy['initLoad']({});

        const testCacheFunction = jest.fn();
        proxy['cache'].push(testCacheFunction);

        proxy['initLoad']({});

        // 缓存的上报函数执行了
        expect(testCacheFunction).toBeCalled();
    });
});

