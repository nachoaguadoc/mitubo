#!/bin/bash
#User authentication
echo "Please, identify yourself:"
read -p "Introduce user name" user
read -p "Introduce your password" password


prueba=$(curl -s --cookie-jar jarfile --data "username="$user"&password="$password http://localhost:3000/login);

response=$(curl -s --cookie jarfile "http://localhost:3000/videos");


 
if [ "$response" = "$prueba" ]
	then 	echo "Datos incorrectos"
			exit 2
else 	echo "Correcto"
		read -p "Introduce path del archivo" file
		read -p "Introduce titulo del archivo" title
		read -p "Introduce descripcion del archivo" desc

		if [ -f "$file" ]
			then

			scp -P 8080 prueba.webm root@localhost:/prueba
		fi



fi
