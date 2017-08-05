
const http = require('http');  
var url = require('url');
var con = require('./db');
const port = 3000;


const searchPatients = function (request,response) {
  let sql = "SELECT pat_id FROM patient";
  con.query(sql, function (err, result) {
    if (err) throw err;
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(result));
    /*
    response.write("<p>Patients:</p>");
    for (var i =0; i<result.length; i++) {  
      response.write("<p><a href=\"/studies?patientId="+ result[i].pat_id +"\">"+ result[i].pat_id +"</a></p>");
    }*/
    response.end();
  });  
};

const searchStudies = function( request,response, patientId) {
  let sql = 'SELECT s.study_iuid FROM study as s, patient as p WHERE s.patient_fk = p.pk AND p.pat_id = ?';

  con.query(sql, patientId, function (err, result) {
    if (err) throw err;
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(result));
    /*
    response.write("<p>Studies from patient "+ patientId +":</p>");
    for (var i =0; i < result.length; i++) {  
      response.write("<p><a href=\"/series?studyId="+ result[i].study_iuid +"\">"+ result[i].study_iuid +"</a></p>");
    }
    */
    response.end();
  });
};

const searchSeries = function( request,response, studyId) {
  let sql = "SELECT series.series_iuid FROM series JOIN study ON series.study_fk = study.pk WHERE study.study_iuid = ?";
  con.query(sql, studyId, function (err, result) {
    if (err) throw err;
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(result));
    /*
    response.write("<p>Series from Study "+ studyId +":</p>");
    for (var i =0; i < result.length; i++) {  
      response.write("<p><a href=\"/objects?serieId="+ result[i].series_iuid +"\">"+ result[i].series_iuid +"</a></p>");
    }*/
    response.end();
  });
};


const searchObjects = function( request,response, serieId) {
  
  let sql = "SELECT instance.sop_iuid, study.study_iuid FROM instance JOIN series ON instance.series_fk = series.pk JOIN study ON series.study_fk = study.pk WHERE series.series_iuid = ?"
  con.query(sql, serieId, function (err, result) {
    if (err) throw err;
    var wadoUrls = new Array();
    for (var i =0; i < result.length; i++) {  
      wadoUrls.push("/wado?requestType=WADO&studyUID=" + result[i].study_iuid + "&seriesUID="+ serieId + "&objectUID=" + result[i].sop_iuid);
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(wadoUrls));
    /*
    response.write("<p>Objects from Serie "+ serieId +":</p>");
    for (var i =0; i < result.length; i++) {  
      response.write("<img src=\"http://localhost:8080/wado?requestType=WADO&studyUID="+ result[i].study_iuid +"&seriesUID="+ serieId +"&objectUID=" + result[i].sop_iuid + "&frameNumber=1&rows=500\"></img><br></ br>");
    }
    */
    response.end();
  });
};




/*
//  sql = "SELECT i.sop_iuid, st.study_iuid  FROM instance as i, series as s, study as st WHERE i.series_fk = s.pk AND s.series_iuid = ? AND st.pk = s.study_fk";

  let sql1 = "SELECT study_iuid FROM study WHERE patient_fk = ?";
  let a = 2;
  con.query(sql1, a ,function (err, result) {
    if (err) throw err;
    console.log(result);
    data = result;
  });
*/
/*
const requestHandler = (request, response) => {  
  response.setHeader('Content-Type', 'text/html');
  for (var i=0; i<data.length; i++) {
      response.write("<img src=\"http://localhost:8080/wado?requestType=WADO&studyUID=1.2.826.0.1.3680043.8.420.14333496698289139391754687794161600766&seriesUID=1.2.826.0.1.3680043.8.420.50251820766722043725117763028245876147&objectUID=" + data[i].sop_iuid + "&frameNumber=1&rows=500\"></img>\n");
  }
}
*/

const server = http.createServer(function (request, response) {  
  // Parse the request containing file name
  var pathname = url.parse(request.url).pathname;
  if (pathname == '/patients') {
    searchPatients(request,response);
  }
  else if (pathname == '/studies' && url.parse(request.url,true).query.patientId) {
    searchStudies(request,response, url.parse(request.url,true).query.patientId);
  }
  else if (pathname == '/series' && url.parse(request.url,true).query.studyId) {
    searchSeries(request,response, url.parse(request.url,true).query.studyId);
  }
  else if (pathname = '/objects' && url.parse(request.url,true).query.serieId) {
    searchObjects(request,response, url.parse(request.url,true).query.serieId);
  }

  

});


server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})