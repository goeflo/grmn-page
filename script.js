
var search, table_rows, table_headings

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
    console.log(`load filt file`)
    alert(this.id);
}

async function onLoad() {

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
                tr.id = data[i].Filename;
                tr.onclick = loadFitFile;
				tableBody.appendChild(tr);

				var td = document.createElement('td');
				td.innerHTML += data[i].Date;
				tr.appendChild(td);

				var td = document.createElement('td');
				td.innerHTML += data[i].Time;
				tr.appendChild(td);

				var td = document.createElement('td');
                td.appendChild(document.createTextNode(data[i].Filename));
                // var a = document.createElement('a');
                // var linkText = document.createTextNode(data[i].Filename);
                //a.onclick=loadFitFile(data[i].Filename)
                // a.appendChild(linkText);
                // a.title = data[i].Filename;
                //a.href = "http://localhost:8088/activity/"+data[i].Filename;
                tr.appendChild(td);
			}

  		} else {
    		console.log(`Error: ${xhr.status}`);
  		}
	};
}
