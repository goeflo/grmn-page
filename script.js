//var FitParser = require('./fit-parser/fit-parser.js').default;
//import FitParser from './fit-parser/fit-parser.js';

var search, table_rows, table_headings
var fitTable, fitCharts

function searchTable() {
    table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

        row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
        row.style.setProperty('--delay', i / 25 + 's');
    })

    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}


function testFunction() {
	document.getElementById("demo").innerHTML = "pushed"
}

async function loadFitFile() {
    
    var fitTable = document.getElementById('fit_table');
    fitCharts.style.display = "block"
    fitTable.style.display = "none"

    const xhr = new XMLHttpRequest();
	xhr.open("GET", "http://localhost:8088/activity/"+this.id);
	xhr.send();
	xhr.responseType = "json";
    xhr.onload = () => {
        const data = xhr.response;
        console.log(data);
        drawCharts(data)

        // var fitParser = new FitParser({
        //     force: true,
        //     speedUnit: 'km/h',
        //     lengthUnit: 'm',
        //     temperatureUnit: 'celsius',
        //     elapsedRecordField: true,
        //     mode: 'list',
        //   });

        //   fitParser.parse(content, function (error, data) {
        //     if (error) {
        //       console.log(error);
        //     } else {
        //       console.log(JSON.stringify(data));
        //       //console.log(data.records[0]);
        //     }
        //   });
    }
}

function showTable() {
    fitCharts.style.display = "none"
    fitTable.style.display = "block"
}

async function onLoad() {

    fitTable = document.getElementById('fit_table');
    fitCharts = document.getElementById('fit_charts');
    fitCharts.style.display = "none"
    fitTable.style.display = "block"

    search = document.querySelector('.input-group input');
    table_rows = document.querySelectorAll('tbody tr');
    table_headings = document.querySelectorAll('thead th');
    search.addEventListener('input', searchTable);

	const xhr = new XMLHttpRequest();
	xhr.open("GET", "http://localhost:8088/activities");
	xhr.send();
	xhr.responseType = "json";
	
	xhr.onload = () => {
  		if (xhr.readyState == 4 && xhr.status == 200) {
    		const data = xhr.response;
			var tableBody = document.getElementById('fit-table-body');
			

			for(var i = 0; i < data.length; ++i) {
				var tr = document.createElement('tr');
                tr.id = data[i];
                tr.onclick = loadFitFile;
				tableBody.appendChild(tr);

				var td = document.createElement('td');
                td.appendChild(document.createTextNode(data[i]));
                tr.appendChild(td);

                // var a = document.createElement('a');
                // var linkText = document.createTextNode(data[i].Filename);
                //a.onclick=loadFitFile(data[i].Filename)
                // a.appendChild(linkText);
                // a.title = data[i].Filename;
                //a.href = "http://localhost:8088/activity/"+data[i].Filename;
                
			}

  		} else {
    		console.log(`Error: ${xhr.status}`);
  		}
	};
}
