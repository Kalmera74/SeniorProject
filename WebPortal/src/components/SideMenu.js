import React from "react";
import { Menu } from "antd";

import { NavLink } from "react-router-dom";
import { withRouter } from "react-router-dom";

import { HomeOutlined, TeamOutlined, SearchOutlined, BarChartOutlined, DesktopOutlined } from "@ant-design/icons";

class SideMenu extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const { location } = this.props;
    return (
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["/"]}
        selectedKeys={[location.pathname]}
      >
        <Menu.Item key="/">
          <HomeOutlined />
          <span>Home</span>
          <NavLink to="/" />
        </Menu.Item>
        <Menu.Item key="/users">
          <TeamOutlined />
          <span>Users</span>
          <NavLink to="/users" />
        </Menu.Item>
        <Menu.Item key="/search">
          <SearchOutlined />
          <span>Search</span>
          <NavLink to="/search" />
        </Menu.Item>
        <Menu.Item key="/statistics">
          <BarChartOutlined />
          <span>Statistics</span>
          <NavLink to="/statistics" />
        </Menu.Item>
        <Menu.Item key="/portalUsers">
          <TeamOutlined />
          <span>Portal Users</span>
          <NavLink to="/portalUsers" />
        </Menu.Item>
        <Menu.Item key="/desks">
          <DesktopOutlined/>
          <span>Desks</span>
          <NavLink to="/desks" />
        </Menu.Item>
        {/* <Menu.Item key="/login">
          <span>Login</span>
          <NavLink to="/login" />
        </Menu.Item> */}
      </Menu>
    );
  }
}

export default withRouter(SideMenu);
