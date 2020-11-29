import React, { Component } from "react";
import { Table, Skeleton } from "antd";
import { parseAllUserData } from "../javascript/api";
import { Popconfirm } from "antd";

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: null
    };
  }

  updateUsers = () => {
    if (this.props.userData != null && this.props.userData[0] != null) {
      this.setState({
        tableData: this.updateUserArray(this.props.userData)
      });
    }
  };

  componentDidUpdate = lastProp => {
    // console.log(lastProp, this.props, this.state);
    if (lastProp !== this.props) this.updateUsers();
  };

  componentDidMount = prop => {
    this.updateUsers();
  };

  updateUserArray = users => {
    return parseAllUserData(users);
  };

  render() {
    const { loading } = this.props;

    if (loading) {
      return (
        <div style={{ padding: "30px" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      );
    }

    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        width: 180,
        sorter: (a, b) => a.name.localeCompare(b.name),
        fixed: "left"
      },
      {
        title: "Observation",
        dataIndex: "raw",
        key: "raw",
        width: 120,
        render: obj => (
          <a
            onClick={() => {
              this.props.viewUser(obj);
            }}
          >
            View Detail
          </a>
        ),
        fixed: ""
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        ellipsis: true,
        width: 330,
        sorter: (a, b) => a.id.localeCompare(b.id)
      },
      {
        title: "Gender",
        dataIndex: "gender",
        key: "gender",
        ellipsis: true,
        width: 100,
        sorter: (a, b) => a.gender.localeCompare(b.gender)
      },
      {
        title: "Brith Date",
        dataIndex: "birthDate",
        key: "birthDate",
        ellipsis: true,
        width: 150,
        sorter: (a, b) => a.birthDate.localeCompare(b.birthDate)
      },
      {
        title: "Age",
        dataIndex: "age",
        key: "age",
        ellipsis: true,
        width: 100,
        sorter: (a, b) => a.age - b.age
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        ellipsis: true,
        width: 150,
        sorter: (a, b) => a.phone.localeCompare(b.phone)
      },
      {
        title: "Manage",
        dataIndex: "raw",
        key: "raw",
        width: 120,
        render: obj => (
          <a
            // onClick={() => {
            //   this.props.viewUser(obj);
            // }}
          >
            <Popconfirm
                  placement="bottomRight"
                  title="Would you like to remove the user from the system?"
                  onConfirm={this.confirmLogout}
                  okText="Remove"
                  cancelText="Cancel"
            >
              Remove  
            </Popconfirm>
          </a>
          
        ),
        fixed: ""
      },
    ];

    return (
      <Table
        columns={columns}
        pagination={{ showSizeChanger: true }}
        dataSource={this.state.tableData}
        rowKey="id"
      />
    );
  }
}

export default UserTable;
