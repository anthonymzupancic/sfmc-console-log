<script runat='server'>
Platform.Load("core", "1.1")

var log = Platform.Request.GetQueryStringParameter('log')
var deName = Platform.Request.GetQueryStringParameter('deName')
var route = Platform.Request.GetQueryStringParameter('route')

switch (route) {

case 'getLog':
    if (log === null || typeof log === 'undefined') {
        response('Log Data Extension is required')
    } else {
        var logDE = DataExtension.Retrieve({ Property: "Name", SimpleOperator: "equals", Value: log });
        var logKey = logDE[0].CustomerKey;

        var data = wsRead(logKey);
        response(data)
    }
break;

case 'createDataExtension':
    var api = new Script.Util.WSProxy();
    
    var fields = [
        {
            "Name": "timestamp",
            "FieldType": "Date",
            "DefaultValue": "GETDATE()",
            "IsRequired": false
        },
        {
            "Name": "action",
            "FieldType": "Text",
            "MaxLength": 250,
            "IsRequired": false
        }, 
        {
            "Name": "log",
            "FieldType": "text",
            "IsRequired": false
        }
    ];

    var config = {
        "CustomerKey": String(Platform.Function.GUID()).toUpperCase(),
        "Name": deName,
        "CategoryID": 0,
        "Fields": fields
    };

    var result = api.createItem("DataExtension", config); 

    response(result)
break;

}

function wsRead(logKey) {
    try {

        var d = new Date();
        d.setMinutes(d.getMinutes() - 20);

        var prox = new Script.Util.WSProxy();
        var cols = ["timestamp", "action", "log"];
        var filter = {
            LeftOperand: {
                Property: "timestamp",
                SimpleOperator: "isNotNull",
                Value: ""
            },
            LogicalOperator: "AND",
            RightOperand: {
                Property: "timestamp",
                SimpleOperator: "greaterThanOrEqual",
                Value: d
            }
        };

        var desc = prox.retrieve("DataExtensionObject[" + logKey + "]", cols, filter);
        desc = formatResult(desc.Results, "Properties")

        return desc

    } catch (err) {

        return err

    }
}


/***********************************************
 *
 *   function formatResult()
 *   Takes Objects that are Name/Value pairs {Name: "Key", Value: "Value"} and
 *   normalizes them to a standard JSON object {key: "value"}
 *
 *    @peram {arr} array to normalize
 *    @peram {prop} property key of Array
 *
 *    @output Array of normalized JSON object
 *
 ***********************************************/
function formatResult(arr, prop) {
    var results = [];
    for (var i = 0; i < arr.length; i++) {
        var result_list = arr[i][prop];
        var obj = {};
        for (k in result_list) {
            var key = result_list[k].Name;
            var val = result_list[k].Value
            if (key.indexOf("_") != 0) obj[key] = val;
        }
        results.push(obj);
    }
    return results;
};



/***********************************************
 *
 *   function getFieldNames()
 *   Gets all columns from a SOAP Object
 *
 *    @peram {deName} Name of DataExtension to get columns
 *
 *    @output {array} array of fields
 *
 ***********************************************/

function getFieldNames(deName) {
    var attr = DataExtension.Retrieve({ Property: "Name", SimpleOperator: "equals", Value: deName });
    var de = DataExtension.Init(attr[0].CustomerKey);
    var fields = de.Fields.Retrieve();

    //fields.sort(function(a, b) { return (a.Ordinal > b.Ordinal) ? 1 : -1 });

    var out = [];

    for (k in fields) {
        out.push({
            fieldName: fields[k].Name,
            dataType: fields[k].FieldType,
            isPrimaryKey: fields[k].IsPrimaryKey
        });
    }

    return out;

} //End retrieveFieldNames



/************************

FORMAT API RESPONSES from Code Resource Pages

*************************/
function response(res) {
    return Write(Stringify(res));
}

</script>