package com.agrohi.kulik.wastickers.utils;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.util.Log;
import android.widget.Toast;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.models.Image;

import java.util.ArrayList;

public class GlobalClass {

    public static Integer[] text_color = {R.color.black, R.color.white, R.color.colorPrimary, R.color.yellow, R.color.red,
            R.color.blue, R.color.green, R.color.pink, R.color.orange, R.color.darkred, R.color.darkgreen,
            R.color.purple, R.color.deepPurple, R.color.indigo, R.color.cyan, R.color.teal, R.color.lightGreen,
            R.color.red_color_picker, R.color.orange_color_picker, R.color.lime, R.color.amber, R.color.deepOrange, R.color.brown, R.color.blueGray, R.color.red_color_picker};

    static int[] list = {R.drawable.sticker_1, R.drawable.sticker_2, R.drawable.sticker_3, R.drawable.sticker_4, R.drawable.sticker_5, R.drawable.sticker_6, R.drawable.sticker_7, R.drawable.sticker_8, R.drawable.sticker_9, R.drawable.sticker_10, R.drawable.sticker_11, R.drawable.sticker_12, R.drawable.sticker_13, R.drawable.sticker_14, R.drawable.sticker_15, R.drawable.sticker_16, R.drawable.sticker_17, R.drawable.sticker_18, R.drawable.sticker_19, R.drawable.sticker_20, R.drawable.sticker_21, R.drawable.sticker_22, R.drawable.sticker_23, R.drawable.sticker_24, R.drawable.sticker_25, R.drawable.sticker_26, R.drawable.sticker_27, R.drawable.sticker_28, R.drawable.sticker_29, R.drawable.sticker_30, R.drawable.sticker_31, R.drawable.sticker_32, R.drawable.sticker_33, R.drawable.sticker_34, R.drawable.sticker_35, R.drawable.sticker_36, R.drawable.sticker_37, R.drawable.sticker_38, R.drawable.sticker_39, R.drawable.sticker_40, R.drawable.sticker_41, R.drawable.sticker_42, R.drawable.sticker_43, R.drawable.sticker_44, R.drawable.sticker_45, R.drawable.sticker_46, R.drawable.sticker_47, R.drawable.sticker_48, R.drawable.sticker_49, R.drawable.sticker_50, R.drawable.sticker_51, R.drawable.sticker_52, R.drawable.sticker_53, R.drawable.sticker_54, R.drawable.sticker_55, R.drawable.sticker_56, R.drawable.sticker_57, R.drawable.sticker_58, R.drawable.sticker_59, R.drawable.sticker_60, R.drawable.sticker_61, R.drawable.sticker_62, R.drawable.sticker_63, R.drawable.sticker_64, R.drawable.sticker_65, R.drawable.sticker_66, R.drawable.sticker_67, R.drawable.sticker_68, R.drawable.sticker_69, R.drawable.sticker_70, R.drawable.sticker_71, R.drawable.sticker_72, R.drawable.sticker_73, R.drawable.sticker_74, R.drawable.sticker_75, R.drawable.sticker_76, R.drawable.sticker_77, R.drawable.sticker_78, R.drawable.sticker_79, R.drawable.sticker_80, R.drawable.sticker_81, R.drawable.sticker_82, R.drawable.sticker_83, R.drawable.sticker_84, R.drawable.sticker_85, R.drawable.sticker_86, R.drawable.sticker_87, R.drawable.sticker_88, R.drawable.sticker_89, R.drawable.sticker_90, R.drawable.sticker_91, R.drawable.sticker_92, R.drawable.sticker_93, R.drawable.sticker_94, R.drawable.sticker_95, R.drawable.sticker_96, R.drawable.sticker_97, R.drawable.sticker_98, R.drawable.sticker_99, R.drawable.sticker_100, R.drawable.sticker_101, R.drawable.sticker_102, R.drawable.sticker_103, R.drawable.sticker_104, R.drawable.sticker_105, R.drawable.sticker_106, R.drawable.sticker_107, R.drawable.sticker_108, R.drawable.sticker_109, R.drawable.sticker_110, R.drawable.sticker_111, R.drawable.sticker_112, R.drawable.sticker_113, R.drawable.sticker_114, R.drawable.sticker_115, R.drawable.sticker_116, R.drawable.sticker_117, R.drawable.sticker_118, R.drawable.sticker_119, R.drawable.sticker_120, R.drawable.sticker_121, R.drawable.sticker_122, R.drawable.sticker_123, R.drawable.sticker_124, R.drawable.sticker_125, R.drawable.sticker_126, R.drawable.sticker_127, R.drawable.sticker_128, R.drawable.sticker_129, R.drawable.sticker_130, R.drawable.sticker_131, R.drawable.sticker_132, R.drawable.sticker_133, R.drawable.sticker_134, R.drawable.sticker_135, R.drawable.sticker_136, R.drawable.sticker_137, R.drawable.sticker_138, R.drawable.sticker_139, R.drawable.sticker_140, R.drawable.sticker_141, R.drawable.sticker_142, R.drawable.sticker_143, R.drawable.sticker_144, R.drawable.sticker_145, R.drawable.sticker_146, R.drawable.sticker_147, R.drawable.sticker_148, R.drawable.sticker_149, R.drawable.sticker_150, R.drawable.sticker_151, R.drawable.sticker_152, R.drawable.sticker_153, R.drawable.sticker_154, R.drawable.sticker_155, R.drawable.sticker_156, R.drawable.sticker_157, R.drawable.sticker_158, R.drawable.sticker_159, R.drawable.sticker_160, R.drawable.sticker_161, R.drawable.sticker_162, R.drawable.sticker_163, R.drawable.sticker_164, R.drawable.sticker_165, R.drawable.sticker_166, R.drawable.sticker_167, R.drawable.sticker_168, R.drawable.sticker_169, R.drawable.sticker_170, R.drawable.sticker_171, R.drawable.sticker_172, R.drawable.sticker_173, R.drawable.sticker_174, R.drawable.sticker_175, R.drawable.sticker_176, R.drawable.sticker_177, R.drawable.sticker_178, R.drawable.sticker_179, R.drawable.sticker_180, R.drawable.sticker_181, R.drawable.sticker_182, R.drawable.sticker_183, R.drawable.sticker_184, R.drawable.sticker_185, R.drawable.sticker_186, R.drawable.sticker_187, R.drawable.sticker_188, R.drawable.sticker_189, R.drawable.sticker_190, R.drawable.sticker_191, R.drawable.sticker_192, R.drawable.sticker_193, R.drawable.sticker_194, R.drawable.sticker_195, R.drawable.sticker_196, R.drawable.sticker_197, R.drawable.sticker_198, R.drawable.sticker_199, R.drawable.sticker_200};

    public static ArrayList<Integer> getColorArray() {
        ArrayList<Integer> imagesSticker = new ArrayList<>();
        for (int i = 0; i < text_color.length; i++) {
            imagesSticker.add(text_color[i]);
        }
        return imagesSticker;
    }

    public static ArrayList<String> getFontArray(Context applicationContext) {
        try {
            ArrayList<String> fontList = new ArrayList<>();
            AssetManager assetManager = applicationContext.getAssets();
            String[] foldersFontsList = assetManager.list("All_Fonts");
//            String[] foldersFontsList = assetManager.list(applicationContext.getString(R.string.txt_assetsFontFolderName));
            Log.e("---------", "---foldersFontsList----" + foldersFontsList.length);

            if (foldersFontsList != null) {
                for (String fontName : foldersFontsList) {
                    fontList.add(applicationContext.getString(R.string.txt_assetsFontFolderName) + fontName);
                }
                return fontList;
            } else {
                return new ArrayList<>();
            }
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public static ArrayList<Image> getStickerArray() {
        ArrayList<Image> imagesSticker = new ArrayList<>();
        for (int i = 0; i < list.length; i++) {
            Image image = new Image(list[i]);
            imagesSticker.add(image);
        }
        return imagesSticker;
    }

    public static boolean checkIsWhatsappExitsOrNot(String uri, Context context) {
        PackageManager pm = context.getPackageManager();
        boolean app_installed;
        try {
            pm.getPackageInfo(uri, PackageManager.GET_ACTIVITIES);
            app_installed = true;
        } catch (PackageManager.NameNotFoundException e) {
            app_installed = false;
            Toast.makeText(context, "Please install whatsapp.", Toast.LENGTH_SHORT).show();
        }
        return app_installed;
    }

    public static void showFailPopup(final Context context, String strError) {
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setMessage(strError)
                .setTitle("Error")
                .setCancelable(false)
                .setNegativeButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.dismiss();
                    }
                });
        final AlertDialog alert = builder.create();
        alert.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface arg0) {
                alert.getButton(AlertDialog.BUTTON_NEGATIVE).setTextColor(context.getResources().getColor(R.color.colorPrimary));
            }
        });
        alert.show();
    }
}