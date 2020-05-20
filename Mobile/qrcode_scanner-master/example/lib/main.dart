import 'dart:async';
import 'dart:convert';

import 'dart:typed_data';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:qrscan/qrscan.dart' as scanner;
import 'package:http/http.dart' as http;
import 'package:qrscan_example/occupancy_chart.dart';
import 'package:qrscan_example/subscriber_series.dart';
import 'package:qrscan_example/HomePage.dart';
import 'package:get/get.dart';

final String geturl = 'http://34.71.187.226:5000/api/v0.1.0/queue/stats/time';
final String getQuePoint = 'http://34.71.187.226:5000/api/v0.1.0/queue/';
final String getQueStat =
    'http://34.71.187.226:5000/api/v0.1.0/queue/stats/length/';

String qNum;
String t, l, k;
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
  final res = await http.post(getQuePoint + str);
  if (res.statusCode == 201) {
    // If the server did return a 200 OK response,
    // then parse the JSON.

    Map<String, dynamic> user = jsonDecode(res.body.toString());
    //2. sayfaya geç
    qNum = str;
    // getQueStatFunc(str);
    print(
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    await Get.to(SubPage());
    print(
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load album');
  }
}

Future getQueStatFunc(String str) async {
  final res = await http.get(getQueStat + str);
  if (res.statusCode == 200) {
    // If the server did return a 200 OK response,
    // then parse the JSON.

    Map<String, dynamic> user = jsonDecode(res.body.toString());
    // SubPage().
    t = user['t'].toString();
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load album');
  }
}

void main() => runApp(GetMaterialApp(home: MyApp()));

class MyApp extends StatefulWidget {
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

class SubPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    getQueStatFunc(qNum);
    print(t);
    return Scaffold(
      appBar: AppBar(
        title: Text('Sub Page'),
        backgroundColor: Colors.redAccent,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(t),
            RaisedButton(
              textColor: Colors.white,
              color: Colors.redAccent,
              child: Text('Back to Main Page'),
              onPressed: () {
                // TODO
              },
            )
          ],
        ),
      ),
    );
  }

  @override
  State<StatefulWidget> createState() {
    // TODO: implement createState
    throw UnimplementedError();
  }
}
