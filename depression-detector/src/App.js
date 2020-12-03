import React, { Component } from 'react';
import './App.css';
import { Form, Col, Container, Row, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import PieChart from './components/PieChartComponent';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValid: false,
      userPercentage: "",
      resultTable: [],
      formData: {
        username: '',
        timeframe: 'pastweek',
      },
      errorMessage: ''
    };
  }

  //updates form data whenever user adds their data, also does form validation
  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;

    //sets form data 
    var formData = this.state.formData;
    formData[name] = value;

    //makes sure user entered something in twitter handle (or else they can't hit submit)
    var formValid = this.state.formValid;
    formValid = ( (name == "username" && value != "") || this.state.formData.username != "") ? true : false;
    this.setState({
      formData,
      formValid
    });
  }

  //resets data when user clicks reset button
  resetData = (event) => {
    this.setState({
      formData: {
        username: '',
        timeframe: 'pastweek',
      }, userPercentage: "", resultTable: [], errorMessage:""
    });
  }


  //sends data to flask api as a post request when user hits the predict button
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
      //updates percentage & breakdown table 
      this.setState({ userPercentage: data.percentage, resultTable: data.table });
    }).catch((error) => {
      //notifies user that they submitted an invalid twitter handle 
      this.setState({ errorMessage: error.message })
    });

  };

  render() {
 
    const formData = this.state.formData;
    const userPercentage = this.state.userPercentage;

    //data for breakdown table 
    const resultTable = this.state.resultTable;
  

const renderLineChart = (
  <LineChart width={600} height={300} data={resultTable} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
    <Line type="monotone" dataKey="risk" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <XAxis dataKey="time" />
    <YAxis />
    <Tooltip />
  </LineChart>
);

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

          {this.state.errorMessage ? <p> Sorry, this twitter handle is invalid. Please enter a different twitter handle. </p> : userPercentage == "" ? null : (userPercentage == "-1" ? <p> Sorry, no tweets were found during this timeframe. Please select a different timeframe or twitter handle. </p> : <p> User's risk percentage: {userPercentage} %</p>)}
        </div>
        
        <PieChart results = {resultTable} />
        {renderLineChart}
      </Container>
    );
  }
}

export default App;
