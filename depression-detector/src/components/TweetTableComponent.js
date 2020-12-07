import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React, { useEffect, useState } from "react";
import "../App.css";


const TweetTable = ({ data, columns }) => {

  //handles filter in search bar 
  const [filterInput, setFilterInput] = useState("");
  const handleFilterChange = e => {
    const value = e.target.value;
    setFilterInput(value);
  };

  var [tableData, setData] = useState(data);

  useEffect(() => {
  
    if (filterInput.length !== 0) {
      setData(data.filter(row => row.tweet.includes(filterInput)));
    }else{
      setData(data);
    }
  }, [filterInput, data]);


  return (
    <div>
      <input
      className = "searchBar"
        value={filterInput}
        onChange={handleFilterChange}
        placeholder={"Search Tweet"}
      />
      <Paper className = "tweetTable">
        <TableContainer className= "tableContainer">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow >
                {columns.map((column) => (
                  <TableCell
                  className = "tableHeader"
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className = "tableBody">
              {tableData.map((row) => {
                return (
                  <TableRow className = "cell" hover role="checkbox" tabIndex={-1} key={row.time}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell className = "tableRow" key={column.id} id={column.id}>
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default TweetTable;