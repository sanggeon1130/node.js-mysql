var db = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

    
exports.home = function(request, response){
    db.query('SELECT * FROM topic', function(error, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<p><a href="/create">create</a></p>`
        );
        response.writeHead(200);
        response.end(html);
      })

}

exports.page = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query('SELECT * FROM topic', function(error, topics){
        if(error){
         throw error;
        }
      db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id =?`,[queryData.id], function(error2, topic){
          if(error2){
            throw error2
          }
          console.log('topic: ',topic);
          console.log('title', topic[0].title)
         var title = topic[0].title;
         var description = topic[0].description;
         var name = topic[0].name;
         var list = template.list(topics);
         var html = template.HTML(title, list,
           `<h2>${title}</h2>${description}
           <p>by ${name}</p>
           `,
           ` <a href="/create">create</a>
               <a href="/update?id=${queryData.id}">update</a>
               <form action="delete_process" method="post">
                 <input type="hidden" name="id" value="${queryData.id}">
                 <input type="submit" value="delete">
               </form>`
         );
         response.writeHead(200);
         response.end(html);
        })
       
     })
}

exports.create = function(request, response){
  db.query('SELECT * FROM topic', function(error, topics){
    db.query('SELECT * FROM author', function(error, authors){
    var tag = template.authorSelect(authors);
    var title = 'WEB - create';
    var list = template.list(topics);
    var html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
        <select name ="author">
        ${tag}
        </select>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.writeHead(200);
    response.end(html);
    })
    
  });
}

exports.create_process = function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
    db.query(
      `INSERT INTO topic(title,description,created,author_id) 
       VALUES(?,?,NOW(),?)`,
       [post.title,post.description,post.author],
       function(err, results){
         if(err){
           throw err;
         }
         response.writeHead(302, {Location:`/?id=${results.insertId}`});
         response.end();
       }
       )
  });
}

exports.update = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
  db.query('SELECT * FROM topic', function(error, topics){
    db.query(`SELECT * FROM topic WHERE id =?`,[queryData.id], function(error2, topic){
      if(error2){
        throw error2;
      }db.query('SELECT * FROM author', function(error, authors){
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var tag = template.authorSelect(authors,topic[0].author_id);
        var html = template.HTML(title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${queryData.id}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
            <select name = "author">
            ${tag}
            </select>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
      
    });
  });
}

exports.update_process = function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      db.query('UPDATE topic SET title=?, description=?,author_id=? WHERE id=?;',[post.title,post.description,post.author,post.id],function(error, results){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location:`/?id=${post.id}`});
        response.end();

      })
  });
}

exports.delete_process = function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      db.query(`DELETE FROM topic WHERE id=?;`,[post.id],function(error, results){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location:`/`});
        response.end();
      })
  });
}