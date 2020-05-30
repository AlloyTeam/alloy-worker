const ua = navigator.userAgent.toLowerCase();

// https://stackoverflow.com/questions/16135814/check-for-ie-10
export const isIE10 = (() => {
    return ua.match(/(msie\s10)|(trident\/6\.0)/) ? true : false;
})();

export const isIE11 = (() => {
    return ua.match(/(rv\:11)|(trident\/7\.0)/) ? true : false;
})();
