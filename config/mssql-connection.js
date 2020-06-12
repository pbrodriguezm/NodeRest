let sql = require('mssql');

const sqlconnection = new sql.ConnectionPool({
    user: 'infhotel',
    password: 'infh2566',
    server: '190.102.145.12',
    database: 'INFORESTJERUSALENH'
})

sqlconnection.connect(err => {
    if (err) { throw err };
    console.log('Connection successfull');
});

module.exports = sqlconnection;