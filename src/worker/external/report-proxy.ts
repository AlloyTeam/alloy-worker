/*
 * 上报能力代理
 *
 * @Author: CntChen
 * @Date: 2020-12-07
 */

class ReportProxy {
    /**
     * 在 stack 空间记录上报代理实例列表
     */
    private static stack: ReportProxy[] = [];

    /**
     * 遍历上报代理加载真实上报模块
     *
     * @param module 真实上报模块
     */
    public static eachLoad(module: any) {
        ReportProxy.stack.forEach((sheetProxy) => {
            sheetProxy.initLoad(module);
        });
    }

    /**
     * 上报函数缓存
     */
    private cache: Function[] = [];
    /**
     * 要代理的函数名称
     * 支持通过`.`指定有命名空间的函数, 比如 `jank.log`
     */
    private functionName: string;
    /**
     * 真实上报模块
     */
    private module: any;

    public constructor(functionName: string) {
        this.functionName = functionName;

        // 把上报代理记录到 stack 空间
        ReportProxy.stack.push(this);
    }

    /**
     * 获取上报的代理函数
     * @param noCache 未加载真实上报模块前是否缓存上报数据
     */
    public getProxyFunction(noCache = false) {
        /**
         * args 为上报函数的参数数组
         */
        return (...args: any[]) => {
            // 如果真实上报模块已经加载, 直接调用
            if (this.module) {
                return this.execute.apply(this, args);
            }

            // 真实上报模块未加载, 并且无需缓存上报数据, 直接返回
            if (noCache) {
                return;
            }

            // 缓存待执行的上报函数
            this.cache.push(() => this.execute.apply(this, args));
        };
    }

    /**
     * 调用真实上报模块进行上报
     */
    private execute(...args: any[]) {
        /**
         * 上报代理代理的真实上报函数命名空间
         * 每次上报都重新解析为数组, 因为后面迭代获取真实函数会直接修改数组内容
         * 比如:
         *  [`tdwReport`]/ ['jank', 'log']
         */
        const funcNameSpace = this.functionName.split('.');

        const executeFunction = this.getExecuteFunction(this.module, funcNameSpace);
        return executeFunction.func.apply(executeFunction.self, args);
    }

    /**
     * 获取真实上报函数
     */
    private getExecuteFunction(
        module: any,
        funcNameSpace: string[]
    ): {
        self: any;
        func: Function;
    } {
        const reportFunctionName = funcNameSpace.shift();

        if (!reportFunctionName) {
            return module;
        }

        /**
         * 已经递归到真实上报函数的名称
         */
        if (funcNameSpace.length === 0) {
            return {
                self: module,
                func: module[reportFunctionName],
            };
        }

        return this.getExecuteFunction(module[reportFunctionName], funcNameSpace);
    }

    /**
     * 加载真实上报模块
     * @param module 真实上报模模块
     */
    private initLoad(module: any) {
        this.module = module;

        // 没有待执行的上报函数, 直接返回
        if (!this.cache.length) {
            return;
        }

        // 执行缓存的上报数组
        this.cache.forEach((func: Function) => {
            func();
        });

        this.cache.length = 0;
    }
}

const reportProxy: {
    monitor: any;
    raven: any;
    weblog: any;
} = {
    monitor: new ReportProxy('monitor').getProxyFunction(),
    raven: new ReportProxy('raven').getProxyFunction(),
    weblog: new ReportProxy('weblog').getProxyFunction(),
};

export default reportProxy;
export { ReportProxy };
