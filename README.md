# dicom-web-server

A front end to dcm4chee to read its information as web services calls. SQL configuration in the file `db.js`.

To run: `npm install` and then `node index.js` 

### Installing dcm4chee:

`wget -qO- http://java.icmc.usp.br:2280/install.sh | sudo sh`

The file installDcm4chee.sh also has the installation script.

Start Portainer, graphic application to show dockers:

`sudo docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer`
`sudo docker start c7c1c042ded2` 
"epad" is the password of the mysql container `mysql_epad`

`./Downloads/dcm4che-2.0.29/bin/dcmsnd DCM4CHEE@localhost:11112 ~/Downloads/img`

Link to the [dcm4chee databank image](https://dcm4che.atlassian.net/wiki/spaces/ee2/pages/2555917/Database+Schema+Diagram).
Link to [dcm4chee databank tables](https://dcm4che.atlassian.net/wiki/spaces/ee2/pages/2556012/Database+Table+Descriptions). 
Not all data about series are in the databank tables. To get DICOM images using WADO it is nescessary to add 
`"&contentType=application/dicom"` to the end of the file WADO URL. 
