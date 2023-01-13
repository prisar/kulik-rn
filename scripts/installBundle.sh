
adb uninstall com.agrohi.kulik

bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=out/my_app.apks

bundletool install-apks --apks=out/my_app.apks

rm out/my_app.apks