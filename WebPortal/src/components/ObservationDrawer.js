import React from "react";
import { requestObservation, getObservationDemo } from "../javascript/api";
import { Drawer, Descriptions } from "antd";
//mport ReactJson from "react-json-view";

import { GlobalContext } from "../components/GlobalContext";

const keyGen = () => {
  let r = Math.random()
    .toString(36)
    .substring(7);
  return r;
};

class ObservationDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      observation: null
    };
  }

  static contextType = GlobalContext;
  //load observation
  async componentDidUpdate() {
    if (this.props.user && !this.state.observation) {
      let json;
      try {
        json = await requestObservation(this.props.user.resource.id);
      } catch (e) {
        json = getObservationDemo();
      }

      this.setState({
        loading: false,
        observation: json,
        rawDataDrawer: false,
        rawDataDrawerData: null
      });
    }
  }

  onClose = () => {
    this.setState({
      loading: true,
      observation: null
    });
    console.log(this.state);
    this.props.onClose();
  };

  onChildrenDrawerClose = () => {
    this.setState({
      rawDataDrawer: false
    });
  };

  openRawDataDrawer = data => {
    this.setState({
      rawDataDrawer: true,
      rawDataDrawerData: data
    });
  };

  render() {
    const { visible } = this.props;
    const user = this.props.user && this.props.user.resource;

    return (
      <Drawer
        title="User Observation"
        placement="right"
        closable={true}
        onClose={this.onClose}
        visible={visible}
        width={this.context.isMobile ? "100%" : "60%"}
      >
        {user && (
          <div key={keyGen()}>
            <Descriptions title="User Basic Info">
              <Descriptions.Item key={keyGen()} label="Name">
                {`${user.name[0]?.family} ${user.name[0]?.given?.[0]}`}
              </Descriptions.Item>
              <Descriptions.Item key={keyGen()} label="ID">
                {user.id}
              </Descriptions.Item>
              <Descriptions.Item key={keyGen()} label="Telephone">
                {user.telecom[0].value}
              </Descriptions.Item>
              <Descriptions.Item key={keyGen()} label="Birth Date">
                {user.birthDate}
              </Descriptions.Item>
              <Descriptions.Item key={keyGen()} label="Last Use">
                {`${user.address[0].line[0]}`}
              </Descriptions.Item>
              <Descriptions.Item key={keyGen()} label="Average Time Spent">
                {`${user.address[0].city}`}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    );
  }
}

export default ObservationDrawer;
