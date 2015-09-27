var _dicts = {
    'assetCategory': { 1: '通讯', 2: '配件', 3: '网络', 4: '服务器', 5: '笔记本', 6: '显示器' },
    'payMethod': { 1: '现金', 2: '转账', 3: '其他方式' },
    'dealRule': { 1: '价高者得', 2: '综合评分', 3: '全资质者优先' },
    'sheetStatus': { 1: '草稿', 2: '提交审核', 3: '审核通过', 4: '审核不通过', 5: '成交', 6: '结单' },
    'offerStatus': { 1: '等待', 2: '成交', 3: '失败' },

    'translate': function (records, fields, keys) {
        // records: a record array or a single record.
        // fields: field array or a field.
        // keys: key array or a key. keys must have same length as fields.

        function translateOne(record, field, key) {
            var value = record[field];
            if (value) {
                record[field + 'Text'] = _dicts[key][value] || '';
            }
        }

        keys || (keys = fields);
        if (records instanceof Array) {
            for (var r in records) {
                if (records[r]) {
                    if (fields instanceof Array) {
                        for (var i = 0; i < fields.length; i++) {
                            translateOne(records[r], fields[i], keys[i]);
                        }
                    }
                    else {
                        translateOne(records[r], fields, keys);
                    }
                }
            }
        }
        else {
            if (fields instanceof Array) {
                for (var i = 0; i < fields.length; i++) {
                    translateOne(records, fields[i], keys[i]);
                }
            }
            else {
                translateOne(records, fields, keys);
            }
        }
    }
}

var _helper = {
    showHttpError: function (response) {
        alert(response.status + ':' + response.statusText + '\n' + response.data);
    }
};