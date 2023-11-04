const bodyParser = require('body-parser');
const express = require('express');
/** json 파일 읽기 */ 
const fs = require('fs');
const dataBuffer = fs.readFileSync('secret.json');
const dataJSON = dataBuffer.toString();
const data = JSON.parse(dataJSON);
const mysql = require('mysql');
const connection = mysql.createConnection({
  host : data.host,
  port : data.port,
  user : data.user,
  password : data.password,
  database : data.database,
});
connection.connect((err)=>{
  if(err) {
    console.error("MySQL 연결 오류 : ",err);
    return;
  }
  console.log("Connect 성공!");
})
const app = express();
/** 암호화 모듈 */
const crypto = require('crypto');

app.set("views",__dirname+"/views");
app.use(express.static("static"));
app.set("view engine", "ejs"); // 뷰 엔진을 EJS로 설정
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
const query  = require("express");

const router = require("./routes/main")(app,connection,crypto,query);

// 서버를 3000번 포트로 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
})