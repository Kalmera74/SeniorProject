import 'dart:convert';

List<User> modelUserFromJson(String str) =>
    List<User>.from(json.decode(str).map((x) => User.fromJson(x)));

String modelUserToJson(List<User> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class User {
  String dayName;
  int occupancyRate;

  User({this.dayName, this.occupancyRate});

  factory User.fromJson(Map<String, dynamic> json) => User(
        dayName: json["dayName"],
        occupancyRate: json["occupancyRate"],
      );
  Map<String, dynamic> toJson() => {
        "dayName": dayName,
        "occupancyRate": occupancyRate,
      };
}
