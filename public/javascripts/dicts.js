var _dicts = {
    'assetCategory': { 1: '通讯', 2: '配件', 3: '网络', 4: '服务器', 5: '笔记本', 6: '显示器' },
    'payMethod': { 1: '卖方支付押金给平台', 2: '货到付款', 3: '验货付款' },
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
