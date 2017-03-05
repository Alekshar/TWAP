

# TamagochIoT



## Usage

 First, if you have a service running in port 80, stop it.
 For example,
 ```bash
 sudo service apache2 stop
 ```
 Second, you must have a mongoDB server running. We recommend to use a doncker image.
 ```bash
 docker pull mongo
 docker run --name mongo-example -p 127.0.0.1:27017:27017 -d mongo
 ```
 And then, you can execute.
 ```bash
 git clones https://github.com/Alekshar/TamagochIoT.git
 sudo node server-central.js
 node server-local.js
 ```
 Enter your credentials. And you can go at [localhost](http://127.0.0.1 "localhost") on your favorite browser.
## Developing



### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
