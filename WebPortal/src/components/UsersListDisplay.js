import React from "react";
import UserCard from "./UserCard";
import UserTable from "./UserTable";
import ObservationDrawer from "./ObservationDrawer";
import { Layout, Pagination, Row, Col, Result } from "antd";
import { GlobalContext } from "../components/GlobalContext";

const { Content } = Layout;

class UsersListDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersDummy: [null, null, null, null, null, null, null, null, null],
      page: props.page ? props.page : 0,
      itemPerPage: 9,
      showDrawer: false,
      currentSelectedUser: null
    };
  }

  static contextType = GlobalContext;

  viewUserDrawer = user => {
    this.setState({
      showDrawer: true,
      currentSelectedUser: user
    });
  };

  render() {
    let users = this.props.users ? this.props.users : this.state.usersDummy;

    let layout;

    if (this.context.viewInCard) {
      let startIdx = this.state.page * this.state.itemPerPage;

      let pagination = (
        <Pagination
          style={{ textAlign: "center" }}
          disabled={this.props.loading}
          defaultCurrent={1}
          defaultPageSize={this.state.itemPerPage}
          current={this.state.page + 1}
          total={users && users.length > 1 ? users.length : 0}
          onChange={page => {
            this.setState({
              page: page - 1
            });
          }}
        />
      );

      let keyCounter = 0;

      // -------------------- card view
      let cardListItems = users
        .slice(startIdx, startIdx + this.state.itemPerPage)
        .map(user => (
          <Col xs={23} sm={23} md={12} lg={8} style={{ padding: "10px" }} key={keyCounter++}>
            <UserCard
              userData={user && user.resource}
              loading={this.props.loading}
              viewUser={() => {
                this.viewUserDrawer(user);
              }}
            ></UserCard>
          </Col>
        ));

      const cardLayout = (
        <div>
          <Content
            style={{
              margin: "0px 16px"
            }}
          >
            <Row>{cardListItems}</Row>
          </Content>
          {pagination}
        </div>
      );
      layout = cardLayout;
    } else {
      // ---------------------------- Table view
      const tableLayout = (
        <UserTable
          loading={this.props.loading}
          userData={users}
          viewUser={user => {
            console.log(user);
            this.viewUserDrawer(user);
          }}
        ></UserTable>
      );
      layout = tableLayout;
    }
    return (
      <div>
        {users.length > 0 ? (
          <div>
            {layout}

            <ObservationDrawer
              user={this.state.currentSelectedUser}
              visible={this.state.showDrawer}
              onClose={() => {
                this.setState({
                  currentSelectedUser: null,
                  showDrawer: false
                });
              }}
            ></ObservationDrawer>
          </div>
        ) : (
          <Result title="No search result to display" subTitle="You can try a different keyword" />
        )}
      </div>
    );
  }
}

export default UsersListDisplay;
