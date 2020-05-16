import React from "react";
import loginImg from "../../login.svg";

export class Login extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className="base-container">
            <div className="header">Web Portal</div>
            <div className="content">
                <div className="image">
                    <img src={loginImg}/>
                </div>
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
                <button type="button" className="btn">Login</button>
            </div>
        </div>
    }
}