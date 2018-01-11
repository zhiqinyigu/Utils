var _unitSheet = {
    4: {
        unit: 'k', // 单位
        start: 4 // 多少位起计
    },
    5: 'w',
};

function formatCount(num, unitSheet) {
    unitSheet = unitSheet || _unitSheet;

    var bitOfVal, _bit, _bitObj, formatBit,
        unitSheetKeys = Object.keys(unitSheet);

    num = Math.floor(+num);
    bitOfVal = (num + '').length;

    for (var i = unitSheetKeys.length - 1; i >= 0; i--) {
        _bit = unitSheetKeys[i];
        _bitObj = unitSheet[_bit];
        _bit = typeof _bitObj === 'object' ? _bitObj.start : _bit;

        if (bitOfVal >= _bit) {
            formatBit = unitSheetKeys[i];
            break;
        }
    }

    if (formatBit) {
        return +(num / Math.pow(10, formatBit - 1)).toFixed(1) + (unitSheet[formatBit].unit || unitSheet[formatBit]);
    }

    return num;
}

module.exports = {
    formatCount: formatCount
}