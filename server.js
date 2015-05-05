var express = require('express');
var server = express();

server.engine('html', require('ejs').renderFile);
server.use('/js', express.static(__dirname + '/js'));
server.use('/styles', express.static(__dirname + '/styles'));

server.get('/', function(req, res) {
  res.render(__dirname + '/index.html');
});

server.get('/api/people', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(listAll));
});
server.get('/api/people/:query', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(filterPeople(req.params.query)));
});

server.listen(8080, '127.0.0.1');


// keys must match with keyboard layout for transcoding
var qwrus = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ';
var qwrusMin = qwrus.toLowerCase();
var qweng = 'QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>';
var qwengMin = qweng.toLowerCase()
.replace('{', '[').replace('}', ']')
.replace(':', ';').replace('"', "'")
.replace('<', ',').replace('>', '.');

function findChar(origLetter, lang1, lang2, lang1Min, lang2Min) {
  // both small and uppercases are checked (due to the properties of keyboard layout)
  var letter;
  letter = lang1[lang2.indexOf(origLetter)];
  if(!letter) {
    letter = lang1Min[lang2Min.indexOf(origLetter)];
  }
  if(!letter) {
    // original letter will be used if no transcoding done
    letter = origLetter;
  }
  return letter;
}

function transcode(str) {
  var result = '';
  for(var i = 0; i < str.length; i++) {
    // hard coded distinction experession and optimization
    // english char codes are less than 1000
    // russian char codes are larger than 1000
    if(str[i].charCodeAt(0) < 1000) {
      result += findChar(str[i], qwrus, qweng, qwrusMin, qwengMin);
    } else {
      result += findChar(str[i], qweng, qwrus, qwengMin, qwrusMin);
    }
  }
  return result;
}

function filterPeople(query) {
  // we must check both name and domain for proper search (+in case of transcoding)
  var filtered = [];
  people.forEach(function(item) {
    if(item.name.toLowerCase().indexOf(query) > -1 || 
       item.name.toLowerCase().indexOf(transcode(query)) > -1) {
      filtered.push(item.name);
    } else if(item.domain && 
      (item.domain.toLowerCase().indexOf(query) > -1  ||
       item.domain.toLowerCase().indexOf(transcode(query)) > -1)) {
      filtered.push(item.name);
    }
  });
  return filtered;
}

var people = [{
    name: "Vladimir Evseenkov",
    domain: "hellovlad"
  }, {
    name: "Sofya Kurkova",
    domain: "sofa"
  }, {
    name: "Lisa Bobrykava"
  }, {
    name: "Sergey Scherbakov"
  }, {
    name: "Stanislav Zinovyev"
  }, {
    name: "Arturo Latypov"
  }, {
    name: "Andrey Zhadanov"
  }, {
    name: "Maria Prikhodko"
  }, {
    name: "Kristina Kolyakina"
  }, {
    name: "Timur Novikov"
  }, {
    name: "Alex Frants"
  }, {
    name: "Vladislav Guskov",
    domain: 'rus123'
  }, {
    name: "Artur Bekirov"
  }, {
    name: "Mikhail Yatsyk"
  }, {
    name: "Maxim Usik"
  }, {
    name: "Zoychik Bogach"
  }, {
    name: "Svetlana Gusterina"
  }, {
    name: "Masha Petrova"
  } 
];

// list for all people needed as the start
var listAll = [];
people.forEach(function(item) {
  listAll.push(item.name);
});