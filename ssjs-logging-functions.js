/***********************************************
 *
 *   function deBug()
 *   Writes responses and outputs to cloudpage for debugging code
 *
 *    @peram {string} Identifier for what is being debugged
 *    @peram {response} Output/Response to Stringify and Write
 *    @peram {logExtKey} External Key of Logging Data Extension
 *    @peram {debug} toggles debugging function to write values to cloudpage
 *
 *    @output Debugging Identifier, Stringified Response, line breaks around output
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
  
    addLog(log, logExtKey)
  }

} //End deBug


/***********************************************
 *
 *   function addLog()
 *   Pushes logging object to array to be written to a Data Extension
 *   
 *
 *    @peram {logObj} GUID value to identify script run for logging
 *    @peram {runLogCustKey} External Key to log records to
 *    @peram {debug} toggles debugging function to write values to cloudpage
 *    @peram {log} toggles logging function to write values to data extension
 *
 ***********************************************/
function addLog(arg, logExtKey) {
    var logDE = DataExtension.Init(logExtKey);
    var logAction = logDE.Rows.Add(arg);
}; //End addLog