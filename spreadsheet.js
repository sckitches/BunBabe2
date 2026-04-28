/**
 * BunBabe Spreadsheet Integration Helper
 * Uses Google Visualization API to bypass CORS issues.
 */

const SPREADSHEET_ID = '1Y-iGaKKjgW6LSccnLGBZInSEFfwXcAwIJI_vpPFgR3k';

// Dynamically load Google Charts library
const script = document.createElement('script');
script.src = 'https://www.gstatic.com/charts/loader.js';
document.head.appendChild(script);

function fetchSpreadsheetData(gid = '0') {
    return new Promise((resolve, reject) => {
        if (typeof google === 'undefined') {
            // Wait for library to load
            script.onload = () => {
                google.charts.load('current', { packages: ['corechart'] });
                google.charts.setOnLoadCallback(() => {
                    resolve(querySheet(gid));
                });
            };
        } else {
            resolve(querySheet(gid));
        }
    });
}

function querySheet(gid) {
    return new Promise((resolve, reject) => {
        const query = new google.visualization.Query(
            `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=${gid}`
        );
        query.send((response) => {
            if (response.isError()) {
                console.error('Error fetching data: ' + response.getMessage());
                resolve([]);
                return;
            }
            const dataTable = response.getDataTable();
            const columns = [];
            for (let i = 0; i < dataTable.getNumberOfColumns(); i++) {
                columns.push(dataTable.getColumnLabel(i));
            }

            const rows = [];
            for (let i = 0; i < dataTable.getNumberOfRows(); i++) {
                const row = {};
                for (let j = 0; j < dataTable.getNumberOfColumns(); j++) {
                    row[columns[j]] = dataTable.getValue(i, j);
                }
                rows.push(row);
            }
            resolve(rows);
        });
    });
}
