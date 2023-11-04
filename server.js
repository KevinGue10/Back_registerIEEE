const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const port = process.env.PORT || 8080;
const mysql = require('mysql')
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require("nodemailer");
let cobro=0;
let Dolar=4000;
let aToken='';
let cobroURL = '';
let activador_estado=false;
let validatorname='';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'public'))); // Asumiendo que tu CSS está en la carpeta 'public'


const corsOptions = {
  origin: ['http://54.236.126.192', 'http://ieeec3register.org', 'http://www.ieeec3register.org','http://localhost:3000','http://54.236.126.192:8080'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: process.env.db_dns,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_data,
  multipleStatements: true
});
db.connect();

app.listen(port, () => {
  console.log(`Servidor Node.js en ejecución en el puerto ${port}`);
});
import('node-fetch').then(({ default: fetch }) => {
app.get('/', (req, res) => {
  res.send('¡Backend funcionando!');
});

//Ruta para manejar el registro
app.post('/registro', (req, res) => {
  const formData = req.body; 
   const sql = 'INSERT INTO Registros.Registro_conferencia (nombres, apellidos, pais,ciudad,direccion,sexo,nacimiento,tipodocumento,documento, afiliacion, correo, telefono,oficio, miembro, membresia, participacion,asistencia, impuesto, articulo1,paginas_a1,articulo2,paginas_a2,tutorial1,tutorial2) VALUES (?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?, ?,?,?,?,?)';
  const values = [
    formData.nombre,
    formData.apellidos,
    formData.pais,
    formData.ciudad,
    formData.direccion,
    formData.sexo,
    formData.fechaNacimiento,
    formData.tdoc,
    formData.doc,
    formData.afiliacion,
    formData.correo,
    formData.telefono,
    formData.oficio,
    formData.esMiembroIEEE ? 'Sí' : 'No',
    formData.numeroMembresia,
    formData.tipoParticipacion,
    formData.tipoAsistencia,
    formData.pimpuesto,
    formData.articulos[0].articleNumber,
    formData.articulos[0].pages
  ];
  if (formData.articulos.length > 1) {
    values.push(formData.articulos[1].articleNumber);
    values.push(formData.articulos[1].pages);
  } else {
    values.push(null);
    values.push(null);  
  }

 
  if (formData.titulo1==true){
    values.push('T1'); 
  } else if (formData.titulo2==true){
    values.push('T2'); 
  } else{
    
    values.push(null);   
  }
  if (formData.titulo3==true){
    values.push('T3'); 
  } else if (formData.titulo4==true){
    values.push('T4'); 
  } else {
    values.push(null);  
  }
  
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar datos en la base de datos:', err);
      res.status(500).send('Error interno del servidor');
    } else {
      console.log('Datos insertados correctamente')
      res.status(200).send('Datos insertados correctamente');
    }
  });

  if(formData.numArt>2){
    for(let j=2;j<formData.numArt;j++){
      let nsql='INSERT INTO Registros.Articulos_extra (numArticulo,paginas,nombres,apellidos) VALUES (?,?,?,?)';
     let nvalues=[
        formData.articulos[j].articleNumber,
        formData.articulos[j].pages,
        formData.nombre,
        formData.apellidos,
      ]
      db.query(nsql, nvalues, (err, result) => {
        if (err) {
          console.error('Error al insertar datos en la base de datos:', err)
        } else {
          console.log('Nuevo articulo ingresado correctamente');
        }
      });
    }
    validatorname=formData.correo
  }

});

app.post('/cobro', (req, res) => {
  const formData = req.body;
  // Lógica para calcular el valor de cobro

  if(formData.cupon==='I333cDiscount!'){


  if (formData.tipoParticipacion === 'Autor' && formData.esMiembroIEEE === true) {
    cobro = 150;
  } else if (formData.oficio === 'Estudiante' && formData.tipoParticipacion === 'Autor' && formData.esMiembroIEEE === false) {
    cobro=200
  } else if (formData.oficio === 'Profesional' && formData.tipoParticipacion === 'Autor' && formData.esMiembroIEEE === false) {
    cobro=250
  } else if (formData.tipoParticipacion === 'Asistente' && formData.esMiembroIEEE === true) {
    cobro=50
  } else if (formData.oficio === 'Estudiante' && formData.tipoParticipacion === 'Asistente' && formData.esMiembroIEEE === false) {
    cobro=80
  } else if (formData.oficio === 'Profesional' && formData.tipoParticipacion === 'Asistente' && formData.esMiembroIEEE === false) {
    cobro=140
  } else if (formData.tipoParticipacion === 'Poster' && formData.esMiembroIEEE === true) {
    cobro = 100;
  }else if (formData.oficio === 'Estudiante' && formData.tipoParticipacion === 'Poster' && formData.esMiembroIEEE === false) {
    cobro=150
  } else if (formData.oficio === 'Profesional' && formData.tipoParticipacion === 'Poster' && formData.esMiembroIEEE === false) {
    cobro=200
  }
  
  if (formData.numArt>2){
    cobro=cobro+(70*(formData.numArt-2))

  }
} else {

  if (formData.tipoParticipacion === 'Autor' && formData.esMiembroIEEE === true) {
    cobro = 200;
  } else if (formData.oficio === 'Estudiante' && formData.tipoParticipacion === 'Autor' && formData.esMiembroIEEE === false) {
    cobro=250
  } else if (formData.oficio === 'Profesional' && formData.tipoParticipacion === 'Autor' && formData.esMiembroIEEE === false) {
    cobro=300
  } else if (formData.tipoParticipacion === 'Asistente' && formData.esMiembroIEEE === true) {
    cobro=100
  } else if (formData.oficio === 'Estudiante' && formData.tipoParticipacion === 'Asistente' && formData.esMiembroIEEE === false) {
    cobro=150
  } else if (formData.oficio === 'Profesional' && formData.tipoParticipacion === 'Asistente' && formData.esMiembroIEEE === false) {
    cobro=200
  } else if (formData.tipoParticipacion === 'Poster' && formData.esMiembroIEEE === true) {
    cobro = 100;
  }else if (formData.oficio === 'Estudiante' && formData.tipoParticipacion === 'Poster' && formData.esMiembroIEEE === false) {
    cobro=150
  } else if (formData.oficio === 'Profesional' && formData.tipoParticipacion === 'Poster' && formData.esMiembroIEEE === false) {
    cobro=200
  }
  
  if (formData.numArt>2){
    cobro=cobro+(120*(formData.numArt-2))

}
}
  for (let i=0;i<formData.numArt;i++){
    if(formData.articulos[i].pages>6){
      cobro=cobro+(50*(formData.articulos[i].pages-6))
    }
  }
  
  if((formData.titulo1==true || formData.titulo2==true) && (formData.titulo3==true || formData.titulo4==true)){

    if (formData.esMiembroIEEE === true) {
      cobro = cobro+15;
    } else if (formData.oficio === 'Estudiante' && formData.esMiembroIEEE === false) {
      cobro = cobro+20;
    } else if (formData.oficio === 'Profesional' && formData.esMiembroIEEE === false) {
      cobro = cobro+25;
    } 

  }
  if(formData.pimpuesto!=0){
    cobro=cobro+(cobro*(formData.pimpuesto/100))
  }
  // Envía la respuesta al cliente
  res.json({ cobro });
});

app.post('/proceso_pago', async (req, res) => {
  try {
    // Obtener el access token
    const responseToken = await fetch("https://cobru.me/token/refresh/", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key':  process.env.x_api_key
      },
      body: JSON.stringify({
        refresh: process.env.refresh_token
          }),
    });
    
    if (responseToken.status === 200) {
      const accessTokenResponse = await responseToken.json();
      const accessToken = accessTokenResponse.access;
      aToken=accessToken;
      activador_estado=true;
      // Crear el cobro
      const newCobru = {
        amount: Math.ceil(cobro*Dolar), //el monto del cobru es de $50.000 pesos
        description: "Inscripción conferencia IEEE C3", //esta descripción aparecera en la vista web
        expiration_days: 7, //el cobru podra ser pagado en los siguientes siete días
        //payment_method_enabled: `{"pse": true, "credit_card": true }`, 
        payment_method_enabled: `{ \"credit_card\": true, \"pse\": true }`,
        platform: "API" // los cobrus creados usando el API deben tener API en este parametro
    }

      const responseCobro = await fetch("https://cobru.me/cobru/", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': process.env.x_api_key
        },
        body: JSON.stringify(newCobru),
      });
    
      if (responseCobro.status === 201) {
        const cobroResponse = await responseCobro.json();
        cobroURL = cobroResponse.url;

          // Construir la URL de checkout
        const checkoutURL =`https://cobru.me/${cobroResponse.url}`;
        res.json({ cobro: cobroResponse, checkoutURL });

      } else {
        console.error('Error al crear el cobro:', responseCobro.statusText);
        res.status(500).json({ error: 'Error al crear el cobro' });
      }
    } else {
      console.error('Error al obtener el access token:', responseToken.statusText);
      res.status(500).json({ error: 'Error al obtener el access token' });
    }
  } catch (error) {
    console.error('Error en el proceso de pago:', error);
    res.status(500).json({ error: 'Error en el proceso de pago' });
  }
});


app.post('/consultar_estado_cobro', async (req, res) => {
  const formData = req.body;
  try {
    if (cobroURL) {
      const response = await fetch(`https://cobru.me/cobru_detail/${cobroURL}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Authorization': `Bearer ${aToken}`,
          'Content-Type': 'application/json',
          'x-api-key': process.env.x_api_key
        }
      });

      if (response.status === 200) {
    
        const cobroest = await response.json();
        
        cobroest.amountUS =Math.floor(cobroest.amount/Dolar)
        res.json({cobroest});
        if (cobroest.state==3 && activador_estado){
          const psql = 'INSERT INTO Registros.Pagos_Realizados (nombres,,montoUSD,montoCOP) VALUES (?, ?, ?)';
          const pvalues = [
            formData.nombres,
            Math.floor(cobroest.amount/Dolar),
            cobroest.amount 
          ]
          activador_estado=false;
          db.query(psql, pvalues, (err, result) => {
            if (err) {
              console.error('Error al insertar datos en la base de datos:', err)
            } else {
              console.log('Pago ingresado correctamente');
            }
          });
        }
      } else {
        console.error('Error al consultar el estado del Cobro:', response.statusText);
        res.status(500).json({ error: 'Error al consultar el estado del Cobro' });
      }
    }
  } catch (error) {
    console.error('Error al consultar el estado del Cobro:', error);
    res.status(500).json({ error: 'Error al consultar el estado del Cobro' });
  }

 
});

app.post('/datos_usuarios', (req, res) => {
  const formData = req.body;
 
  const query = 'SELECT DISTINCT nombres, apellidos FROM Registros.Registro_conferencia where documento ='+formData.doc;
  
  // Ejecutar el query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing the query:', err);
      res.status(500).json({ error: 'Error obtaining names and surnames' });
    } else {
      // Extract names and surnames from the results
      let user=''
      if(results.length>0){
       user= results[0].nombres+" "+results[0].apellidos;
    }
      res.json(user);
    }
  });
});

app.post('/pagos_extras', (req, res) => {
 const formData = req.body; 
  if (formData.npgextras>0 && formData.nartextras==0){
  cobro=50*formData.npgextras
  }else if (formData.nartextras>0 && formData.npgextras==0){
    cobro=70*formData.nartextras
   
  } else {
    cobro=50*formData.npgextras+70*formData.nartextras
  
  }

  // Envía la respuesta al cliente
  res.json({ cobro });
});

 
app.post('/send_email', async (req, res) => {
  const formData = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.email_user,
      pass: process.env.email_password,
    },
  });

  try {

    const htmlContent = `
    <b>Hemos recibido tu registro al IEEE Colombian Caribbean Conference</b>
    <p>Tu registro es el siguiente:</p>
    <p>Nombre: ${formData.nombre} ${formData.apellidos}</p>
    <p>Pais: ${formData.pais}</p>
    <p>Ciudad: ${formData.ciudad}</p>
    <p>Direccion: ${formData.direccion}</p>
    <p>Sexo: ${formData.sexo}</p>
    <p>Fecha de Nacimiento: ${formData.fechaNacimiento}</p>
    <p>Documento: ${formData.tdoc}: ${formData.doc}</p>
    <p>Afiliacion institucional: ${formData.afiliacion}</p>
    <p>Correo: ${formData.correo}</p>
    <p>Telefono: ${formData.telefono}</p>
    <p>Oficio: ${formData.oficio}</p>
    <p>Tipo de Participacion: ${formData.tipoParticipacion}</p>
    ${formData.esMiembroIEEE === true ? '<p> Es miembro IEEE con numero de Membresia : '+formData.numeroMembresia+ ' </p>' : ''}
    <b>Gracias por tu información</b>`;
   
   /* ${formData.tipoParticipacion === 'Asistente' ? '<p>Esto es para asistentes.</p>' : ''}*/
    const info = await transporter.sendMail({
      from: '"IEEE C3" <cesarvilorian@ieee.org>',
      to: formData.correo,
      subject: 'Confirmación de Registro al IEEE Colombian Caribbean Conference',
      html:htmlContent,
    });

    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Something went wrong while sending the email' });
  }
});


app.get('/visualizar', async (req, res) => {
  try {

    const query='SELECT * FROM Registro_conferencia'
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing the query:', err);
        res.status(500).json({ error: 'Error obtaining names and surnames' });
      } else {
        res.json(results);  // Cambiado a res.json(results)
      }
    });
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
    });
   
app.get('/tablas', (req, res) => {
  res.sendFile(path.join(__dirname, 'tablas.html'));
});


 async function actualizarValorDolar() {
   try {
    const apiKey = '25e77a0caf79fe69d47073401031df33';  // Reemplaza con tu API key
    const apiUrl = `http://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}& base = USD`;
    

    const response = await axios.get(apiUrl);

    if (response.data.success) {
       const rates = response.data.rates;
       if (rates && rates.COP) {
         // Actualizar el valor de Dolar con la tasa de cambio actual del dólar en pesos
         peso=rates.COP
         Deuro=rates.USD
         Dolar = peso/Deuro
        console.log('Tasa de cambio actual del dólar en pesos:', Dolar);
      } else {
         console.error('No se pudo obtener la tasa de cambio del dólar.');
       }
     } else {
      console.error('No se pudo obtener la respuesta de la API.');
         }
   } catch (error) {
     console.error('Error al obtener la tasa de cambio del dólar:', error.message);
  }
 }


const intervaloActualizacion = 12 * 60 * 60 * 1000; // 12 horas en milisegundos
setInterval(actualizarValorDolar, intervaloActualizacion);

// Llama a la función para actualizar el valor del dólar inmediatamente al iniciar la aplicación
actualizarValorDolar();

});