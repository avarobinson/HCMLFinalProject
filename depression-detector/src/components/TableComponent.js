
import React, { useState } from "react";
import { useTable, useFilters, useSortBy } from "react-table";
import "../index.css";
import "../App.css";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";

const Table = ({ data, columns }) => {
    
    //handles table properties 
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setFilter
    } = useTable(
        {
            columns,
            data
        },
        useFilters,
        useSortBy
    );

    //handles filter in search bar 
    const [filterInput, setFilterInput] = useState("");
    const handleFilterChange = e => {
        const value = e.target.value;
        setFilter("tweet", value);
        setFilterInput(value);
    };

    return (
        <div className="assessmentBreakdown">
            <input
                value={filterInput}
                onChange={handleFilterChange}
                placeholder={"Search Tweet"}
            />

            <div>
                <table {...getTableProps()} >
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                        {column.render("Header")}
                                        {column.isSorted ? column.isSortedDesc ? <BsArrowDown /> : <BsArrowUp /> : ""}
                                    </th>
                               
                                ))}
                            </tr>
                          
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, i) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return (
                                            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table; 