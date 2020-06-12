let sql = require('mssql');
let express = require('express');
let app = express.Router()

//Initiallising connection string
var dbConfig = {
    user: 'infhotel',
    password: 'infh2566',
    server: '190.102.145.12',
    database: 'INFORESTPRUEBAS',
    port: 1433
};

//GET API
/*app.get('/', (req, res) => {
    sql.connect(dbConfig, () => {
        console.log('ENTRO AQUI');
        var request = new sql.Request();
        request.query('SELECT * FROM dbo.' + req.query.table, (err, recordsets) => {
            if (err) { throw err };
            res.setHeader('Content-Type', 'application/json');
            sql.close();
            return res.send({ users: recordsets.recordset }); // Result in JSON format
        });
    });
});*/

app.get('/:local/:table', (req, res) => {

    dbConfig.database = req.params.local + '';

    //Columnas 
    if (req.query.columns == undefined) {
        req.query.columns = '*';
    }

    //Filtros
    if (req.query.filter != undefined) {
        req.query.filter = ' where ' + req.query.filter;
    } else {
        req.query.filter = '';
    }

    //Filtros
    if (req.query.sort != undefined) {
        req.query.sort = ' ORDER BY ' + req.query.sort;
    }


    sql.connect(dbConfig, () => {
        var request = new sql.Request();
        var stringRequest = 'SELECT ' + req.query.columns + ' FROM dbo.' + req.params.table + req.query.filter;
        request.query(stringRequest, (err, recordset) => {
            if (err) { throw err };
            res.setHeader('Content-Type', 'application/json');
            sql.close();
            return res.send(recordset.recordset); // Result in JSON format
        });
    });
});

//POST API
app.post("/:local/:table", (req, res) => {
    dbConfig.database = req.params.local + '';
    sql.connect(dbConfig, () => {
        var transaction = new sql.Transaction();
        transaction.begin(() => {
            var request = new sql.Request(transaction);

            let DB = req.body.DB;
            let DBAlma = req.body.DBAlma;
            let DBAlmaH = req.body.DBAlmaH;
            let detalle = req.body.detalle;
            let id = req.body.id;
            let ip = req.body.ip;
            let nombre = req.body.nombre;


            colums = '';
            values = '';
            for (var key in req.body) {
                colums += key + ', ';
                values += req.body[key] + ', ';
                //console.log(key); // here is your column name you are looking for
            }
            colums = colums.slice(0, -2);
            values = values.slice(0, -2);

            request.query("INSERT INTO " + req.params.table + " (" + colums + ") VALUES (" + values + ")")
                .then(function() {
                    transaction.commit().then(function(resp) {
                        sql.close();
                        res.setHeader('Content-Type', 'application/json');
                        return res.status(200).send({ result: 'Data added successfully', data: req.body })
                    }).catch(function(err) {
                        console.log("Error in Transaction Commit " + err);
                        sql.close();
                        res.setHeader('Content-Type', 'application/json');

                    });
                }).catch(function(err) {
                    console.log("Error in Transaction Begin " + err);
                    sql.close();
                })
        });
    });
});

//PUT API
app.put("/:id", function(req, res) {
    sql.connect(dbConfig, () => {
        var transaction = new sql.Transaction();
        transaction.begin(() => {
            var request = new sql.Request(transaction);
            let id = req.params.id;
            let username = req.body.username;
            let lastName = req.body.last_name;
            let firstName = req.body.first_name;
            let age = req.body.age;
            let direction = req.body.direction;
            request.input("username", sql.VarChar(30), username)
            request.input("last_name", sql.VarChar(30), lastName)
            request.input("first_name", sql.VarChar(30), firstName)
            request.input("age", sql.Int(), age)
            request.input("direction", sql.Text(), direction)
            request.input("id", sql.Int(), id)
            request.execute("updateUserData", () => {
                transaction.commit()
                    .then(() => {
                        sql.close();
                        res.setHeader('Content-Type', 'application/json');
                        return res.status(200).send({ result: 'Data updated successfully', data: req.body })
                    })
                    .catch((err) => {
                        sql.close();
                        res.setHeader('Content-Type', 'application/json');
                        return res.status(400).send({ result: "Error while updating data", error: err });
                    });
            })
        });
    });
});

// DELETE API
app.delete("/:id", (req, res) => {
    var query = "DELETE FROM dbo.users WHERE id =" + req.params.id;
    sql.connect(dbConfig, () => {
        var request = new sql.Request();
        request.query(query, (err) => {
            if (err) { throw err };
            res.setHeader('Content-Type', 'application/json');
            sql.close();
            return res.send({ result: 'Record deleted successfully' }); // Result in JSON format
        });
    });
});

module.exports = app;