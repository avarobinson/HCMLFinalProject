import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React, { useEffect, useState } from "react";
import "../App.css";

const useStyles = makeStyles({
  root: {
    width: 600,
  },
  container: {
    maxHeight: 440,
  },
});

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

  const classes = useStyles();
  return (
    <div>
      <input
        value={filterInput}
        onChange={handleFilterChange}
        placeholder={"Search Tweet"}
      />
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.time}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
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