import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:qrscan_example/subscriber_series.dart';

class OccupancyChart extends StatelessWidget {
  final List<SubscriberSeries> data;

  OccupancyChart({@required this.data});

  @override
  Widget build(BuildContext context) {
    List<charts.Series<SubscriberSeries, String>> series = [
      charts.Series(
          id: "Occupancy",
          data: data,
          domainFn: (SubscriberSeries series, _) => series.dayName,
          measureFn: (SubscriberSeries series, _) => series.occupancyRate)
    ];

    return Container(
      height: 400,
      padding: EdgeInsets.all(20),
      child: Card(
          child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: <Widget>[
                  Text('OccupancyChart',
                      style: Theme.of(context).textTheme.bodyText2),
                  Expanded(
                    child: charts.BarChart(series, animate: true),
                  )
                ],
              ))),
    );
  }
}
