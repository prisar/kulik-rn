package com.agrohi.kulik.wastickers.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.util.Base64;

public class ImageManipulation {

   /* public static Uri convertImageToWebP(Uri uri, String StickerBookId, String StickerId, Context context) {
        try {
            Bitmap bitmap = null;
            try {
                bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
            } catch (Exception e) {
                e.printStackTrace();
                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inJustDecodeBounds = true;
                BitmapFactory.decodeFile(uri.toString(), options);
                final int REQUIRED_SIZE = 512;
                int scale = 1;
                while (options.outWidth / scale / 2 >= REQUIRED_SIZE && options.outHeight / scale / 2 >= REQUIRED_SIZE)
                    scale *= 2;
                options.inSampleSize = scale;
                options.inJustDecodeBounds = false;
                bitmap = BitmapFactory.decodeFile(uri.toString(), options);
                //Bitmap b = BitmapFactory.decodeFile(uri.toString(), options);
                //bitmap = scaleBitmap(b, 512, 512);
            }

            dirChecker(context.getFilesDir() + "/" + StickerBookId);

            String path = context.getFilesDir() + "/" + StickerBookId + "/" + StickerBookId + "-" + StickerId + ".webp";

            *//*FileOutputStream out = new FileOutputStream(path);
            bitmap = Bitmap.createScaledBitmap(bitmap, 512, 512, true);
            Log.w("IMAGE SIZE before comperssion", ""+FilesUtils.getUriSize(Uri.fromFile(new File(path)), context));
            bitmap.compress(Bitmap.CompressFormat.WEBP, 100, out); //100-best quality
            Log.w("IMAGE SIZE first", ""+FilesUtils.getUriSize(Uri.fromFile(new File(path)), context));
            *//*
            makeSmallestBitmapCompatible(path, bitmap);
            return Uri.fromFile(new File(path));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return uri;
    }*/

    public static Uri convertImageToWebP(boolean isAnimated, Uri uri, String StickerBookId, String StickerId, Context context) {
        try {
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
            dirChecker(context.getFilesDir() + "/" + StickerBookId);
            String path = context.getFilesDir() + "/" + StickerBookId + "/" + StickerBookId + "-" + StickerId + ".webp";
            makeSmallestBitmapCompatible(isAnimated, path, bitmap);

            return Uri.fromFile(new File(path));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return uri;
    }

    public static Uri convertImageToWebP(boolean isAnimated, String stickerPath, String StickerBookId, String StickerId, Context context) {
        try {
            AssetManager assetManager = context.getAssets();
            InputStream istr = assetManager.open(stickerPath);
            Bitmap bitmap = BitmapFactory.decodeStream(istr);
            dirChecker(context.getFilesDir() + "/" + StickerBookId);
            String path = context.getFilesDir() + "/" + StickerBookId + "/" + StickerBookId + "-" + StickerId + ".webp";
            makeSmallestBitmapCompatible(isAnimated, path, bitmap);

            return Uri.fromFile(new File(path));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Uri.parse(stickerPath);
    }

    public static Uri convertIconTrayToWebP(boolean isAnimated, Uri uri, String StickerBookId, String StickerId, Context context) {
        try {
            Bitmap bitmap = null;
            try {
                bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
            } catch (Exception e) {
                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inJustDecodeBounds = true;
                BitmapFactory.decodeFile(uri.toString(), options);
                final int REQUIRED_SIZE = 96;
                int scale = 1;
                while (options.outWidth / scale / 2 >= REQUIRED_SIZE && options.outHeight / scale / 2 >= REQUIRED_SIZE)
                    scale *= 2;
                options.inSampleSize = scale;
                options.inJustDecodeBounds = false;
                Bitmap b = BitmapFactory.decodeFile(uri.toString(), options);
                bitmap = scaleBitmap(b, 96, 96);
            }

            dirChecker(context.getFilesDir() + "/" + StickerBookId);

            String path = context.getFilesDir() + "/" + StickerBookId + "/" + StickerBookId + "-" + StickerId + ".webp";

            Log.w("Conversion Data: ", "path: " + path);

            FileOutputStream out = new FileOutputStream(path);
            bitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true);
            bitmap.compress(Bitmap.CompressFormat.WEBP, 50, out); //100-best quality
            out.close();

            return Uri.fromFile(new File(path));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return uri;
    }

    public static Uri convertIconTrayToWebP(boolean isAnimated, String trayIconAssetsPath, String StickerBookId, String StickerId, Context context) {
        try {
            Bitmap bitmap = null;
            try {
                AssetManager assetManager = context.getAssets();
                InputStream istr = assetManager.open(trayIconAssetsPath);
                bitmap = BitmapFactory.decodeStream(istr);
            } catch (Exception e) {
            }

            dirChecker(context.getFilesDir() + "/" + StickerBookId);

            String path = context.getFilesDir() + "/" + StickerBookId + "/" + StickerBookId + "-" + StickerId + ".webp";

            Log.w("Conversion Data: ", "path: " + path);

            FileOutputStream out = new FileOutputStream(path);
            bitmap = Bitmap.createScaledBitmap(bitmap, 256, 256, true);
            bitmap.compress(Bitmap.CompressFormat.WEBP, 50, out); //100-best quality
            out.close();

            return Uri.fromFile(new File(path));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Uri.parse(trayIconAssetsPath);
    }

    private static void dirChecker(String dir) {
        File f = new File(dir);
        if (!f.isDirectory()) {
            f.mkdirs();
        }
    }

    public static Bitmap scaleBitmap(Bitmap bitmap, int wantedWidth, int wantedHeight) {
        Bitmap output = Bitmap.createBitmap(wantedWidth, wantedHeight, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(output);
        Matrix m = new Matrix();
        m.setScale((float) wantedWidth / bitmap.getWidth(), (float) wantedHeight / bitmap.getHeight());
        canvas.drawBitmap(bitmap, m, new Paint());

        return output;
    }

    private static byte[] getByteArray(Bitmap bitmap, int quality) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        bitmap.compress(Bitmap.CompressFormat.WEBP,
                quality,
                bos);

        return bos.toByteArray();
    }

    private static void makeSmallestBitmapCompatible(boolean isAnimated, String path, Bitmap bitmap) {
        int quality = 45;
        FileOutputStream outs = null;
        try {
            outs = new FileOutputStream(path);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        if (!isAnimated) {
            bitmap = Bitmap.createScaledBitmap(bitmap, 512, 512, true);
        }
        //int byteArrayLength = 100000;
        ByteArrayOutputStream bos = null;
        try {
            //while ((byteArrayLength / 1000) >= 100) {
            bos = new ByteArrayOutputStream();
            if (!isAnimated) {
                bitmap.compress(Bitmap.CompressFormat.WEBP,
                        quality,
                        bos);
            } else {
                bitmap.compress(Bitmap.CompressFormat.WEBP,
                        100,
                        bos);
            }
            //byteArrayLength = bos.toByteArray().length;
            //quality -= 10;
            //}
        } catch (Exception e) {
        }
        try {
            outs.write(bos.toByteArray());
            outs.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

