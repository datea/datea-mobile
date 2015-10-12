#!/bin/bash

cordova plugin rm cordova-plugin-geolocation
cordova plugin add cordova-plugin-geolocation
ionic platform rm ios
ionic platform add ios
ionic prepare ios
