import mysql from 'mysql2/promise'

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'aula1',
})

export default connection