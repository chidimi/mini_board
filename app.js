'use strict';

const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', "utf-8");
const login_page = fs.readFileSync('./login.ejs', "utf-8");

const max_num = 10;
const filename = 'mydata.txt';
let message_data;
readFromFile(filename);

let server = http.createServer(getFromClient);

server.listen(3000);
console.log('server start');

function getFromClient(req, res){
  const url_parts = url.parse(req.url, true);

  switch(url_parts.pathname){

    case '/':
      response_index(req, res);
      break;

    case '/login':
      response_login(req, res);
      break;

    default:
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('no page');
      break;
  }
}

function response_login(req, res){
  const content = ejs.render(login_page, {});
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(content);
  res.end();
}

function response_index(req, res){
  if(req.method === 'POST'){
    let body = '';

    req.on('data', (data) => {
      body += data;
    });

    req.on('end', function() {
      let data = qs.parse(body);
      addToData(data.id, data.msg, filename, req);
      write_index(req, res);
    });
  } else {
    write_index(req, res);
  }
}

function write_index(req, res){
  const msg = '※なにかメッセージを書いてください'
  const content = ejs.render(index_page, {
    title: 'index',
    content: msg,
    data: message_data,
    filename: 'data_item',
  });
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(content);
  res.end();
}

function readFromFile(fname) {
  fs.readFile(fname, 'utf8', (err, data) => {
    message_data = data.split('\n');
  })
}

function addToData(id, msg, filename, req) {
  const obj = { 'id': id, 'msg': msg};
  const obj_str  = JSON.stringify(obj);
  console.log('add data: ' + obj_str);
  message_data.unshift(obj_str);
  if(message_data.length > max_num) {
    message_data.pop();
  }
  saveToFile(filename);
}

function saveToFile(fname) {
  const data_str = message_data.join('\n');
  fs.writeFile(fname, data_str, (err) => {
    if(err) {throw err;}
  });
}