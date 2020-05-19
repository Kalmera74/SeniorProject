import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/foundation.dart';

class SubscriberSeries {
  final String dayName;
  final int occupancyRate;

  SubscriberSeries({
    @required this.dayName,
    @required this.occupancyRate,
  });
}
