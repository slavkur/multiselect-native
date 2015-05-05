var keyDown = 40;
var keyUp = 38;
var keyEnter = 13;

var XMLHttpFactories = [
  function() {
    return new XMLHttpRequest()
  },
  function() {
    return new ActiveXObject("Msxml2.XMLHTTP")
  },
  function() {
    return new ActiveXObject("Msxml3.XMLHTTP")
  },
  function() {
    return new ActiveXObject("Microsoft.XMLHTTP")
  }
];

function createXMLHTTPObject() {
  var xmlhttp = false;
  for (var i = 0; i < XMLHttpFactories.length; i++) {
    try {
      xmlhttp = XMLHttpFactories[i]();
    } catch (e) {
      continue;
    }
    break;
  }
  return xmlhttp;
}

function request(url, callback) {
  var http = createXMLHTTPObject();
  http.open('GET', url, false);
  http.onreadystatechange = function() {
    if (http.status === 200) {
      callback(http, JSON.parse(http.response));
    }
  };
  http.send(null);
}

function renderSelectors(cls) {
  var selectors = document.getElementsByClassName(cls);
  for (var i = 0; i < selectors.length; i++) {
    Selector(selectors[i]);
  }
}

function Selector(selector) {
  var filtered;
  var dialogHeight;
  var selectedPerson;
  var added = [];
  var filter = selector.firstChild;
  var dialog = selector.nextSibling;
  var dialogList = dialog.firstChild;
  var bodyBlur = function(e) {
    dialog.style.display = 'none';
  };
  // multiinstance events
  if(document.body.onclick instanceof Function) {
    var bodyClick = document.body.onclick;
    document.body.onclick = function() {
      bodyClick();
      bodyBlur();
    };
  } else {
    document.body.onclick = bodyBlur;
  }

  selector.onclick = function(e) {
    // stop bubbling to keep dialog open
    e.stopPropagation();
    filter.focus();
  };
  dialogList.onclick = function(e) {
    // stop bubbling to keep dialog open
    e.stopPropagation();
  };
  filter.onclick = function(e) {
    // stop bubbling to keep dialog open
    e.stopPropagation();
  };
  filter.onfocus = function(e) {
    // clear all opened dialogs by bluring
    document.body.onclick();
    dialog.style.display = 'block';
    dialogHeight = dialog.clientHeight;
  };
  filter.onkeydown = function(e) {
    // key navigation support, arrow up/down with proper scrolling
    if (keyDown === e.keyCode && selectedPerson.nextSibling) {
      selectedPerson.removeAttribute('class');
      selectedPerson.nextSibling.setAttribute('class', 'selected');
      selectedPerson = selectedPerson.nextSibling;
      if (dialog.clientHeight + dialog.scrollTop - selectedPerson.clientHeight < selectedPerson.offsetTop) {
        dialog.scrollTop += selectedPerson.clientHeight;
      }
    } else if (keyUp === e.keyCode && selectedPerson.previousSibling) {
      selectedPerson.removeAttribute('class');
      selectedPerson.previousSibling.setAttribute('class', 'selected');
      selectedPerson = selectedPerson.previousSibling;
      if (dialog.scrollTop > selectedPerson.offsetTop) {
        dialog.scrollTop -= selectedPerson.clientHeight;
      }
    } else if (keyEnter === e.keyCode) {
      var person = document.createElement('div');
      var label = document.createElement('label');
      var del = document.createElement('i');

      del.innerHTML = "x";
      del.onclick = function(e) {
        // stop bubbling to prevent focusing on selector
        e.stopPropagation();
        selector.removeChild(person);
        added.splice(added.indexOf(e.target.previousSibling.innerHTML), 1);
        clearFilter();
      };
      person.appendChild(label);
      person.appendChild(del);
      selector.insertBefore(person, filter);
      label.innerHTML = selectedPerson.innerHTML;
      added.push(selectedPerson.innerHTML);

      clearFilter();
    }
  };
  filter.onkeyup = function(e) {
    // text filtering if no arrows for navigation used
    if (e.keyCode !== keyDown && e.keyCode !== keyUp) {
      filtered = [];
      // first we check local data received with initial request
      for (var i = 0; i < list.length; i++) {
        if (list[i].toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
          filtered.push(list[i]);
        }
      }
      if (e.target.value.length === 0) {
        updateList(list);
      } else if(filtered.length === 0) {
        request('/api/people/'+ e.target.value, function(http, jsonResp) {
          updateList(jsonResp);
        });
      } else {
        updateList(filtered);
      }
    }
  }

  function clearFilter() {
    document.body.onclick();
    filter.blur();
    filter.value = '';
    updateList(list);
  }

  function updateList(list) {
    var cummulativeHeight = 0;
    dialogList.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
      if(added.indexOf(list[i]) === -1) {
        var person = document.createElement('li');
        // self execution function to ensure the right 'person' is used
        (function(person) {
          person.onmouseover = function() {
            selectedPerson.removeAttribute('class');
            person.setAttribute('class', 'selected');
            selectedPerson = person;
          };
          person.onclick = function() {
            filter.onkeydown({
              keyCode: keyEnter
            });
          };
        })(person);
        person.innerHTML = list[i];
        dialogList.appendChild(person);
        cummulativeHeight += person.clientHeight;
        if (i === 0) {
          selectedPerson = person;
          person.setAttribute('class', 'selected');
        }
      }
    }
    adjustDialogHeight(cummulativeHeight, list.length > 0);
  }

  function adjustDialogHeight(cummulativeHeight, hasItems) {
    if(cummulativeHeight <= dialogHeight && hasItems && cummulativeHeight > 0) {
      dialog.style.height = cummulativeHeight;
    } else {
      dialog.style.height = null;
    }
    // to avoid interaption wuth selector>dialog
    if(!hasItems) {
      dialog.style.visibility = 'hidden';
    } else {
      dialog.style.visibility = null;
    }
  }

  updateList(list);
}

var list = [];
request('/api/people', function(http, jsonResp) {
  list = jsonResp;
  renderSelectors('selector');
});