#Datea

Ionic (http://ionicframework.com) and Apache Cordova based mobile app for Datea. 

Datea is a corwdsourcing and civic engagement platform to create and visualize citizen reports (dateos) in maps, picture galleries, timelines and charts. It's mail goal is to allow citizens to share and visualize useful information for any purpose. It's flexibel, hashtag based structure allows anyone to create a map, timeline or gallery just by creating a report (dateo) using a hashtag. Furthermore, report iniciatives can be created by organizations such as NGOs, local governments and activists, which allow them to campaign for certain issues in order to obtain useful information from citizens (dateros).

If you are interested in using or contributing to this project, or want to know a litle bit more about us or the plattform, please feel free to contact us at contacto@datea.pe or via gitter (datea-gitter channel). For special a deployment or new feature, we also provide commercial support.

The Datea Team

#Datea Mobile

This mobile app allows users to create citizen reports and navigate/visualize them in maps. It's thought as a data recolection system for the Datea platform. Thus, it's feature set is more limited, though simpler in structure, than it's counterpart in the web. 

This mobile client is built on ionic (http://ionicframework.com), which means angularjs and scss. Maps use the leaflet library. 

##Installation
This ionic setup was built with this ionic gulp generator, in order to allow compilation of the source (https://github.com/tmaximini/generator-ionic-gulp).

1. Make sure you got ionic, cordova and gulp installed: npm install -g ionic cordova gulp
2. clone this repo: git clone https://github.com/lafactura/datea-mobile.git
3. cd datea-mobile
4. npm install; bower install
5. to use our oauth authentication during development: 
  - install oauth-js: bower install oauth-js
  - in bower_components/oauth-js/dist/oauth.js change references to https://oauth.io and https://oauth.io/api to https://datea.io:57 and https://datea.io:57/api respectively
  - add 'bower_components/oauth-js/dist/oauth.js' to vendor.json. Keep in mind that you need to remove that line in vendor.json when using the oauthjs cordova plugin while running on a phone.
6. Run 'gulp' and the app should appear on your default browser.

##Test on android/ios
1. install cordova plugins: sh install-cordova-plugins.sh
2. to use our oauth authentication, you need to change oauthd cordova plugin settings to point to Datea's own installation of oauthd [http://oauth.io] (Optional): 
  (vim or whatever) plugins/com.oauthio.plugins.oauthio/www/dist/oauth.js  
  -> change https://oauth.io to https://datea.io:57, and https://oauth.io/api to https://datea.io:57/api
3. generate the desired platforms: "ionic platform add ios" and/or "ionic platform add android"
4. To test on android: "gulp --build; ionic run android"

Feel free to contact us if you wish to contribute to this project at contacto@datea.pe or using the datea-gitter channel on gitter. We also offer comercial support.

See the LICENSE.txt file for details about the license.
