// import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';

//Getting data from URL(Localhost for testing)
final String getQueStat =
    'https://senior.fastntech.com:443/api/mobile/queue/info/';

final String giveUpUrl = 'https://senior.fastntech.com:443/api/mobile/queue/';

//Local variables for testing
String qNum = '';
String l = '', k = '';
int _timerStart;

//UserStat class
class UserStat {
  String quenum;
  String linenum;
  int timeuntil;

  UserStat({this.quenum, this.linenum, this.timeuntil});
}

UserStat userStat = UserStat();
// final List<UserStat> _userstat = <UserStat>[
//   UserStat(quenum: Get.arguments, linenum: '10', timeuntil: 11)
// ];

// Future<Album> fetchAlbum() async {
//   final prefs = await SharedPreferences.getInstance();
//   final response = await http.get(getQueStat + qNum, headers: <String, String>{
//     'authentication': prefs.getString('token'),
//   });

//   // Appropriate action depending upon the
//   // server response
//   if (response.statusCode == 200 || response.statusCode == 400) {
//     return Album.fromJson(json.decode(response.body));
//   } else {
//     throw Exception('Failed to load album');
//   }
// }

// class Album {
//   final int avgTime;
//   final int frontCount;
//   final int waitingTime;

//   Album({this.avgTime, this.frontCount, this.waitingTime});

//   factory Album.fromJson(Map<String, dynamic> json) {
//     return Album(
//       avgTime: json['avgTime'],
//       frontCount: json['frontCount'],
//       waitingTime: json['waitingTime'],
//     );
//   }
// }

//Getting Queue Statictics Data
Future getQueStatFunc() async {
  final prefs = await SharedPreferences.getInstance();
  final res = await http.get(getQueStat + qNum, headers: <String, String>{
    'authentication': prefs.getString('token'),
  });
  if (res.statusCode == 200 || res.statusCode == 400) {
    // If the server did return a 200 OK response,
    // then parse the JSON.

    Map<String, dynamic> user = jsonDecode(res.body);

    l = user['avgTime'].toString();
    k = user['frontCount'].toString();
    _timerStart = user['waitingTime'];
    // userStat.quenum = l;
    // userStat.linenum = k;
    // userStat.timeuntil = _timerStart;

    // t = user['timeuntil'].toString();
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load TicketStatistics!');
  }
}

Future giveUpQueue() async {
  final prefs = await SharedPreferences.getInstance();
  final res = await http.delete(giveUpUrl, headers: <String, String>{
    'authentication': prefs.getString('token'),
  });
  if (res.statusCode == 200 || res.statusCode == 400) {
    await Get.offNamed('/second');
  }
}

//Everytime counts down it draws the minute
class CountdownTimer extends StatefulWidget {
  CountdownTimer({Key key}) : super(key: key);
  final String name = 'Approximate Time Length in minutes';

  @override
  _CountdownTimerState createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  // final FirebaseMessaging _firebaseMessaging = FirebaseMessaging();
  //Timer variables
  Timer _timer;
  int _start = userStat.timeuntil;

  void startTimer() {
    if (_timer != null) {
      _timer.cancel();
      _timer = null;
    } else {
      _timer = Timer.periodic(
        const Duration(minutes: 1),
        (Timer timer) => setState(
          () {
            if (_start < 1) {
              timer.cancel();
            } else {
              _start = _start - 1;
            }
          },
        ),
      );
    }
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getQueStatFunc();
    startTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('${widget.name}: $_start'),
    );
  }
}

class SubPage extends StatefulWidget {
  @override
  _SubPageState createState() => _SubPageState();
}

class _SubPageState extends State<SubPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Queue Page'),
        backgroundColor: Colors.redAccent,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(l),
            Text('Your Number '),
            Text('the number of people in front of you'),
            Text('${k}'),
            CountdownTimer(),
            // Text('Approximate Time Length in milliseconds '),
            // Text(t.toString()),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              title: Text('Forfeit Queue?'),
              content: Text('Please Confirm'),
              actions: [
                FlatButton(
                  child: Text('No'),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
                FlatButton(
                    child: Text('Yes'),
                    onPressed: () {
                      giveUpQueue();
                      // Get.offNamed('/second');
                    })
              ],
            ),
          );
        },
        child: Icon(Icons.cancel),
        backgroundColor: Colors.redAccent,
      ),
    );
  }
}
