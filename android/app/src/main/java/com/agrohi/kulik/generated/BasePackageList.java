package com.agrohi.kulik.generated;

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class BasePackageList {
  public List<Package> getPackageList() {
    return Arrays.<Package>asList(
        new expo.modules.av.AVPackage(),
        new expo.modules.constants.ConstantsPackage(),
        new expo.modules.google.signin.GoogleSignInPackage(),
        new expo.modules.splashscreen.SplashScreenPackage()
    );
  }
}
