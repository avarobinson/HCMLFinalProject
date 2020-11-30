import React, { Component } from 'react';
import './App.css';
import { Form, Col, Container, Row, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';
import "./index.css";
import Table from './components/TableComponent';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValid: false,
      userTweets: "",
      userResults: "",
      userPercentage: "",
      resultTable: [],
      formData: {
        username: '',
        timeframe: 'pastweek',
      },
      errorMessage: ''
    };
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    var formData = this.state.formData;
    var formValid = this.state.formValid;
    formValid = (name === "username" && value != "") ? true : false;
    formData[name] = value;
    this.setState({
      formData,
      formValid
    });
  }

  resetData = (event) => {
    this.setState({
      formData: {
        username: '',
        timeframe: 'pastweek',
      }, userTweets: "", userResults: "", userPercentage: "", resultTable: [], errorMessage:""
    });
  }

  sendData = () => {
    const formData = this.state.formData;
    this.setState({errorMessage: ""});
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
    }).catch((error) => {
      this.setState({ errorMessage: error.message })
    });

  };

  render() {
    const formData = this.state.formData;
    const columns = [{
      Header: "Tweet Assessment Breakdown",
      columns: [
        {
          Header: "Time",
          accessor: "time"
        },
        {
          Header: "Tweet",
          accessor: "tweet",
          style: { 'whiteSpace': 'unset' }
        },
        {
          Header: "Risk",
          accessor: "risk"
        }]
    }];


    // const userTweets = this.state.userTweets;
    // const userResults = this.state.userResults;
    const userPercentage = this.state.userPercentage;
    const resultTable = this.state.resultTable;
    return (
      <Container>
        <div>
          <h2 className="title">Detecting Depression via Twitter</h2>
        </div>
        <div className="content">
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Twitter Handle</Form.Label>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control type="text" placeholder="enter twitter handle" name="username" value={formData.username} onChange={this.handleChange} />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col>

                <Form.Group>
                  <Form.Label>Timeframe</Form.Label>
                  <Form.Control as="select" value={formData.timeframe} name="timeframe" onChange={this.handleChange}>
                    <option>past week </option>
                    <option>past month</option>
                    <option>past year </option>
                    <option>all time</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </Form>

          <Row>
            <Col>
              <Button block onClick={this.sendData} disabled={!this.state.formValid}>
                Predict
                    </Button>
            </Col>
            <Col>
              <Button block onClick={this.resetData}  >
                Reset
                  </Button>
            </Col>
          </Row>

          {/* <p>User's tweets: {userTweets}.</p>
          <p> User's result: {userResults}</p> */}

          {this.state.errorMessage ? <p> Sorry, this twitter handle is invalid. Please enter a different twitter handle. </p> : userPercentage === "" ? null : (userPercentage == "-1" ? <p> Sorry, no tweets were found during this timeframe. Please select a different timeframe or twitter handle. </p> : <p> User's risk percentage: {userPercentage} %</p>)}

          {/* {this.state.errorMessage &&
            <h3 className="error"> sorry, this twitter handle is invalid </h3>} */}
        </div>
        <Table data={resultTable} columns={columns} />
      </Container>
    );
  }
}

export default App;
