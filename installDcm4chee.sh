#!/bin/sh
#
# @autor Kleberson Serique
# @email junio.serique@gmail.com
#
# RUN epad using docker
#
#short url http://migre.me/rr2FH
dicomproxypath="https://www.dropbox.com/s/38hwo7dzuknbh63/DicomProxy.tar.gz?dl=1"
epadfile="DicomProxy.tar.gz"

echo "Start"
runLinux() {
  echo "RUM mysql container..."
  echo ""
  #  "$(docker inspect -f {{.State.Running}} junioserique/mysql)" == "<no value>" && (
  if [ -f $(docker inspect -f {{.State.Running}} epad_mysql) ]; then
  	echo "creating container mysql..."
  	#-v $path/DicomProxy/mysql/:/var/lib/mysql/
	# docker run -it -d --name epad_mysql junioserique/mysql
  	sudo docker run -it -d --name epad_mysql -p 3306:3306 -v $path/DicomProxy/installdb:/home -e MYSQL_ROOT_PASSWORD=epad mysql
  	echo "INSTALL databases on mysql container..."
    echo ""
    sleep 20
    sudo docker exec epad_mysql sh /home/install.sh
  else
    if [ "$(docker inspect -f {{.State.Running}} epad_mysql)" = "false" ]; then
      echo "running the container mysql..."
      sudo docker start epad_mysql
    fi
  fi
  echo "RUM dcm4chee container..."
  echo ""
  if [ -f $(docker inspect -f {{.State.Running}} epad_dcm4chee) ]; then
    echo "creating container dcm4chee..."
    sudo docker run --name dcm4chee -v $path/DicomProxy/dcm4chee/:/app/dcm4chee-2.17.1-mysql/server/default/archive/ -v $path/DicomProxy/app:/app -d --link epad_mysql:epad_mysql -p 9080:9080 -p 11112:11112 junioserique/dcm4chee
  else
    if [ "$(docker inspect -f {{.State.Running}} epad_dcm4chee)" = "false" ]; then
      echo "running the container dcm4chee..."
      sudo docker start dcm4chee
    fi
  fi
  echo "RUM exist container..."
  echo ""
  if [ -f $(docker inspect -f {{.State.Running}} exist) ]; then
    echo "creating container exist..."
    sudo docker run -it -d --name exist -p 8899:8899 junioserique/exist
  else
    if [ "$(docker inspect -f {{.State.Running}} exist)" = "false" ]; then
      echo "running the container exist..."
      sudo docker start exist
    fi
  fi
  echo "RUM epad container..."
  echo ""
  if [ -f $(docker inspect -f {{.State.Running}} epad) ]; then
    echo "creating container epad..."
    sudo docker run -it -d --name epad -v "$PWD"/DicomProxy:/root/DicomProxy -p 8080:8080 --link dcm4chee:dcm4chee --link epad_mysql:epad_mysql --link exist:exist junioserique/epad
  else
    if [ "$(docker inspect -f {{.State.Running}} epad)" = "false" ]; then
      echo "running the container epad..."
      sudo docker start epad
    fi
  fi
}
runMacOS() {
  echo "RUM mysql container..."
  echo ""
  #  "$(docker inspect -f {{.State.Running}} junioserique/mysql)" == "<no value>" && (
  if [ -f $(docker inspect -f {{.State.Running}} epad_mysql) ]; then
  	echo "creating container mysql..."
  	#-v $path/DicomProxy/mysql/:/var/lib/mysql/
	# docker run -it -d --name epad_mysql junioserique/mysql
  	docker run -it -d --name epad_mysql  -v $path/DicomProxy/installdb:/home -e MYSQL_ROOT_PASSWORD=epad mysql
  	echo "INSTALL databases on mysql container..."
    echo ""
    sleep 10
    docker exec epad_mysql sh /home/install.sh
  else
    if [ "$(docker inspect -f {{.State.Running}} epad_mysql)" == "false" ]; then
      echo "running the container mysql..."
      docker start epad_mysql
    fi
  fi
  echo "RUM dcm4chee container..."
  echo ""
  if [ -f $(docker inspect -f {{.State.Running}} epad_dcm4chee) ]; then
    echo "creating container dcm4chee..."
    docker run --name dcm4chee -v $path/DicomProxy/dcm4chee/:/app/dcm4chee-2.17.1-mysql/server/default/archive/ -v $path/DicomProxy/app:/app -d --link epad_mysql:epad_mysql -p 9080:9080 -p 11112:11112 junioserique/dcm4chee
  else
    if [ "$(docker inspect -f {{.State.Running}} epad_dcm4chee)" == "false" ]; then
      echo "running the container dcm4chee..."
      docker start dcm4chee
    fi
  fi
  echo "RUM exist container..."
  echo ""
  if [ -f $(docker inspect -f {{.State.Running}} exist) ]; then
    echo "creating container exist..."
    docker run -it -d --name exist -p 8899:8899 junioserique/exist
  else
    if [ "$(docker inspect -f {{.State.Running}} exist)" == "false" ]; then
      echo "running the container exist..."
      docker start exist
    fi
  fi
  echo "RUM epad container..."
  echo ""
  if [ -f $(docker inspect -f {{.State.Running}} epad) ]; then
    echo "creating container epad..."
    # default image container
    docker run -it -d --name epad -v "$PWD"/DicomProxy:/root/DicomProxy -p 8080:8080 --link dcm4chee:dcm4chee --link epad_mysql:epad_mysql --link exist:exist junioserique/epad
  else
    if [ "$(docker inspect -f {{.State.Running}} epad)" == "false" ]; then
      echo "running the container epad..."
      docker start epad
    fi
  fi
}
# alternatives containers for epad
runePadOracle(){
  docker run -it -d --name ubuntu -v $PWD/DicomProxy:/root/DicomProxy -v $PWD/DicomProxy/java:/java ubuntu /bin/bash
}
runePadJavaImage(){
  docker run -it -d --name ubuntu -v $PWD/DicomProxy:/root/DicomProxy -v $PWD/DicomProxy/java:/java java:7 /bin/bash
#  docker run -it -d --name ubuntu -v $PWD/DicomProxy:/root/DicomProxy -v $PWD/DicomProxy/java:/java java:8 /bin/bash
}

run() {
  if [ $(uname) = 'Darwin' ]; then
    echo "run docker @ MacOS"
    runMacOS
  elif [ $(expr substr $(uname -s) 1 5) = 'Linux' ]; then
    echo "run docker @ Linux"
    runLinux
  else
    echo "Other"
  fi
}
extract(){
  echo "$path/$epadfile"
  # check if the file is ok
  if [ -f "$path/$epadfile" ] ; then
  	#check if tar is ok
    if hash tar 2>/dev/null; then
      #compress is tar cvzf DicomProxy.tar.gz DicomProxy
      tar zxvf $epadfile
      rm $epadfile
    else
      echo "[ERROR] you need install tar"
      echo "try: apt-get install tar"
      rm $epadfile
    fi
  fi
}

install() {
  path=$(pwd)
  # check if docker is run
  if hash docker 2>/dev/null; then
    # check if DicomProxy is downloaded
    if [ ! -d "$path/DicomProxy" ]; then
	  # Download and extract DicomProxy
	  echo "Download DicomProxy..."
	  # check if wget is ok
	  if hash wget 2>/dev/null; then
	    #wget http://epad.icmc.usp.br/epad/$epadfile
	    #short http://migre.me/rr1ni
	    wget -O $epadfile  $dicomproxypath
	  else
	    # check if curl is ok
	    if hash curl 2>/dev/null; then
	      #curl http://epad.icmc.usp.br/epad/$epadfile > $epadfile
	      curl -sSL $dicomproxypath  > $epadfile
	    else
	      echo "ERROR: you need install wget or curl"
	      return
	    fi
	  fi
	  extract
	  run
  	else
  	  run
  	fi
  else
    echo '[ERROR] You need install docker'
    echo 'try: curl -sSL https://get.docker.com/ | sh'
  fi
}

#run
install