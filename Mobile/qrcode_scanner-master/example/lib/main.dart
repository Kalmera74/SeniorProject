import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:io';

import 'dart:typed_data';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:qrscan/qrscan.dart' as scanner;
import 'package:http/http.dart' as http;
import 'package:qrscan_example/occupancy_chart.dart';
import 'package:qrscan_example/subscriber_series.dart';
import 'package:qrscan_example/Screens/QueueScreen.dart';
import 'package:qrscan_example/Screens/LoginScreen.dart';
import 'package:shared_preferences/shared_preferences.dart';

final String geturl =
    'https://senior.fastntech.com:443/api/mobile/queue/allOccupancy';
final String getQRCheck = 'https://senior.fastntech.com:443/api/mobile/qr';
final String enterQueueURL =
    'https://senior.fastntech.com:443/api/mobile/queue/';

// final Map<String, String> tokenData = {
//   'authentication': '',
// };

//Get Occupancy Data
Future getOccuData() async {
  final prefs = await SharedPreferences.getInstance();
  print(prefs.getString('token'));
  final res = await http.get(geturl, headers: <String, String>{
    'authentication': prefs.getString('token'),
  });
  if (res.statusCode == 200) {
    // If the server did return a 200 OK response,
    // then parse the JSON.
    List<SubscriberSeries> listA = [];
    Map<String, dynamic> user = jsonDecode(res.body.toString());
    user.forEach((key, value) {
      listA.add(SubscriberSeries(
        deskCount: key,
        avgUser: value,
      ));
    });

    return listA;
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load Occupancy Data!');
  }
}

//Enter queue
Future getQue(String str) async {
  final prefs = await SharedPreferences.getInstance();
  // tokenData.update('authentication', (value) => prefs.getString('token'));
  final res = await http.post(getQRCheck + '/' + str, headers: <String, String>{
    'authentication': prefs.getString('token'),
  });
  if (res.statusCode == 200 || res.statusCode == 401) {
    // If the server did return a 200 OK response,
    // then parse the JSON.

    var response = await http.post(enterQueueURL, headers: <String, String>{
      'authentication': prefs.getString('token'),
    });
    if (response.statusCode == 200 || response.statusCode == 400) {
      Map<String, dynamic> user = jsonDecode(response.body.toString());
      print(user['id']);
      print(user['user_id']);
      qNum = user['id'];
      await Get.toNamed('/third');
    }
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load Subpage');
  }
}

class MyApp extends StatefulWidget {
  final Data data;
  MyApp({this.data});

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Uint8List bytes = Uint8List(0);
  String qNum;
  Future futureOccu;
  List<SubscriberSeries> listB = [];
  TextEditingController _outputController;

  final TextEditingController _controller = TextEditingController();

  @override
  initState() {
    super.initState();
    this._outputController = new TextEditingController();
    futureOccu = getOccuData().then((value) => listB = value);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: Colors.grey[300],
        body: Builder(
          builder: (BuildContext context) {
            return ListView(
              children: <Widget>[
                _qrCodeWidget(this.bytes, context),
                Container(
                  color: Colors.white,
                  child: Column(
                    children: <Widget>[
                      SizedBox(height: 20),
                      SizedBox(height: 20),
                      this._buttonGroup(),
                      SizedBox(height: 70),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _qrCodeWidget(Uint8List bytes, BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(20),
      child: Card(
        elevation: 6,
        child: Column(
          children: <Widget>[
            Padding(
              padding: EdgeInsets.all(1),
              child: OccupancyChart(data: listB),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buttonGroup() {
    return Row(
      children: <Widget>[
        Expanded(
          flex: 1,
          child: SizedBox(
            height: 120,
            child: InkWell(
              onTap: _scan,
              child: Card(
                child: Column(
                  children: <Widget>[
                    Expanded(
                      flex: 2,
                      child: Image.asset('images/scanner.png'),
                    ),
                    Divider(height: 20),
                    Expanded(flex: 1, child: Text('Scan')),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future _scan() async {
    String barcode = await scanner.scan();
    if (barcode == null) {
      print('nothing return.');
    } else {
      getQue(barcode).then((value) => null);
      //call /queue/{code}
    }
  }
}
