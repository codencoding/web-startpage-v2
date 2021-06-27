function delete_cookie( name, path, domain ) {
  if( get_cookie( name ) ) {
    document.cookie = name + "=" +
      ((path) ? ";path="+path:"")+
      ((domain)?";domain="+domain:"") +
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}

function get_cookie(name){
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(name + '=');
    });
}

function hyperlink(link) {
  window.location.href = link;
}

function set_variable(var_name, value) {
  let root = document.documentElement;
  
  root.style.setProperty(var_name, value);
}

function fetchJSON(fname, callback) {   
  var xobj = new XMLHttpRequest();

  xobj.overrideMimeType("application/json");
  xobj.open('GET', fname, true); // Replace 'appDataServices' with the path to your file
  // xobj.open('GET', 'appDataServices.json', true); // Replace 'appDataServices' with the path to your file
  xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      return callback(xobj.responseText);
      }
  };
  xobj.send(null);
}

function loadJSON(fname, callback) {
  /**
   * fname is the path and filename of the json file being loaded
   * storeVarName is the string name of the variable where the data
   * will be stored
   * 
   * TODO: Fix this jank function to work off the xml promise I should
   *       be getting from fetchJSON()
   */    

  console.warn("loadJSON function deprecated. Use fetchJSON instead.")
  fetchJSON(fname, callback)

  // fetchJSON(fname, (response) => {
  //  // Parsing JSON string into object
  //     eval(`${storeVarName} = JSON.parse(response);`)
  // //    storeVar = JSON.parse(response);
  // })
}