var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var people = {
    piwo: {
        1: {
            sex: "male",
            position: {
                lat: 51.084812,
                lng: 17.013667
            }
        },
        2: {
            sex: "female",
            position: {
                lat: 51.087775,
                lng: 17.013924
            }
        },
        3: {
            sex: "female",
            position: {
                lat: 51.087406,
                lng: 17.007773
            }
        }
    },
};

var meetpoints = {
    1: {
        name: "Szynkarnia",
        position: {
            lat: 51.109328,
            lng: 17.025007
        }
    }
}

var sockets = {};


function get_people_list_by_topic(people, topic){
    return Object.keys(people[topic])
      .map(id => Object.assign({}, people[id], { id: id }))
}


function handle_intro(socket, payload) {
    var person = {
      sex: payload.sex,
      position: payload.position,
    };
    var topic = payload.topic;
    var id = payload.id;

    people[topic][id] = person;
    sockets[id] = socket;
    socket.id = id;
    socket.topic = topic;

    console.log('on_intro received:', JSON.stringify(payload));
    io.emit('people', get_people_list_by_topic(people, topic));
}


function handle_ping(socket, payload) {
    console.log('on_ping received:', JSON.stringify(payload));
    var invited_id = payload.id;
    var invited_socket = sockets[invited_id];
    var topic = socket.topic;
    var person = people[topic][socket.id];
    invited_socket.emit('ping', person);
}


function handle_pong(socket, payload) {
    console.log('on_pong received:', JSON.stringify(payload));
    if (payload.acceted == true) {
      var accepted_person_id = payload.id;
      var accepted_person_socket = sockets[accepted_person_id];
      var topic = socket.topic;
      var person = people[topic][socket.id];
      // get poi
      var poi = {
        name: 'miejsce',
        position:{}
      };

      accepted_person_socket.emit('meet', poi);
      socket.emit('meet', poi);
    }
    else {
      // TODO: not acceted
    }
}


io.on('connection', function(socket) {
    socket.on('intro', payload => handle_intro(socket, payload));
    socket.on('ping', payload => handle_ping(socket, payload));
    socket.on('pong', payload => handle_pong(socket, payload));
});


http.listen(process.env.PORT || 3000, function() {
    console.log('listening on *:', process.env.PORT || 3000);
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
