import React from "react";
import DeskTable from "./DeskTable";
import ObservationDrawer from "./ObservationDrawer";
import { Layout, Pagination, Row, Col, Result } from "antd";
import { GlobalContext } from "../components/GlobalContext";

const { Content } = Layout;

class DesksListDisplay extends React.Component {
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

      
    } else {
      // ---------------------------- Table view
      const tableLayout = (
        <DeskTable
          loading={this.props.loading}
          userData={users}
          viewUser={user => {
            console.log(user);
            this.viewUserDrawer(user);
          }}
        ></DeskTable>
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

export default DesksListDisplay;
