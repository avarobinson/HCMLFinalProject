import React, { Component } from 'react';
import './App.css';
import { Form, Col, Container, Row, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import PieChart from './components/PieChartComponent';
import Timeline from './components/TimelineComponent';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValid: false,
      userPercentage: "",
      resultTable: [],
      piechartData: [],
      formData: {
        username: '',
        timeframe: 'pastweek',
      },
      errorMessage: '',
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
    formValid = ((name == "username" && value != "") || this.state.formData.username != "") ? true : false;
    this.setState({
      formData,
      formValid,
      resultTable: []
    });
  }

  handleFilter = (event) =>{
    const value = event.target.value;
    const name = event.target.name;
    var filterData = this.state.filterData;
    filterData[name] = value;
    
    this.setState({
      filterData
    });

    this.changeDates();
  }

  timelineFilter(start, end){
    var startDate = this.state.filterData.startDate;
    var endDate = this.state.filterData.endDate;
    this.setState({
      startDate: start,
      endDate: end
    })
  }

  //resets data when user clicks reset button
  resetData = (event) => {
    this.setState({
      formData: {
        username: '',
        timeframe: 'pastweek',
      }, userPercentage: "", resultTable: [], errorMessage: "", piechartData: []
    });
  }


  //sends data to flask api as a post request when user hits the predict button
  sendData = () => {
    const formData = this.state.formData;
    this.setState({ errorMessage: "" });
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
      this.setState({ userPercentage: data.percentage, resultTable: data.table, piechartData: data.table });
    }).catch((error) => {
      //notifies user that they submitted an invalid twitter handle 
      this.setState({ errorMessage: error.message })
    });

  };

  render() {
   
    const filterData = this.state.piechartData;


    const formData = this.state.formData;
    const userPercentage = this.state.userPercentage;

    //data for breakdown table 
    const resultTable = this.state.resultTable;
    if(resultTable.length !== 0){
      resultTable.sort((a, b) => (a.date > b.date) ? 1 : -1);
    }

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
        <Timeline results={resultTable} timeframe={this.state.formData["timeframe"]} />

       
      </Container>
    );
  }
}

export default App;
