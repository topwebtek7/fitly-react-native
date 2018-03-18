package com.thefitlyapp;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.beefe.picker.PickerViewPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.imagepicker.ImagePickerPackage;
import io.fullstack.firestack.FirestackPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.calendarevents.CalendarEventsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.magus.fblogin.FacebookLoginPackage;
import com.devfd.RNGeocoder.RNGeocoderPackage; // <--- import

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new VectorIconsPackage(),
            new PickerViewPackage(),
            new MapsPackage(),
            new ImagePickerPackage(),
            new FirestackPackage(),
            new RNFetchBlobPackage(),
            new CalendarEventsPackage(),
            new PickerPackage(),
            new ReactNativeContacts(),
            new RNGeocoderPackage(),
            new FacebookLoginPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
