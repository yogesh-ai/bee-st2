import mysql from "mysql"
export var conn = mysql.createConnection({host:"localhost", user:"root", password:"", database:"users"})
