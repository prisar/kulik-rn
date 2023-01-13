package com.agrohi.kulik.wastickers.utils;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.agrohi.kulik.BuildConfig;
import com.agrohi.kulik.R;

import java.io.File;

public class GlobalFun {
    public static final String BASE_URL = BuildConfig.API_ENDPOINT;
    public static final String API_TOKEN = BuildConfig.API_TOKEN;



    public static final String APIKeyAuthToken = "Auth-Token";

    public static final String KeyDetailStickersList = "DetailStickersList";
    public static final String KeyStickerPackList = "StickerPackList";

    public static final String AndroidPlayStore_Link = "https://play.google.com/store/apps/details?id=" + "com.agrohi.kulik"; // BuildConfig.APPLICATION_ID; //"also you can put link hear"
    public static final String IosAppStore_Link = "";

    public static final int STICKER_PREVIEW_DISPLAY_LIMIT = 5;

    public void openActivity(Context context, Class<?> className) {
        context.startActivity(new Intent(context, className));
    }

    public void openActivity(Context context, Class<?> className, String jsonData) {
        Intent intent = new Intent(context, className);
        intent.putExtra("Key", jsonData);
        context.startActivity(intent);
    }

    public void showToast(Context context, String message) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
    }

    public void showToast(Context context, int message) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
    }

    public void showLog(String Tag, String message) {
        Log.e(Tag, message);
    }

    public void showSnackBar(View layout, String message) {
//        Snackbar snackbar = Snackbar.make(layout, message, Snackbar.LENGTH_LONG);
//        snackbar.show();
    }

    public void RateUsApp(Context context, String destPkgName) {
        Uri uri = Uri.parse("market://details?id=" + destPkgName);
        Intent goToMarket = new Intent(Intent.ACTION_VIEW, uri);
        goToMarket.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY |
                Intent.FLAG_ACTIVITY_NEW_DOCUMENT |
                Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
        try {
            context.startActivity(goToMarket);
        } catch (ActivityNotFoundException e) {
            context.startActivity(new Intent(Intent.ACTION_VIEW,
                    Uri.parse("http://play.google.com/store/apps/details?id=" + destPkgName)));
        }
    }

    public void moreApp(Context context) {
//        Uri uri = Uri.parse("https://play.google.com/store/apps/developer?id=" + context.getString(R.string.MoreAppKeyWord)); // missing 'http://' will cause crashed
//        Intent intent6 = new Intent(Intent.ACTION_VIEW, uri);
//        context.startActivity(intent6);
    }

    public void shareApp(Context context) {
        Intent i = new Intent(Intent.ACTION_SEND);
        i.setType("text/plain");
        String shareText = "Invite you to install this app : https://play.google.com/store/apps/details?id=" + context.getPackageName();
        i.putExtra(Intent.EXTRA_TEXT, shareText);
        context.startActivity(Intent.createChooser(i, "Share App"));
    }

    public void privacyPolicy(Context context) {
        //startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("http://shopostreet.in/WAStickers_Privacy_Policy.html")));
//        context.startActivity(new Intent(context, PrivacyPolicyActivity.class));
    }

    public static boolean isInternetConnected(Context context) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null &&
                activeNetwork.isConnectedOrConnecting();
    }

    public static void internetFailedDialog(Context context) {
        try {
            AlertDialog alertDialog = new AlertDialog.Builder(context).create();
            alertDialog.setTitle("Info");
//            alertDialog.setMessage(context.getString(R.string.labal_no_internet_connection));
            alertDialog.setButton(Dialog.BUTTON_POSITIVE, "OK", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog, int which) {
                    alertDialog.dismiss();
                }
            });
            alertDialog.show();
        } catch (Exception e) {
        }
    }

    public static void deleteRecursive(File fileOrDirectory) {
        if (fileOrDirectory.isDirectory()) {
            for (File child : fileOrDirectory.listFiles()) {
                deleteRecursive(child);
            }
        }
        fileOrDirectory.delete();
    }
}
