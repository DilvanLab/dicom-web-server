const express = require('express');
const con = require('./db');
const request = require('request');

const port = 3000;
const wadoServer = 'http://localhost:9080';
const app = express();


function searchPatients(response) {
    const sql = "SELECT pat_id FROM patient";
    con.query(sql, (err, result)=>{
        if (err) throw err;
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(JSON.stringify(result));
        //console.log(JSON.stringify(result));
        /*
        response.write("<p>Patients:</p>");
        for (var i =0; i<result.length; i++) {
          response.write("<p><a href=\"/studies?patientId="+ result[i].pat_id +"\">"+ result[i].pat_id +"</a></p>");
        }*/
        response.end();
    });
}

function searchStudies(patientId, response) {
    const sql = 'SELECT s.study_iuid FROM study as s, patient as p WHERE s.patient_fk = p.pk AND p.pat_id = ?';

    con.query(sql, patientId, (err, result)=>{
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
}

function searchSeries(studyId, response) {
    const sql = "SELECT series.series_iuid FROM series JOIN study ON series.study_fk = study.pk WHERE study.study_iuid = ?";
    con.query(sql, studyId, (err, result)=>{
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
}

function searchObjects(serieId, response) {

    const sql = "SELECT instance.sop_iuid, study.study_iuid FROM instance JOIN series ON instance.series_fk = series.pk JOIN study ON series.study_fk = study.pk WHERE series.series_iuid = ?";
    con.query(sql, serieId, (err, results)=>{
        if (err) throw err;
        let wadoUrls = [];
        results.forEach(result=>{
            wadoUrls.push("/wado?requestType=WADO&studyUID=" + result.study_iuid + "&seriesUID=" + serieId + "&objectUID=" + result.sop_iuid);
        });
        // for (let i = 0; i < results.length; i++) {
        //     wadoUrls.push("/wado?requestType=WADO&studyUID=" + results[i].study_iuid + "&seriesUID=" + serieId + "&objectUID=" + results[i].sop_iuid);
        // }
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
}

function searchAll(response) {
    const sql = "SELECT series_iuid FROM series";
    con.query(sql, (err, result)=>{
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
}

//
//   Setting up the paths

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/patients', (request, response) => {
    searchPatients(response);
});

app.get('/studies', (request, response) => {
    searchStudies(request.query.patientId, response);
});

app.get('/series', (request, response) => {
    searchSeries(request.query.studyId, response);
});

app.get('/objects', (request, response) => {
    searchObjects(request.query.serieId, response);
});

app.get('/allSeries', (request, response) => {
    searchAll(response);
});

//   Wado proxy to fix COORS issues
//
app.use('/wado', (req, res) => {
    const url = wadoServer + '/wado'+ req.url;
    //console.log(url);
    const r = (req.method === 'POST') ?
                  request.post({uri: url, json: req.body}):
                  request(url);
    req.pipe(r).pipe(res);
});

let server = app.listen(port, () => {
    console.log("Running ...")
});