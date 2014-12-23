#!/bin/bash
#Arranca MongoDB

echo "Arrancando MongoDB"
sudo mongod --fork --logpath /var/log/mongod.log

#Corre la app de node
echo "Arrancando MiTubo con forever"
sudo forever start app.js

