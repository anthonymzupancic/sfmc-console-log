# [sfmc] console.log
While developing Server-Side JavaScript within Salesforce Marketing Cloud (SFMC) there's no consistent way to display/read script output or breaks for debugging. One common method is to add rows to a data extension where you are trying to debug your scripts.

Even though rows are added to the data extension, to see the records as the script is processing you need to refresh your browser.

With this CloudPage and Code Resource, you can pull all recent rows from your logging data extension on a set interval and refresh your display.

In addition, you can create a logging data extension directly from the page.


## requirements

### data extension
The first requirement of logging within SFMC is a data extension to store your logging records. Since we are logging a potential wide range of data there are only three columns I include: `Timestamp | action | log`. 

| Field     | Data Type | Default     | Length  |
| --------- | --------- | ----------- | ------- |
| timestamp | Date      | Use Current | N/A     |
| action    | Text      | N/A         | 250     |
| log       | Text      | N/A         | (empty) |


### script
Add the `deBug | addLog | getDataExtensionKey` functions to your script as shown below. In your script add the `deBug` function at the points you want to track output and responses. 

The `deBug` function serves two debugging purposes; the first is adding to the logging data extension and the other is displaying the debugging output when run directly on a CloudPage.

```javascript
/***********************************************
 *
 *   function deBug()
 *   Writes responses and outputs to cloudpage for debugging code
 *
 *    @peram action {String} Identifier for what is being debugged
 *    @peram response {Object} Output/Response to Stringify and Write
 *    @peram logExtKey {String} External Key of Logging Data Extension
 *    @peram debug {Number} toggles debugging function to write values to cloudpage
 *    @return Debugging Identifier, Stringified Response, line breaks around output
 *
 ***********************************************/
function deBug(action, response, logExtKey, debug) {
  if (response) {
    debug ? Write("<br><b>" + action + ":</b><br> " + Stringify(response) + "<br><br>") : null;
  } else {
    debug ? Write("<br><b>" + action + "</b><br> ") : null;
  }

  if(logExtKey){
    var log = {
        action: action ? action : null,
        log: response ? response : null
    }
  
    addLog(log, logExtKey);
  }
}


/***********************************************
 *
 *   function addLog()
 *   Pushes logging object to array to be written to a Data Extension
 *   
 *    @peram obj {Object} logging object that matches the data extension
 *    @peram logExtKey {String} External Key to log records to
 *    
 ***********************************************/
function addLog(obj, logExtKey) {
    var logDE = DataExtension.Init(logExtKey);
    var logAction = logDE.Rows.Add(obj);
};


/**
 * 
 * function getDataExtensionKey()
 * Retieves the External Key for a SFMC Data Extension
 * 
 * @peram name {String} Name of the data extension
 * @return {string} External Key of data extension
 * 
 */
function getDataExtensionKey(name){
    var de = DataExtension.Retrieve({ 
        Property: "Name", 
        SimpleOperator: "equals", 
        Value: name });

    var logKey = de[0].CustomerKey;

    return logKey;
}
```