import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

//Getting data from URL(Localhost for testing)
final String getQueStat = 'http://localhost:8000/data.json/';

//Local variables for testing
String qNum = '2';
String l = '444', k = '20';
int _timerStart = 12;

//UserStat class
class UserStat {
  const UserStat({this.quenum, this.linenum, this.timeuntil});

  final String quenum;
  final String linenum;
  final int timeuntil;
}

final String server =
    defaultTargetPlatform == TargetPlatform.android ? '10.0.2.2' : 'localhost';

final List<UserStat> _userstat = <UserStat>[
  UserStat(quenum: '444', linenum: '10', timeuntil: 11)
];

//Getting Queue Statictics Data
Future getQueStatFunc(String qNum) async {
  final res = await http.get(getQueStat + qNum);
  if (res.statusCode == 200) {
    // If the server did return a 200 OK response,
    // then parse the JSON.

    Map<String, dynamic> user = jsonDecode(res.body);
    l = user['quenum'].toString();
    k = user['linenum'].toString();
    _timerStart = user['timeuntil'];
    // t = user['timeuntil'].toString();
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load TicketStatistics!');
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
  //Timer variables
  Timer _timer;
  int _start = _timerStart;

  void startTimer() {
    if (_timer != null) {
      _timer.cancel();
      _timer = null;
    } else {
      _timer = Timer.periodic(
        const Duration(seconds: 1),
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
    startTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('${widget.name}: $_start'),
    );
  }
}

class SubPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    getQueStatFunc(qNum);
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
            Text(k),
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
                FlatButton(onPressed: null, child: Text('No')),
                FlatButton(onPressed: null, child: Text('Yes'))
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

class MyApp2 extends StatelessWidget {
  const MyApp2({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: SubPage(),
    );
  }
}

void main() => runApp(MyApp2());
