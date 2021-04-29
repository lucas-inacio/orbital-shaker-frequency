# orbital-shaker-frequency
It's an app designed to measure the frequency of an orbital shaker (those used in labs). By taking samples from the smartphone's accelerometer it can estimate the number of rotations per minute (RPM) at which the orbital shaker is moving.

### Operation
The smartphone must be fixed over the center of the plate in the orbital shaker on the horizontal direction.

### Dependencies
This project is based on expo an uses the following libraries:
* expo-gl
* expo-2d-context
* dsp.js (https://github.com/corbanbrook/dsp.js/)

### Running
Inside the repo's directory type:
```
npm install
npm start
```
This will open a browser allowing you to run the application on your phone by simply reading a QR code from Expo-Go app.

### Building
This will schedule a build task for the platform of your choice. You must provide credentials for your expo account. Of course you can always eject the project and deal with react-native yourself.
```
expo build:<android:ios>
```
