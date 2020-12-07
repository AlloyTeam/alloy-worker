/*
 * 用 Proxy 暂时处理需要作为参数的复杂对象
 * @Author: CntChen
 */

let MoebiusObject: any;

const handler = {
    get: () => MoebiusObject,
};

const origin = function () {
    return MoebiusObject;
};

MoebiusObject = new Proxy(origin, handler);

export default MoebiusObject;
