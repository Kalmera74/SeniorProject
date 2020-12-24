import React, { Component } from "react";
import { Card } from "antd";
import { GlobalContext } from "../components/GlobalContext";

class UserCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }

  static contextType = GlobalContext;

  render() {
    const { userData, loading } = this.props;

    const name = userData && userData.name[0].family + " " + userData.name[0].given[0];

    return (
      <Card
        title={userData ? name : "Loading..."}
        onClick={this.props.viewUser}
        extra={
          <a disabled={loading} onClick={this.props.viewUser}>
            View Detail
          </a>
        }
        style={{ width: this.context.isMobile ? "100%" : "auto", margin: "5px" }}
        loading={loading}
        hoverable
      >
        {userData && (
          <div>
            <p>{userData.id}</p>
            <p>{userData.birthDate}</p>
            <p>{userData.phone}</p>
          </div>
        )}
      </Card>
    );
  }
}

export default UserCard;
