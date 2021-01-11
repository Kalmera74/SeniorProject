// This example shows a [Form] with one [TextFormField] to enter an email
// address and an [ElevatedButton] to submit the form. A [GlobalKey] is used here
// to identify the [Form] and validate input.
//
// ![](https://flutter.github.io/assets-for-api-docs/assets/widgets/form.png)

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:qrscan_example/Screens/QueueScreen.dart';
import 'package:qrscan_example/UI/ProgressHUD.dart';
import 'package:qrscan_example/api/api_service.dart';
import 'package:qrscan_example/main.dart';
import 'package:qrscan_example/model/login_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Data {
  String key;
  String token;

  Data({@required this.key, @required this.token});
}

/// This is the main application widget.
class LoginPage extends StatelessWidget {
  static const String _title = 'Login Page';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: _title,
      home: Scaffold(
        appBar: AppBar(title: const Text(_title)),
        body: MyStatefulWidget(),
      ),
    );
  }
}

/// This is the stateful widget that the main application instantiates.
class MyStatefulWidget extends StatefulWidget {
  MyStatefulWidget({Key key}) : super(key: key);

  @override
  _MyStatefulWidgetState createState() => _MyStatefulWidgetState();
}

/// This is the private State class that goes with MyStatefulWidget.
class _MyStatefulWidgetState extends State<MyStatefulWidget> {
  final GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  LoginRequestModel requestModel;
  bool isApiCallProcess = false;
  bool isLoggedIn = false;
  String savedToken = '';
  TextEditingController tokenController = TextEditingController();
  TextEditingController tcController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  String userTC = '';
  String passwd = '';

  @override
  void initState() {
    super.initState();
    requestModel = LoginRequestModel();
    autoLogIn();
    autoGetToken();
  }

  void autoGetToken() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String tokenSave = prefs.getString('token');
    if (tokenSave != null) {
      setState(() {
        savedToken = tokenSave;
      });
    }
    return;
  }

  Future<int> getToken(String token) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('token', token);
    setState(() {
      savedToken = token;
      isLoggedIn = true;
    });
    // tokenController.clear();
    return 0;
  }

  void autoLogIn() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String tckn = prefs.getString('TCKN');
    final String password = prefs.getString('Password');

    if (tckn != null) {
      setState(() {
        isLoggedIn = true;
        userTC = tckn;
        passwd = password;
      });
    }
  }

  Future<Null> loginUser() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('TCKN', tcController.text);
    prefs.setString('Password', passwordController.text);
    setState(() {
      userTC = tcController.text;
      passwd = passwordController.text;
      isLoggedIn = true;
    });
    tcController.clear();
    passwordController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return ProgressHUD(
      child: _uiSetup(context),
      inAsyncCall: isApiCallProcess,
      opacity: 0.3,
    );
  }

  @override
  Widget _uiSetup(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          TextFormField(
            maxLength: 11,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onSaved: (input) => requestModel.nationID = input,
            controller: tcController,
            decoration: const InputDecoration(
              icon: Icon(Icons.person),
              hintText: 'Enter your TCKN',
            ),
            validator: (value) {
              if (value.isEmpty) {
                return 'Please enter your TC!';
              }
              return null;
            },
          ),
          TextFormField(
            obscureText: true,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onSaved: (input) => requestModel.password = input,
            controller: passwordController,
            decoration: const InputDecoration(
              icon: Icon(Icons.lock),
              hintText: 'Enter your password',
            ),
            validator: (value) {
              if (value.isEmpty) {
                return 'Please enter your password';
              }
              return null;
            },
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Center(
              child: RaisedButton(
                onPressed: () {
                  // Validate will return true if the form is valid, or false if
                  // the form is invalid.
                  if (validateAndSave()) {
                    print(requestModel.toJson());
                    setState(() {
                      isApiCallProcess = true;
                    });
                    APIService apiService = new APIService();
                    apiService.login(requestModel).then((value) {
                      setState(() {
                        isApiCallProcess = false;
                      });
                      if (value.token.isNotEmpty) {
                        tokenController.text = value.token.toString();

                        final tokenData = Data(
                            key: 'authentication', token: tokenController.text);
                        final Map<String, String> tokenData2 = {
                          'authentication': tokenController.text,
                        };
                        print(tokenController.text);
                        if (!isLoggedIn) {
                          loginUser();
                        }
                        getToken(value.token);
                        Get.toNamed('/second');
                      } else {
                        final snackBar = SnackBar(
                          content: Text(value.error),
                        );
                      }
                    });
                  }
                },
                child: Text('Login'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  bool validateAndSave() {
    final form = _formKey.currentState;
    if (form.validate()) {
      form.save();
      return true;
    }
    return false;
  }
}
