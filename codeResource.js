<script runat='server'>
    Platform.Load("core", "1.1")
    Platform.Response.SetResponseHeader("Access-Control-Allow-Origin", "*");
    Platform.Response.SetResponseHeader('Strict-Transport-Security', 'max-age=200');
    Platform.Response.SetResponseHeader('X-XSS-Protection', '1; mode=block');
    Platform.Response.SetResponseHeader('X-Frame-Options', 'Deny');
    Platform.Response.SetResponseHeader('X-Content-Type-Options', 'nosniff');
    Platform.Response.SetResponseHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    Platform.Response.SetResponseHeader('Content-Security-Policy', "default-src 'self'");
    
    
    var postData = Platform.Request.GetPostData();
    var postJSON = Platform.Function.ParseJSON(postData);
    
    var log = Platform.Request.GetQueryStringParameter('log')
    var automationName = Platform.Request.GetQueryStringParameter('auto')
    var route = Platform.Request.GetQueryStringParameter('route')
    
    var prox = new Script.Util.WSProxy();
    
    switch (route) {
    
    case 'getLog':
        if (log === null || typeof log === 'undefined') {
            response('Log Data Extension is required')
        } else {
            var logDE = DataExtension.Retrieve({ Property: "Name", SimpleOperator: "equals", Value: log });
            var logKey = logDE[0].CustomerKey;
    
            var threshold = setLoggingThreshold(minutes)
    
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
                    Value: threshold
                }
            };
    
            var data = wsRead(logKey, filter);
            response(data)
        }
    break;
    
    case 'getAutomationStatus':
    
        var cols = ["Name","ProgramID","CustomerKey","Status"];
    
        var filter = {
            Property: "Name",
            SimpleOperator: "equals",
            Value: automationName
        };
    
        var result = prox.retrieve("Automation", cols, filter);
        var res = result.Results[0].Status;
    
        response(res)
    
    break;
    
    case 'createDataExtension':
        var dataExtensionName = postJSON.deName;
    
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
            "Name": dataExtensionName,
            "CategoryID": 0,
            "Fields": fields
        };
    
        var result = prox.createItem("DataExtension", config); 
    
        response(result)
    break;
    
    }
    
    
    function setLoggingThreshold(minutes){
        var d = new Date();
            d.setMinutes(d.getMinutes() - minutes);
    
            return d
    }
    
    
    function wsRead(logKey, filter) {
        try {
    
            var cols = getFieldNames(logExtKey);
    
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
     *    @param {arr} array to normalize
     *    @param {prop} property key of Array
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
     *    @param {deName} Name of DataExtension to get columns
     *
     *    @output {array} array of fields
     *
     ***********************************************/
    
    function getFieldNames(logExtKey) {
        var de = DataExtension.Init(logExtKey);
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