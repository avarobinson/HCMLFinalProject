import React, { useState, useEffect, Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Form, Col, Container, Row, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      currentUser: "",
      isLoading: false,
      formData: {
        username: '',
        timeframe: 'past week',
      },
      result: ""
    };
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    var formData = this.state.formData;
    formData[name] = value;
    this.setState({
      formData
    });
  }

  useEffect = () => {
    const formData = this.state.formData;
    fetch('/api/v1',{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(formData)
    }
    
    ).then(res => res.json()).then(data => {
      this.setState({currentUser: data.user});
    });
  };

  render() {
    const currentUser = this.state.currentUser
    const isLoading = this.state.isLoading;
    const formData = this.state.formData;
    const result = this.state.result;

    return (
      <Container>
        <div>
          <h1 className="title">Detecting Depression via Twitter</h1>
        </div>
        <div className="content">
          <Form>
            <Form.Group>
              <Form.Label>Twitter Handle</Form.Label>
              <Form.Control type="text" placeholder="enter twitter handle" required name="username" value={formData.username} onChange={this.handleChange}/>
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

            <Button onClick={this.useEffect}> 
              Predict
            </Button>
  
          </Form>
          <p>The current user is {currentUser}.</p>
        </div>
      </Container>
    );
  }
}

export default App;

