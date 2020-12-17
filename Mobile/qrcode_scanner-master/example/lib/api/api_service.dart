import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:qrscan_example/model/login_model.dart';

class APIService {
  Future<LoginResponseModel> login(LoginRequestModel loginRequestModel) async {
    String url = 'https://senior.fastntech.com/login';

    final response = await http.post(url, body: loginRequestModel.toJson());
    if (response.statusCode == 200 || response.statusCode == 400) {
      return LoginResponseModel.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load Data!');
    }
  }
}
