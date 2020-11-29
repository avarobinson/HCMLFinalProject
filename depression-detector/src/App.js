import React, { useState, useEffect, Component } from 'react';
import './App.css';
import { Form, Col, Container, Row, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';
import "./index.css";
import Table from './components/TableComponent';

// Import React Table
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userTweets: "",
      userResults: "",
      userPercentage: "",
      resultTable: [],
      formData: {
        username: '',
        timeframe: 'pastweek',
      }
    };
  }

  // //d3 example
  // componentDidMount() {
  //   let size = 500;
  //   let svg = d3.select(this.myRef.current)
  //     .append('svg')
  //     .attr('width', size)
  //     .attr('height', size);
  //   let rect_width = 95;
  //   svg.selectAll('rect')
  //     .data(this.dataset)
  //     .enter()
  //     .append('rect')
  //     .attr('x', (d, i) => 5 + i * (rect_width + 5))
  //     .attr('y', d => size - d)
  //     .attr('width', rect_width)
  //     .attr('height', d => d)
  //     .attr('fill', 'teal');
  // }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    var formData = this.state.formData;
    formData[name] = value;
    this.setState({
      formData
    });
  }

  sendData = () => {
    const formData = this.state.formData;
    this.setState({ userTweets: "", userResults: "", userPercentage: "", resultTable: [] });
    fetch('/api/v1', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(formData)
    }
    ).then(res => res.json()).then(data => {
      this.setState({ userTweets: data.tweets, userResults: data.results, userPercentage: data.percentage, resultTable: data.table });

    });

  };


  getFormData = (data) => {
    this.setState({ formData: data })
  }

  render() {
    const formData = this.state.formData;

    // const userTweets = this.state.userTweets;
    // const userResults = this.state.userResults;
    const userPercentage = this.state.userPercentage;

    const resultTable = this.state.resultTable;
    return (
      <Container>
        <div>
          <h1 className="title">Detecting Depression via Twitter</h1>
        </div>
        <div className="content">
          <Form>
            <Form.Group>
              <Form.Label>Twitter Handle</Form.Label>
              <Form.Control type="text" placeholder="enter twitter handle" required name="username" value={formData.username} onChange={this.handleChange} />
              <Form.Control.Feedback type="invalid">
                Please provide a valid twitter handle.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Timeframe</Form.Label>
              <Form.Control as="select" value={formData.timeframe} name="timeframe" onChange={this.handleChange}>
                <option>past week </option>
                <option>past month</option>
                <option>past year </option>
                <option>all time</option>
              </Form.Control>
            </Form.Group>
          </Form>

          <Row>
            <Col>
              <Button block onClick={this.sendData}>
                Predict
                    </Button>
            </Col>
            <Col>
              <Button block onClick={this.resetData}>
                Reset
                  </Button>
            </Col>
          </Row>
          {/* <p>User's tweets: {userTweets}.</p>
          <p> User's result: {userResults}</p> */}
          <p> User's risk percentage: {userPercentage}</p>

          <Table data={resultTable} />

        </div>
      </Container>
    );
  }
}

export default App;
