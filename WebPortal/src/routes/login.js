import React from "react";
import "./login.css"
import Header from "../components/Header";

import login from "../javascript/api";

class LoginPage extends React.Component {
    render() {
        return (
            <div>
                <Header title="Login"></Header>
                <div className="base-container">
                    <div className="content">
                        <div className="form">
                            <div className="form-group">
                                <label htmlFor="id">ID</label>
                                <input type="text" name="id"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" name="password"/>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <button type="button" className="btn" onClick={login()}>Login</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;