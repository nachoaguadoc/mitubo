#!/bin/bash
#User authentication

user=$1
password=$2


curl --cookie-jar jarfile --data "username="$user"&password="$password http://localhost:3000/login

curl --cookie jarfile "http://localhost:3000/videos"
