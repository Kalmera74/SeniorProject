import React, { useState } from "react";
import { Form, Row, Col, Input, Button, DatePicker, Checkbox, Tooltip } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { GlobalContext } from "../components/GlobalContext";

const SearchForm = props => {
  const [expand, setExpand] = useState(false);
  const [form] = Form.useForm();

  const context = React.useContext(GlobalContext);

  const onFinish = values => {
    props.searchRequest(values);
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      className="ant-advanced-search-form"
      onFinish={onFinish}
    >
      <Row gutter={24}>
      <Col xs={24} sm={24} md={12} lg={8} className="search_inputs" key={7}>
              <Form.Item name={`id`} label={`User ID`}>
                <Input placeholder="Enter User ID to filter" />
              </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8} className="search_inputs" key={1}>
          <Form.Item name={`name`} label={`User Name`}>
            <Input placeholder="Enter User's first or last name to filter" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8} className="search_inputs" key={2}>
          <Form.Item name="birthdate" label="Date Used">
            <DatePicker />
          </Form.Item>
        </Col>
        

        {expand && (
          <React.Fragment>
            <Col xs={24} sm={24} md={23} lg={16} span={16} key={8}>
              <Form.Item name={"anythingElse"} label="Search for anything else">
                <Input.TextArea placeholder="Just type anything you would like to search. Regular expression is supported." />
              </Form.Item>
            </Col>
          </React.Fragment>
        )}
      </Row>

      <Row>
        <Col
          xs={24}
          sm={8}
          md={8}
          lg={8}
          span={8}
          style={{
            textAlign: context.isMobile ? "center" : "left"
          }}
        >
          <Form.Item name={`exactMatch`} valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox checked>
              <Tooltip
                placement={context.isMobile ? "top" : "right"}
                title="Match the exact content from the search query"
              >
                Exact Match
              </Tooltip>
            </Checkbox>
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={16}
          md={16}
          lg={16}
          span={16}
          style={{
            textAlign: context.isMobile ? "center" : "right"
          }}
        >
          <a
            style={{
              marginRight: 12,
              fontSize: 12
            }}
            onClick={() => {
              setExpand(!expand);
            }}
          >
            {expand ? <UpOutlined /> : <DownOutlined />} Search More
          </a>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
          <Button
            style={{
              marginLeft: 8
            }}
            onClick={() => {
              form.resetFields();
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchForm;
