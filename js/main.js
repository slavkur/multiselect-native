var keyDown = 40;
var keyUp = 38;
var keyEnter = 13;
var keyShift = 16;
var keyTab = 9;

$ = function(el) {
  // most annoying in native javascript is working with dom
  // we are interested in tag element and not in texnodes
  return {
    get: function() {
      return el;
    },
    parent: function() {
      return $(el.parentNode);
    },
    removeClass: function(cls) {
      el.className = el.className.replace(new RegExp(" \\b" + cls + "\\b"), '');
      return $(el);
    },
    addClass: function(cls) {
      this.removeClass(cls);
      el.className += ' ' + cls;
      return $(el);
    },
    first: function() {
      if (el.firstChild && !(el.firstChild instanceof HTMLElement)) {
        return $(el.firstChild.nextSibling);
      } else {
        return $(el.firstChild);
      }
    },
    last: function() {
      if (el.lastChild && !(el.lastChild instanceof HTMLElement)) {
        return $(el.lastChild.previousSibling);
      } else {
        return $(el.lastChild);
      }
    },
    next: function() {
      if (el.nextSibling && !(el.nextSibling instanceof HTMLElement)) {
        return $(el.nextSibling.nextSibling);
      } else {
        return $(el.nextSibling);
      }
    },
    prev: function() {
      if (el.previousSibling && !(el.previousSibling instanceof HTMLElement)) {
        return $(el.previousSibling.previousSibling);
      } else {
        return $(el.previousSibling);
      }
    }
  }
};

// cross browser ajax request objects 
var XMLHttpFactories = [
  function() {
    return new XMLHttpRequest();
  },
  function() {
    return new ActiveXObject("Msxml2.XMLHTTP");
  },
  function() {
    return new ActiveXObject("Msxml3.XMLHTTP");
  },
  function() {
    return new ActiveXObject("Microsoft.XMLHTTP");
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

function renderMultiSelects(cls) {
  var multiselects = document.getElementsByClassName(cls);
  for (var i = 0; i < multiselects.length; i++) {
    MultiSelect(multiselects[i]);
  }
}

// for detailed instructions on options please review README file
function MultiSelect(multiselect) {
  var filtered;
  var dialogHeight;
  var selectedPerson;
  var added = [];
  var selector = $(multiselect).last().last().prev().get();
  var imgs = $(selector).parent().prev().get();
  var filter = $(selector).first().get();
  var dialog = $(selector).next().get();
  var dialogList = $(dialog).first().get();
  var dataAllowMultiple = false;
  var dataAllowAutoComplete = false;
  var dataAllowRemote = false;

  if(multiselect.getAttribute('data-imgs') === null) {
    $(multiselect).addClass('hideImgs');
  }
  if(multiselect.getAttribute('data-multiple') !== null) {
    dataAllowMultiple = true;
  }
  if(multiselect.getAttribute('data-autocomplete') === null) {
    $(multiselect).addClass('hideFilterText');
  } else {
    dataAllowAutoComplete = true;
  }
  if(multiselect.getAttribute('data-remote') !== null) {
    dataAllowRemote = true;
  }

  var bodyBlur = function(e) {
    dialog.style.display = 'none';
  };
  // multiinstance events
  if (document.body.onclick instanceof Function) {
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
    dialog.scrollTop = 0;
    dialogHeight = dialog.clientHeight;
  };
  filter.onkeydown = function(e) {
    // key navigation support, arrow up/down with proper scrolling
    if (keyDown === e.keyCode && $(selectedPerson).next().get()) {
      selectedPerson.removeAttribute('class');
      var nextSibling = $(selectedPerson).next().get();
      nextSibling.setAttribute('class', 'selected');
      selectedPerson = nextSibling;
      if (dialog.clientHeight + dialog.scrollTop - selectedPerson.clientHeight < selectedPerson.offsetTop) {
        dialog.scrollTop += selectedPerson.clientHeight;
      }
    } else if (keyUp === e.keyCode && $(selectedPerson).prev().get()) {
      selectedPerson.removeAttribute('class');
      var previousSibling = $(selectedPerson).prev().get();
      previousSibling.setAttribute('class', 'selected');
      selectedPerson = previousSibling;
      if (dialog.scrollTop > selectedPerson.offsetTop) {
        dialog.scrollTop -= selectedPerson.clientHeight;
      }
    } else if (keyEnter === e.keyCode) {
      var person = document.createElement('div');
      var label = document.createElement('label');
      var del = document.createElement('i');
      var img = document.createElement('img');

      del.innerHTML = "x";
      // custing img instance for click event
      (function(img) {
        del.onclick = function(e) {
          // stop bubbling to prevent focusing on selector
          e.stopPropagation();
          selector.removeChild(person);
          added.splice(added.indexOf($(e.target).prev().get().innerHTML), 1);
          imgs.removeChild(img);
          clearFilter();
        };
      })(img);

      person.appendChild(label);
      person.appendChild(del);
      imgs.appendChild(img);
      selector.insertBefore(person, filter);
      label.innerHTML = $(selectedPerson).first().next().get().innerHTML;
      img.src = $(selectedPerson).first().get().src;
      added.push(label.innerHTML);

      clearFilter();
    }
    if(!dataAllowAutoComplete && e.keyCode !== keyShift && e.keyCode !== keyTab) {
      e.preventDefault && e.preventDefault();
    }
  };
  filter.onkeyup = function(e) {
    var personMame, imgSrc;
    // text filtering if no arrows for navigation used
    if (e.keyCode !== keyDown && e.keyCode !== keyUp) {
      filtered = [];
      // first we check local data received with initial request
      for (var i = 0; i < list.length; i++) {
        personMame = list[i].name;
        imgSrc = list[i].imgSrc;
        if (personMame.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
          filtered.push({
            imgSrc: imgSrc,
            name: personMame
          });
        }
      }
      if (e.target.value.length === 0) {
        updateList(list);
      } else if (filtered.length === 0 && dataAllowRemote) {
        request('/api/people/' + e.target.value, function(http, jsonResp) {
          updateList(jsonResp);
        });
      } else {
        updateList(filtered);
      }
    }
  }

  function clearFilter() {
    // cleanup method after selection is done
    document.body.onclick();
    filter.blur();
    filter.value = '';
    updateList(list);

    if(dataAllowMultiple || added.length === 0) {
      $(multiselect).removeClass('hideFilter');
    } else {
      $(multiselect).addClass('hideFilter');
    }

    $(imgs).removeClass('four').removeClass('two');
    if (imgs.childNodes.length > 2) {
      $(imgs).addClass('four');
    } else if (imgs.childNodes.length === 2) {
      $(imgs).addClass('two');
    }
  }

  function updateList(list) {
    var cummulativeHeight = 0, iterator = 0,
      person, personMame, imgSrc;
    dialogList.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
      personMame = list[i].name;
      imgSrc = list[i].imgSrc;
      if (added.indexOf(personMame) === -1) {
        person = document.createElement('li');
        var name = document.createElement('span');
        var avatar = document.createElement('img');
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
        avatar.src = imgSrc;
        name.innerHTML = personMame;
        person.appendChild(avatar);
        person.appendChild(name);
        dialogList.appendChild(person);
        cummulativeHeight += person.clientHeight;
        iterator++;
      }
    }
    person = $(dialogList).first().get();
    if (person) {
      selectedPerson = person;
      person.setAttribute('class', 'selected');
    }

    adjustDialogHeight(cummulativeHeight, iterator > 0);
  }

  function adjustDialogHeight(cummulativeHeight, hasItems) {
    if (cummulativeHeight <= dialogHeight && hasItems && cummulativeHeight > 0) {
      dialog.style.height = cummulativeHeight;
    } else {
      dialog.style.height = null;
    }
    // to avoid interaption wuth selector>dialog
    if (!hasItems) {
      dialog.style.visibility = 'hidden';
    } else {
      dialog.style.visibility = 'visible';
    }
  }

  updateList(list);
}

var list = [];
request('/api/people', function(http, jsonResp) {
  list = jsonResp;
  renderMultiSelects('multiselect');
});