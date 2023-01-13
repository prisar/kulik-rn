package com.agrohi.kulik.wastickers.utils;

import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.os.StrictMode;
import android.provider.MediaStore;

import com.agrohi.kulik.R;

import java.io.File;
import java.util.ArrayList;

public class ExternalPacksManager {
    public static void sendStickerPackZipThroughWhatsApp(Context context, String id) {
        try {
            StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
            StrictMode.setVmPolicy(builder.build());

            FilesUtils.handleCopyFilesToSdCard(context, id);

            Uri uri = Uri.fromFile(new File(
                    Environment.getExternalStorageDirectory().getAbsolutePath()
                            + "/" + context.getString(R.string.app_name)
                            + "/" + id + ".zip")
            );

            Uri noticeImage = Uri.parse(MediaStore.Images.Media.insertImage(context.getContentResolver(),
                    BitmapFactory.decodeResource(context.getResources(), R.mipmap.ic_launcher), null, null));

            Intent share = new Intent();
            share.setAction(Intent.ACTION_SEND_MULTIPLE);
            share.setType("*/*");
            share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            ArrayList<Uri> files = new ArrayList<Uri>();
            files.add(noticeImage);
            files.add(uri);

            //share.putExtra(Intent.EXTRA_STREAM, uri);
            share.putParcelableArrayListExtra(Intent.EXTRA_STREAM, files);

            //share.setPackage("com.whatsapp"); //hear...

            context.startActivity(share);
        } catch (Exception e) {
        }
    }
}

