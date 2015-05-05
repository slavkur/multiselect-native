/*

{
A:'Ф', // 0041 0424
B:'И' // 0042 0418
C:
D:
E:
F:
G:
H:
K:
L:
M:
N:
O:
P:
'[' // 005B '{' 007B
']' // 005D '}' 007D
':', 003A '; '003B
'<' ','
'<'" '.'
} 


*/

var qwrus = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ';
var qwrusMin = qwrus.toLowerCase();
var qweng = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>';
var qwengMin = qweng.toLowerCase();
var codes = [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 90, 88, 67, 86, 66, 78, 77, 188, 190];
var keyDown = 40;
var keyUp = 38;
var keyEnter = 13;

function multyKey(keyCode) {
  var codeIndex = codes.indexOf(e.keyCode);
  return (e.keyCode, qwrus[codeIndex], qweng[codeIndex]);
}

function xmlhttpreq() {
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}
var http = xmlhttpreq();
http.open('GET', '/', false);
http.send(null);
if (http.status == 200) {
  console.log(http.status);
}

var list = ["Vladimir Evseenkov", "Sofya Kurkova", "Lisa Bobrykava", "Sergey Scherbakov",
  "Stanislav Zinovyev", "Arturo Latypov", "Andrey Zhadanov", "Maria Prikhodko", "Kristina Kolyakina",
  "Timur Novikov", "Alex Frants", "Vladislav Guskov", "Artur Bekirov", "Mikhail Yatsyk", "Maxim Usik",
  "Zoychik Bogach", "Svetlana Gusterina", "Masha Petrova"
];
var filtered;

// Selector
var selector = document.getElementsByClassName('selector')[0];
var filter = selector.firstChild;
var dialog = selector.nextSibling.firstChild;
document.body.onclick = function(e) {
  selector.nextSibling.style.display = null;
};
selector.onclick = function(e) {
  e.stopPropagation();
  filter.focus();
};
dialog.onclick = function(e) {
  e.stopPropagation();
};
filter.onclick = function(e) {
  e.stopPropagation();
};
filter.onfocus = function(e) {
  selector.nextSibling.style.display = 'block';
};
filter.onkeydown = function(e) {
  //console.log(e.keyCode, selector.nextSibling.clientHeight, selector.nextSibling.scrollTop, selected.offsetTop);
  if (keyDown === e.keyCode && selected.nextSibling) {
    selected.removeAttribute('class');
    selected.nextSibling.setAttribute('class', 'selected');
    selected = selected.nextSibling;
    if (selector.nextSibling.clientHeight + selector.nextSibling.scrollTop - selected.clientHeight < selected.offsetTop) {
      selector.nextSibling.scrollTop += selected.clientHeight;
    }
  } else if (keyUp === e.keyCode && selected.previousSibling) {
    selected.removeAttribute('class');
    selected.previousSibling.setAttribute('class', 'selected');
    selected = selected.previousSibling;
    if (selector.nextSibling.scrollTop > selected.offsetTop) {
      selector.nextSibling.scrollTop -= selected.clientHeight;
    }
  } else if (keyEnter === e.keyCode) {
    var person = document.createElement('div');
    var label = document.createElement('label');
    var del = document.createElement('i');
    del.innerText = "x";
    del.onclick = function(e) {
      e.stopPropagation();
      selector.removeChild(person);
      document.body.onclick();
      filter.blur();
    };
    person.appendChild(label);
    person.appendChild(del);
    selector.insertBefore(person, filter);
    label.innerText = selected.innerText;
    document.body.onclick();
    filter.blur();
  }
};
filter.onkeyup = function(e) {
  if (e.keyCode !== keyDown && e.keyCode !== keyUp) {
    filtered = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
        filtered.push(list[i]);
      }
    }
    if (e.target.value.length === 0) {
      People(list);
    } else {
      People(filtered);
    }
  }
}

// Person
var selected;

function People(list) {
  dialog.innerHTML = '';
  for (var i = 0; i < list.length; i++) {
    var person = document.createElement('li');
    var avatar = document.createElement('i');
    // self execution function to ensure the right 'person' is used
    (function(person) {
      person.onmouseover = function() {
        selected.removeAttribute('class');
        person.setAttribute('class', 'selected');
        selected = person;
      };
      person.onclick = function() {
        filter.onkeydown({
          keyCode: keyEnter
        });
      };
    })(person);
    person.innerText = list[i];
    dialog.appendChild(person);
    person.insertBefore(avatar, person.firstChild);
    if (i === 0) {
      selected = person;
      person.setAttribute('class', 'selected');
    }
  }
}
People(list);