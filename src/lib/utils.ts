// https://stackoverflow.com/questions/16135814/check-for-ie-10
export const isIE10 = (() => {
    return navigator.userAgent.toLowerCase().indexOf('MSIE 10') !== -1 ? true : false;
})();

export const isIE11 = (() => {
    return navigator.userAgent.toLowerCase().indexOf('rv:11') !== -1 ? true : false;
})();
