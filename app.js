// kurulmuş olan uygulama web sitesi
http.createServer( function (request, response) {    
    // site url'si yapıştır 
    var pathname = url.parse(request.url).pathname;  
      
    // Konsol verilerinde nasıl kayıt işlenmesi  
    console.log("Request for " + pathname + " received.");  
      
    // onaylanmış sistem dosyalarını görüntülem bölümü  
    fs.readFile(pathname.substr(1), function (err, data) {  
       if (err) {  
          console.log(err);  
          // HTTP Status: 404 : NOT FOUND  (DOKUNMA)
          // Content Type: text/plain  
          response.writeHead(404, {'Content-Type': 'text/html'});  
       }else{      
          //Page found       (DOKUNMA)
          // HTTP Status: 200 : OK  
          // Content Type: text/plain  
          response.writeHead(200, {'Content-Type': 'text/html'});      
            
            
          response.write(data.toString());         
       }  
       // TEKRARLAMA   
       response.end();  
    });     
 }).listen(8081);  
 // KONSOL DA YAZACAK ÇALIŞTIR.EXE NİN SİTE KODU  
 console.log('Server running at http://130.022.015.44.215.153.387.99/');  