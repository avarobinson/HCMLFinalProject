import React, { useState, useEffect, Component } from 'react';

import { Form, Col, Container, Row, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


// Import React Table
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";

const Table = (props) => {
    return (
        <ReactTable
    data={props.data}
    columns={
        [{
            Header: "Tweet",
            accessor: "tweet",
            style: { 'whiteSpace': 'unset' }
        },
        {
            Header: "Risk",
            accessor: "risk"
        }
        ]
    }
    style={
        {
            height: "400px"
        }
    }
    className="-striped -highlight"
    showPagination={false}

/>
    )
}

export default Table;

