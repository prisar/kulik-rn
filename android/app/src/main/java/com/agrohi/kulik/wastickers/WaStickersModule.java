package com.agrohi.kulik.wastickers;

import android.content.Intent;
import com.agrohi.kulik.wastickers.activities.DashboardActivity;
import com.agrohi.kulik.wastickers.utils.StickerBook;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class WaStickersModule  extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    WaStickersModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "WaStickers";
    }

    // addStickerPackToWhatsApp
    @ReactMethod
    public void memes(Promise promise) {
        StickerBook.init(getReactApplicationContext());
        Intent intent = new Intent(getReactApplicationContext(), DashboardActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

}
