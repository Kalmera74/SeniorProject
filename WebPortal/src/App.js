import React from "react";
import "./App.css";
import "antd/dist/antd.css";
import LoginPage from "./routes/login";
import UserPage from "./routes/users";
import PortalUserPage from "./routes/portalUsers";
import SearchPage from "./routes/search";
import StatisticsPage from "./routes/statistics";
import DesksPage from "./routes/desks";
import NotFoundPage from "./routes/NotFoundPage";
import HomePage from "./routes/home";
import SideMenu from "./components/SideMenu";
import MobileTabBar from "./components/MobileTabBar";

import logo from "./img/dashboard-logo.png";
import profile from "./img/icon_user.png";

import { CaretDownOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { BrowserRouter as Router, Switch, Route, useLocation, Link } from "react-router-dom";
import { Layout, Avatar, Popconfirm, Radio, Tooltip, Modal, message } from "antd";
import GlobalContextConsumer from "./components/GlobalContext";
import { GlobalContext, GlobalContextProvider } from "./components/GlobalContext";

import getUsers from "./javascript/api";

const { Header, Sider } = Layout;

class DesktopMenu extends React.Component {
  state = {
    collapsed: false
  };

  updateCollapsed = collapsed => {
    this.setState({
      collapsed: collapsed
    });
  };

  componentDidMount() {
    message.config({
      top: 80
    });
    getUsers();
  }

  render() {
    return (
      <Sider
        collapsible
        onCollapse={this.updateCollapsed}
        breakpoint="lg"
        width="230"
        style={{
          boxShadow: "7px 0px 20px -10px rgba(0,0,0,0.35)",
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0
        }}
      >
          <div
            className="logo"
            style={{
              background: `url("${this.state.collapsed ? logo : logo}") no-repeat`
            }}
          ></div>
        <SideMenu></SideMenu>
        <div style={{ flexGrow: 1 }}></div>
      </Sider>
    );
  }
}

const routes = [
  {
    path: "/",
    exact: true,
    title: () => "Login",
    main: () => <LoginPage />
  },
  {
    path: "/users",
    title: () => "Users",
    main: () => <UserPage />
  },
  {
    path: "/portalUsers",
    title: () => "Portal Users",
    main: () => <PortalUserPage />
  },
  {
    path: "/search",
    title: () => "Search",
    main: () => <SearchPage />
  },
  {
    path: "/statistics",
    title: () => "Statistics",
    main: () => <StatisticsPage />
  },
  {
    path: "/desks",
    title: () => "Desks",
    main: () => <DesksPage />
  },
  {
    path: "/home",
    title: () => "Home",
    main: () => <HomePage />
  },
  {
    path: "/login",
    title: () => "Login",
    main: () => <LoginPage />
  },
  {
    title: () => "404 Not Found",
    main: () => <NotFoundPage />
  }
];

class App extends React.Component {
  constructor(props) {
    super(props);
    // login state
    this.state = {isLoggedIn: false};
  }

  static contextType = GlobalContext;

  handleViewChange = value => {
    const { setViewInCard } = this.context;
    console.log(setViewInCard, value, this.context);
    setViewInCard(value === "card");
  };

  confirmLogout = () => {
    Modal.success({
      title: "You have successfully logged out"
    });
  };

  render() {
    console.log(this.props);
    console.log(window.location.hostname);

    const basename = window.location.hostname;

    const isLoggedIn = this.state.isLoggedIn;

    return (
      <div>
        { isLoggedIn
          ? <Router basename={basename}>
          <Layout style={{ minHeight: 100 + "vh" }}>
            <GlobalContextConsumer>
              {value => {
                if (!value.isMobile) {
                  return <DesktopMenu></DesktopMenu>;
                } else {
                  return <MobileTabBar></MobileTabBar>;
                }
              }}
            </GlobalContextConsumer>

            <Layout className="site-layout">
              <Header className="site-layout-header">
                <h2 style={{ paddingLeft: 20 + "px" }}>
                  <Switch>
                    {routes.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        exact={route.exact}
                        children={<route.title />}
                      />
                    ))}
                  </Switch>
                </h2>

                <div style={{ flexGrow: 1, textAlign: "right", paddingRight: "20px" }}>
                  <GlobalContextProvider>
                    <Radio.Group
                      defaultValue="table"
                      onChange={e => {
                        console.log(e);
                        this.handleViewChange(e.target.value);
                      }}
                      size="small"
                    >
                      <Radio.Button value="table">
                        <Tooltip placement="bottom" title="View users in a table">
                          <UnorderedListOutlined />
                        </Tooltip>
                      </Radio.Button>
                      <Radio.Button value="card">
                        <Tooltip placement="bottom" title="View users in cards">
                          <AppstoreOutlined />
                        </Tooltip>
                      </Radio.Button>
                    </Radio.Group>
                  </GlobalContextProvider>
                  <Popconfirm
                    placement="bottomRight"
                    title="Would you like to logout of the system?"
                    onConfirm={this.confirmLogout}
                    okText="Logout"
                    cancelText="Cancel"
                  >
                    <Avatar
                      src={profile}
                      style={{ marginLeft: "20px", marginRight: !this.context.isMobile && "5px" }}
                    />
                    {!this.context.isMobile && <CaretDownOutlined />}
                  </Popconfirm>
                </div>
              </Header>

              <RouterContent></RouterContent>
            </Layout>
          </Layout>
        </Router>
        : <LoginPage></LoginPage>
        }
      </div>
    );
  }
}

const RouterContent = () => {
  let location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="page" timeout={300}>
        <Switch location={location}>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              children={
                <div className="container">
                  <div className="page">
                    <route.main />
                  </div>
                </div>
              }
            />
          ))}
        </Switch>
        
      </CSSTransition>
    </TransitionGroup>
  );
};

export default App;
