import React from "react";
import UsersListDisplay from "../components/UsersListDisplay";
import { getUserList } from "../javascript/api";
import Header from "../components/Header";
import Overlay from "../components/Overlay";
import FormDialog from "../components/FormDialog";
import { message, Button } from "antd";

const moment = require("moment");

class PortalUsersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      awaitingData: true,
      users: null,
      page: 0
    };
  }

  async componentDidMount() {
    let json = await getUserList(message);

    this.setState({
      awaitingData: false,
      users: json
    });
  }

  render() {
    let userData = this.state.users;
    if (this.props.filter && this.state.users) {
      userData = doFilter(this.state.users, this.props.filter);
      if (userData.length > 0) {
        message.success({ content: `Found ${userData.length} matching records`, duration: 3 });
      } else {
        message.warn({ content: `No records found`, duration: 3 });
      }
    }
    return (
      <div>
        <Overlay show={this.state.awaitingData}></Overlay>
        {!this.props.filter && <Header title="Portal Users List"></Header>}
          <FormDialog></FormDialog>
        <UsersListDisplay users={userData} loading={this.state.awaitingData} />
      </div>
    );
  }
}

function recursiveFind(obj, value, exact) {
  let json = JSON.stringify(obj);
  const regex = exact
    ? new RegExp('"' + value.toLowerCase() + '"', "g")
    : new RegExp(".*" + value.toLowerCase() + ".*", "g");
  return json.toLowerCase().search(regex) !== -1;
}

function doFilter(users, filter) {
  let result = [];
  for (let user of users) {
    let data = user.resource;
    let match = [];
    if (filter.name) {
      match.push(recursiveFind(data.name, filter.name, filter.exactMatch));
    }
    if (filter.birthdate) {
      let isWithIn =
        filter.birthdate[0] <= moment(data.birthDate) &&
        moment(data.birthDate) <= filter.birthdate[1];
      match.push(isWithIn);
    }
    if (filter.gender) {
      match.push(data.gender === filter.gender);
    }
    if (filter.phone) {
      match.push(recursiveFind(data.telecom, filter.phone, filter.exactMatch));
    }
    if (filter.address) {
      match.push(recursiveFind(data.address, filter.address, filter.exactMatch));
    }
    if (filter.maritalStatus) {
      match.push(recursiveFind(data.maritalStatus, filter.maritalStatus, filter.exactMatch));
    }
    if (filter.id) {
      match.push(recursiveFind(data.id, filter.id, filter.exactMatch));
    }
    if (filter.anythingElse) {
      match.push(recursiveFind(data, filter.anythingElse, filter.exactMatch));
    }

    // result
    if (match.every(x => x === true)) {
      result.push(user);
    }
  }
  console.log(result);
  return result;
}

export default PortalUsersPage;
