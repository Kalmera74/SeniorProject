import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:qrscan/qrscan.dart' as scanner;
import 'package:http/http.dart' as http;
import 'package:qrscan_example/occupancy_chart.dart';
import 'package:qrscan_example/subscriber_series.dart';
import 'package:qrscan_example/HomePage.dart';

final String geturl = 'http://192.168.1.104:5000/';
final String getQuePoint = 'http://192.168.1.104:5000/queue/';
//Get Occupancy Data
Future getOccuData() async {
  final res = await http.get(geturl);
  if (res.statusCode == 200) {
    // If the server did return a 200 OK response,
    // then parse the JSON.
    List<SubscriberSeries> listA = [];
    Map<String, dynamic> user = jsonDecode(res.body.toString());
    user.forEach((key, value) {
      listA.add(SubscriberSeries(
        dayName: key,
        occupancyRate: value,
      ));
    });

    return listA;
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load album');
  }
}

Future getQue(String str) async {
  final res = await http.get(getQuePoint + str);
  if (res.statusCode == 200) {
    // If the server did return a 200 OK response,
    // then parse the JSON.

    Map<String, dynamic> user = jsonDecode(res.body.toString());
    if (user['response'] == true) {}
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load album');
  }
}

void main() => runApp(MyApp());

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Uint8List bytes = Uint8List(0);
  TextEditingController _outputController;
  Future futureOccu;
  List<SubscriberSeries> listB = [];

  final TextEditingController _controller = TextEditingController();

  final List<SubscriberSeries> data = [
    SubscriberSeries(
      dayName: "Monday",
      occupancyRate: 30,
    ),
    SubscriberSeries(
      dayName: "Tuesday",
      occupancyRate: 40,
    ),
    SubscriberSeries(
      dayName: "Wednesday",
      occupancyRate: 20,
    ),
    SubscriberSeries(
      dayName: "Thursday",
      occupancyRate: 50,
    ),
    SubscriberSeries(
      dayName: "Friday",
      occupancyRate: 80,
    ),
    SubscriberSeries(
      dayName: "Saturday",
      occupancyRate: 30,
    ),
    SubscriberSeries(
      dayName: "Sunday",
      occupancyRate: 0,
    ),
  ];

  @override
  initState() {
    super.initState();
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
