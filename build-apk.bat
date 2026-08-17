@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot"
set "ANDROID_HOME=C:\Users\Dell E5570\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo Accepting licenses...
echo y | sdkmanager.bat --licenses

echo Installing SDK packages...
sdkmanager.bat "platforms;android-34" "build-tools;34.0.0" "platform-tools"

echo Building APK...
cd /d "%~dp0android"
call gradlew.bat assembleDebug

echo Done!
pause
