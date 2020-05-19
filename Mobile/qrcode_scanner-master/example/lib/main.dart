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

Future<Occupancy> fetchOccuData() async {
  final response = await http
      .get('http://127.0.0.1:5000/', headers: {'Accept': 'application/json'});
  if (response.statusCode == 200) {
    // If the server did return a 200 OK response,
    // then parse the JSON.
    //Use compute function to run parseOccupancy in a seperate isolate
    return Occupancy.fromJson(json.decode(response.body));
  } else {
    // If the server did not return a 200 OK response,
    // then throw an exception.
    throw Exception('Failed to load Occupancy data');
  }
}

class Occupancy {
  final String dayName;
  final int occupancyRate;

  Occupancy({
    @required this.dayName,
    @required this.occupancyRate,
  });
  factory Occupancy.fromJson(Map<String, dynamic> json) => Occupancy(
        dayName: json['dayName'] as String,
        occupancyRate: json['occupancyRate'] as int,
      );
  Map<String, dynamic> toJson() => {
        "dayName": dayName,
        "occupancyRate": occupancyRate,
      };
}

//Sending the decrypted QR code to webservice to become authenticated
Future<QR> sendData(String title) async {
  final http.Response response = await http.post(
    'http://127.0.0.1:5000/', //add webservice url here
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'title': title,
    }),
  );
  if (response.statusCode == 201) {
    // If the server did return a 201 CREATED response,
    // then parse the JSON.
    return QR.fromJson(json.decode(response.body));
  } else {
    // If the server did not return a 201 CREATED response,
    // then throw an exception.
    throw Exception('Failed to load album');
  }
}

class QR {
  final String title;

  QR({this.title});

  factory QR.fromJson(Map<String, dynamic> json) {
    return QR(
      title: json['title'],
    );
  }
}

void main() => runApp(MyApp());

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

/*List<Occupancy> modelUserFromJson(String str) =>
    List<Occupancy>.from(json.decode(str).map((x) => Occupancy.fromJson(x)));
String modelUserToJson(List<Occupancy> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));
*/

class SecondRoute extends StatelessWidget {
  Future<Occupancy> futureOccu;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Fetch data example"),
      ),
      body: Center(
        child: FutureBuilder<Occupancy>(
          future: futureOccu,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              return Text(snapshot.data.dayName);
            } else if (snapshot.hasError) {
              return Text("${snapshot.error}");
            }

            // By default, show a loading spinner.
            return CircularProgressIndicator();
          },
        ),
      ),
    );
  }
}

class _MyAppState extends State<MyApp> {
  Uint8List bytes = Uint8List(0);
  TextEditingController _outputController;
  Future<Occupancy> futureOccu;

  final TextEditingController _controller = TextEditingController();
  Future<QR> _futureAlbum;

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
    futureOccu = fetchOccuData();
    this._outputController = new TextEditingController();
  }

  // A function that converts a response body into a List<Photo>.
  // List<Occupancy> parseOccupancy(String responseBody) {
  //   final parsed = json.decode(responseBody).cast<Map<String, dynamic>>();
  //   print(parsed);
  //   return parsed.map<Occupancy>((json) => Occupancy.fromJson(json)).toList();
  // }

  Future fetchQueueData() async {
    final res = await http
        .get("http://127.0.0.1:5000/", // add getqueue statistics url here
            headers: {'Accept': 'application/json'});
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
              child: OccupancyChart(data: data),
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
      setState(() {
        _futureAlbum = sendData(_outputController.text);
      });
      //this._outputController.text = barcode;
    }
  }
}
