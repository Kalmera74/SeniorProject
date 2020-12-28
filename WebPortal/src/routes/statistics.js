import React from "react";
import Header from "../components/Header";
import Overlay from "../components/Overlay";
import { getUserList, parseAllUserData } from "../javascript/api";
import { Row, Col, Card, message, Skeleton } from "antd";

import { Doughnut, Bar, Pie, HorizontalBar } from "react-chartjs-2";

const bgColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#75daad",
  "#00a8cc",
  "#00a8cc",
  "#00a8cc",
  "#00a8cc",
  "#00a8cc",
  "#00a8cc",
  "#00a8cc",
  "#00a8cc"
];
const bgColorsHover = "#f5e942";

const DisplayCard = ({ children, title }) => {
  return (
    <Card style={{ width: "auto", margin: "10px" }} title={title} hoverable>
      {children}
    </Card>
  );
};

const findOccurence = (data, key) => {
  const occ = data.reduce(function(sums, entry) {
    sums[entry[key]] = (sums[entry[key]] || 0) + 1;
    return sums;
  }, {});
  return occ;
};

const findAgeOccurence = (data, key) => {
  const occ = data.reduce(function(sums, entry) {
    const age = entry[key];
    const ageRange = age - (age % 10);
    sums[ageRange] = (sums[ageRange] || 0) + 1;
    return sums;
  }, {});
  return occ;
};

const findTop = (data, topNum, displayOther, shuffle) => {
  const findSumFuc = (total, num) => {
    return total + num;
  };
  const sum = Object.values(data).reduce(findSumFuc);
  let keysSorted = Object.keys(data).sort((a, b) => {
    return data[b] - data[a];
  });
  keysSorted = keysSorted.slice(0, topNum);
  if (shuffle) {
    console.log(keysSorted);
    keysSorted = keysSorted.sort(function() {
      return 0.5 - Math.random();
    });
    console.log(keysSorted);
  }
  let topData = {};
  keysSorted.forEach(element => {
    topData[element] = data[element];
  });
  if (displayOther) {
    const rest = sum - Object.values(topData).reduce(findSumFuc);
    topData.other = rest;
  }
  return topData;
};

class StatisticsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patients: null
    };
  }

  async componentDidMount() {
    let json = await getUserList(message);
    json = parseAllUserData(json);

    this.setState({
      patients: json
    });
  }

  GenderChart = () => {
    const occ = findOccurence(this.state.patients, "gender");
    console.log(occ);
    const data = {
      labels: Object.keys(occ),
      datasets: [
        {
          data: Object.values(occ),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColorsHover
        }
      ]
    };
    console.log(occ);
    return <Doughnut data={data} />;
  };

  CityChart = () => {
    const occ = findTop(findOccurence(this.state.patients, "city"), 5, false, true);
    console.log(occ);
    const data = {
      labels: Object.keys(occ),
      datasets: [
        {
          data: Object.values(occ),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColorsHover,
          label: "City"
        }
      ]
    };
    console.log(occ);
    return <Pie data={data} />;
  };

  LanguageChart = () => {
    const occ = findTop(findOccurence(this.state.patients, "language"), 5, true);
    console.log(occ);
    const data = {
      labels: Object.keys(occ),
      datasets: [
        {
          data: Object.values(occ),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColorsHover,
          label: "Number of People"
        }
      ]
    };
    console.log(occ);
    return <Bar data={data} />;
  };

  AgeChart = () => {
    const occ = findTop(findAgeOccurence(this.state.patients, "age"), 10, true);
    console.log(occ);
    const data = {
      labels: Object.keys(occ),
      datasets: [
        {
          data: Object.values(occ),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColorsHover,
          label: "Number of people"
        }
      ]
    };
    console.log(occ);
    return <Bar data={data} />;
  };

  StatusChart = () => {
    const occ = findOccurence(this.state.patients, "maritalStatus");
    console.log(occ);
    const data = {
      labels: Object.keys(occ),
      datasets: [
        {
          data: Object.values(occ),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColorsHover,
          label: "Number of people"
        }
      ]
    };
    console.log(occ);
    return <HorizontalBar data={data} />;
  };

  MonthChart = () => {
    const occ = findOccurence(this.state.patients, "birthMonth");
    console.log(occ);
    const data = {
      labels: Object.keys(occ),
      datasets: [
        {
          data: Object.values(occ),
          backgroundColor: bgColors,
          hoverBackgroundColor: bgColorsHover,
          label: "Number of people"
        }
      ]
    };
    console.log(occ);
    return <Bar data={data} />;
  };

  render() {
    return (
      <div>
        <Overlay show={!this.state.patients}></Overlay>
        <Header title="Statistics"></Header>
        {this.state.patients ? (
          <div>
            <Row className="statPadding">
              {/* <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <DisplayCard children={this.GenderChart()} title="Gender"></DisplayCard>
              </Col> */}
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <DisplayCard children={this.AgeChart()} title="Age Groups"></DisplayCard>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <DisplayCard children={this.CityChart()} title="Desks' Occupancy"></DisplayCard>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <DisplayCard children={this.LanguageChart()} title="Weekly Statistics"></DisplayCard>
              </Col>
              {/* <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <DisplayCard
                  children={this.StatusChart()}
                  title="Rejected Desks"
                ></DisplayCard>
              </Col> */}
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <DisplayCard children={this.MonthChart()} title="Montly Statistics"></DisplayCard>
              </Col>
              
            </Row>
          </div>
        ) : (
          <div className="statPadding">
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        )}
      </div>
    );
  }
}

export default StatisticsPage;
