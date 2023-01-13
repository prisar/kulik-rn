package com.agrohi.kulik.wastickers.activities;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.PointF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.adapters.DecorateAdapter;
import com.agrohi.kulik.wastickers.adapters.TextAdapter;
import com.agrohi.kulik.wastickers.adapters.TextColorAdapter;
import com.agrohi.kulik.wastickers.base.BaseActivity;
import com.agrohi.kulik.wastickers.colorpicker.ColorPickerDialog;
import com.agrohi.kulik.wastickers.colorpicker.PropertiesBSFragment;
import com.agrohi.kulik.wastickers.eraser.ImageEraserActivity;
import com.agrohi.kulik.wastickers.interfaces.OnClickFont;
import com.agrohi.kulik.wastickers.interfaces.OnClickListner;
import com.agrohi.kulik.wastickers.models.Image;
import com.agrohi.kulik.wastickers.tools.EmojiBSFragment;
import com.agrohi.kulik.wastickers.utils.DataHolder;
//import com.agrohi.kulik.wastickers.utils.GlideApp;
import com.bumptech.glide.Glide;
import com.agrohi.kulik.wastickers.utils.Global;
import com.agrohi.kulik.wastickers.utils.GlobalClass;
import com.bumptech.glide.load.resource.bitmap.CircleCrop;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.theartofdev.edmodo.cropper.CropImage;
import com.theartofdev.edmodo.cropper.CropImageView;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import ja.burhanrashid52.photoeditor.OnPhotoEditorListener;
import ja.burhanrashid52.photoeditor.OnSaveBitmap;
import ja.burhanrashid52.photoeditor.PhotoEditor;
import ja.burhanrashid52.photoeditor.PhotoEditorView;
import ja.burhanrashid52.photoeditor.ViewType;

public class CreateOwnStickerActivity extends BaseActivity implements OnPhotoEditorListener, PropertiesBSFragment.Properties,
        View.OnClickListener, EmojiBSFragment.EmojiListener {

    ProgressDialog progressDialog;
    public static int Start_Activity_For_Eraser = 101;
    FrameLayout imgStickerMainLayout;
    ImageView btnSelImage, btnUndo, btnRedo;
    private PropertiesBSFragment mPropertiesBSFragment;
    private PhotoEditor mPhotoEditor;
    private PhotoEditorView mPhotoEditorView;
    boolean isMoveImage = false;

    ImageView iv_bgcolor, iv_transparent, imgMove;
    LinearLayout btnDecoration, btnText, btnEmojies, btnEraser, btnBrush, btnMove, lay_textview, linear_editback, iv_txtcolor;

    FrameLayout frame_textview;
    EditText edit_font;
    TextView tv_done;
    String fontstyle[];
    TextView tv_font;
    RecyclerView rl_color;
    LinearLayoutManager horizontalLayoutManagaer;
    private EmojiBSFragment mEmojiBSFragment;
    View viewSelectedTextColor;

    RecyclerView rvDecorate;
    String textString;
    private Typeface typeface;
    int text_color = Color.parseColor("#FFFFFF");
    Global global = new Global();

    //--- ontouch imageview
    private Matrix matrix = new Matrix();
    private Matrix savedMatrix = new Matrix();
    // we can be in one of these 3 states
    private static final int NONE = 0;
    private static final int DRAG = 1;
    private static final int ZOOM = 2;
    private int mode = NONE;

    // remember some things for zooming
    private PointF start = new PointF();
    private PointF mid = new PointF();
    private float oldDist = 1f;
    private float d = 0f;
    private float newRot = 0f;
    private float[] lastEvent = null;
    RelativeLayout.LayoutParams params;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.createownsstickerpack);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(R.string.title_activity_ownsticker);
        }

        progressDialog = new ProgressDialog(this);
        progressDialog.setCancelable(true);
        progressDialog.setCanceledOnTouchOutside(false);
        progressDialog.setMessage("Saving Image");

        imgStickerMainLayout = (FrameLayout) findViewById(R.id.imgStickerMainLayout);
        params = new RelativeLayout.LayoutParams(getScreenWidth(), getScreenWidth());
        imgStickerMainLayout.setLayoutParams(params);

        mEmojiBSFragment = new EmojiBSFragment();
        mEmojiBSFragment.setEmojiListener(this);

        //--------  for text
        linear_editback = findViewById(R.id.linear_editback);
        frame_textview = findViewById(R.id.frame_textview);
        lay_textview = findViewById(R.id.lay_textview);
        edit_font = findViewById(R.id.edit_font);
        tv_font = findViewById(R.id.tv_font);
        iv_bgcolor = findViewById(R.id.iv_bgcolor);
        iv_transparent = findViewById(R.id.iv_transparent);
        iv_txtcolor = findViewById(R.id.iv_txtcolor);
        tv_done = findViewById(R.id.tv_done);
        rl_color = findViewById(R.id.recycle_color);
        viewSelectedTextColor = findViewById(R.id.viewSelectedTextColor);

        btnSelImage = (ImageView) findViewById(R.id.btnSelImage);
        btnMove = findViewById(R.id.btnMove);
        btnUndo = findViewById(R.id.btnUndo);
        btnRedo = findViewById(R.id.btnRedo);
        btnEraser = findViewById(R.id.btnEraser);
        btnBrush = findViewById(R.id.btnBrush);
        btnDecoration = findViewById(R.id.btnDecoration);
        btnEmojies = findViewById(R.id.btnEmojies);
        imgMove = findViewById(R.id.imgMove);
        btnText = findViewById(R.id.btnText);

        //------ photoeditor
        mPhotoEditorView = findViewById(R.id.photoEditorView);
        if (getIntent().getExtras() != null) {
            String resultUri = getIntent().getExtras().getString("resultUri");
            int shape = getIntent().getExtras().getInt("Shape");
            if (shape == 1) {
                Glide.with(this).load(resultUri).into(mPhotoEditorView.getSource());
            } else {
                Glide.with(this).load(resultUri).transform(new CircleCrop()).into(mPhotoEditorView.getSource());
            }
        } else {
            pickImageWithCrop();
        }

        // set fullwidth after set image
        mPhotoEditorView.getSource().setLayoutParams(params);

        mPropertiesBSFragment = new PropertiesBSFragment();
        mPropertiesBSFragment.setPropertiesChangeListener(this);
        mPhotoEditor = new PhotoEditor.Builder(this, mPhotoEditorView)
                .setPinchTextScalable(true)
                .build();
        mPhotoEditor.setOnPhotoEditorListener(this);

        btnSelImage.setOnClickListener(this);
        btnEraser.setOnClickListener(this);
        btnBrush.setOnClickListener(this);
        btnUndo.setOnClickListener(this);
        btnRedo.setOnClickListener(this);
        btnMove.setOnClickListener(this);

        horizontalLayoutManagaer = new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false);
        rl_color.setLayoutManager(horizontalLayoutManagaer);

        btnText.setOnClickListener(this);
        tv_font.setOnClickListener(this);
        iv_bgcolor.setOnClickListener(this);
        iv_transparent.setOnClickListener(this);
        iv_txtcolor.setOnClickListener(this);
        tv_done.setOnClickListener(this);
        btnDecoration.setOnClickListener(this);
        btnEmojies.setOnClickListener(this);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_save, menu);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.ic_menu_save:
                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
                    saveImage();
                } else {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 2000);
                    }
                }
                break;
        }
        return super.onOptionsItemSelected(item);
    }

    /*private void Dialog_updatetext(View rootView, String text, int colorCode) {

        final Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.lyt_dialog_updatename);
        //dialog.setTitle("Title...");

        // set the custom dialog components - text, image and button
        final EditText edstikertext = dialog.findViewById(R.id.edstikertext);
        edstikertext.setText(text);
        edstikertext.requestFocus();

        Button btnok = dialog.findViewById(R.id.btnok);
        Button btncancel = dialog.findViewById(R.id.btncancel);

        btncancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();
            }
        });
        btnok.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                String edited_text = edstikertext.getText().toString().trim();
                if (edited_text.length() == 0) {
                    Toast.makeText(getApplicationContext(), "Add Text", Toast.LENGTH_SHORT).show();
                } else {
                    mPhotoEditor.editText(rootView, edited_text, colorCode);
                    dialog.dismiss();
                }
            }
        });
        dialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE);
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
    }*/

    public int getScreenWidth() {
        DisplayMetrics displayMetrics = new DisplayMetrics();
        WindowManager windowmanager = (WindowManager) getApplicationContext().getSystemService(Context.WINDOW_SERVICE);
        windowmanager.getDefaultDisplay().getMetrics(displayMetrics);
        return displayMetrics.widthPixels;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data); //!
        if (requestCode == CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE) {
            showmPhotoEditorImageView();
            CropImage.ActivityResult result = CropImage.getActivityResult(data);
            if (resultCode == RESULT_OK) {
                Uri resultUri = result.getUri();
                if (result.getCropImageShape() == 1) {
                    //mPhotoEditor.clearAllViews();
                    Glide.with(this).load(resultUri).into(mPhotoEditorView.getSource());
                    mPhotoEditorView.getSource().setLayoutParams(params);
                } else {
                    //mPhotoEditor.clearAllViews();
                    Glide.with(this).load(resultUri).transform(new CircleCrop()).into(mPhotoEditorView.getSource());
                }
            } else if (resultCode == CropImage.CROP_IMAGE_ACTIVITY_RESULT_ERROR_CODE) {
                Exception error = result.getError();
                Toast.makeText(this, "Fail : " + error, Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == Start_Activity_For_Eraser) {
            showmPhotoEditorImageView();
            Bitmap compressedBitmap = BitmapFactory.decodeByteArray(DataHolder.getData(), 0, DataHolder.getData().length);
            mPhotoEditorView.getSource().setImageBitmap(compressedBitmap);
        }
    }

    @Override
    public void onColorChanged(int colorCode) {
        mPhotoEditor.setBrushColor(colorCode);
    }

    @Override
    public void onOpacityChanged(int opacity) {
        mPhotoEditor.setOpacity(opacity);
    }

    @Override
    public void onBrushSizeChanged(int brushSize) {
        mPhotoEditor.setBrushSize(brushSize);
    }

    @Override
    public void onEditTextChangeListener(View rootView, String text, int colorCode, Typeface fontTypeface) {
        //Dialog_updatetext(rootView, text, colorCode);
        showTextLayout(text, rootView, colorCode, fontTypeface);
    }

    @Override
    public void onAddViewListener(ViewType viewType, int numberOfAddedViews) {
    }

    @Override
    public void onRemoveViewListener(int numberOfAddedViews) {
    }

    @Override
    public void onRemoveViewListener(ViewType viewType, int numberOfAddedViews) {

    }

    @Override
    public void onStartViewChangeListener(ViewType viewType) {

    }

    @Override
    public void onStopViewChangeListener(ViewType viewType) {

    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.btnSelImage:
                pickImageWithCrop();
                break;
            case R.id.btnEraser:
                mPhotoEditor.saveAsBitmap(new OnSaveBitmap() {
                    @Override
                    public void onBitmapReady(Bitmap bitmap) {
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);
                        byte[] imageInByte = baos.toByteArray();
                        try {
                            baos.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                        DataHolder.setData(imageInByte);
                        startActivityForResult(new Intent(CreateOwnStickerActivity.this, ImageEraserActivity.class), Start_Activity_For_Eraser);
                    }

                    @Override
                    public void onFailure(Exception e) {
                    }
                });
                break;
            case R.id.btnBrush:
                handle_WhenEnableAndDisbale_Move(true);
                enableAndDisbaleBrush(true);
                mPropertiesBSFragment.show(getSupportFragmentManager(), mPropertiesBSFragment.getTag());
                break;
            case R.id.btnUndo:
                handle_WhenEnableAndDisbale_Move(true);
                mPhotoEditor.undo();
                break;
            case R.id.btnRedo:
                handle_WhenEnableAndDisbale_Move(true);
                mPhotoEditor.redo();
                break;
            case R.id.btnMove:
                enableAndDisbaleBrush(false);
                handle_WhenEnableAndDisbale_Move(isMoveImage);
                break;
            case R.id.btnText:
                showTextLayout("", null, text_color, null);
                break;
            case R.id.tv_font:
                rl_color.setVisibility(View.VISIBLE);
                TextAdapter fontAdapter = new TextAdapter(CreateOwnStickerActivity.this, GlobalClass.getFontArray(CreateOwnStickerActivity.this));
                rl_color.setAdapter(fontAdapter);

                fontAdapter.setOnClickLIstner(new OnClickFont() {
                    @Override
                    public void onFontClick(View v, String fontPath, int pos) {
                        textString = fontPath;
                        typeface = Typeface.createFromAsset(getAssets(), fontPath);
                        edit_font.setTypeface(typeface);
                    }
                });
                break;

            case R.id.iv_bgcolor:
                showColorPickerDialogDemo();
                break;

            case R.id.iv_transparent:
                //mPhotoEditorView.getSource().setImageDrawable(null);
                if (mPhotoEditorView.getSource().getVisibility() == View.VISIBLE)
                    mPhotoEditorView.getSource().setVisibility(View.GONE);
                else
                    mPhotoEditorView.getSource().setVisibility(View.VISIBLE);
                break;

            case R.id.iv_txtcolor:
                rl_color.setVisibility(View.VISIBLE);
                ArrayList<Integer> getColorArray = GlobalClass.getColorArray();
                TextColorAdapter textAdapter = new TextColorAdapter(CreateOwnStickerActivity.this, getColorArray);
                rl_color.setAdapter(textAdapter);

                textAdapter.setOnClickLIstner(new OnClickListner() {
                    @Override
                    public void onClick(View v, Integer image, int pos) {
                        edit_font.setTextColor(getResources().getColor(image));
                        text_color = getResources().getColor(image);
                        viewSelectedTextColor.setBackgroundColor(text_color);
                    }
                });
                break;

            case R.id.tv_done:
                textString = edit_font.getText().toString();
                if (!TextUtils.isEmpty(edit_font.getText())) {
                    textString = edit_font.getText().toString();
                    typeface = edit_font.getTypeface();
                    mPhotoEditor.addText(typeface, textString, text_color);
                    edit_font.setText("");
                    frame_textview.setVisibility(View.GONE);
                }
                hideKeyBoard(edit_font);
                break;

            case R.id.btnEmojies:
                handle_WhenEnableAndDisbale_Move(true);
                enableAndDisbaleBrush(false);
                mEmojiBSFragment.show(getSupportFragmentManager(), mEmojiBSFragment.getTag());
                break;

            case R.id.btnDecoration:
                handle_WhenEnableAndDisbale_Move(true);
                enableAndDisbaleBrush(false);
                BottomSheetDialog dialog = new BottomSheetDialog(CreateOwnStickerActivity.this);
                dialog.setContentView(R.layout.layout_decorate);

                dialog.getWindow()
                        .findViewById(R.id.design_bottom_sheet)
                        .setBackgroundResource(android.R.color.transparent);

                rvDecorate = dialog.findViewById(R.id.rvDecorate);
                rvDecorate.setLayoutManager(new GridLayoutManager(this, 4));

                DecorateAdapter adapter = new DecorateAdapter(this, GlobalClass.getStickerArray());
                rvDecorate.setAdapter(adapter);

                adapter.setClickListener(new DecorateAdapter.ClickListener() {
                    @Override
                    public void onClick(View v, Image image, int position) {
                        try {
                            BitmapFactory.Options options = new BitmapFactory.Options();
                            options.inSampleSize = 2;
                            Bitmap icon = BitmapFactory.decodeResource(getResources(), image.getDrawableId(), options);
                            mPhotoEditor.addImage(icon);
                            dialog.dismiss();
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
                dialog.show();
                break;
        }
    }

    private void pickImageWithCrop() {
        Log.d("pack", "pick image with crop");
        CropImage.activity()
                .setGuidelines(CropImageView.Guidelines.ON)
                .start(CreateOwnStickerActivity.this);
    }

    private void enableAndDisbaleBrush(boolean brushVal) {
        mPhotoEditor.setBrushDrawingMode(brushVal);
    }

    private void handle_WhenEnableAndDisbale_Move(boolean moveVal) {
        if (moveVal) {
            isMoveImage = false;
            imgMove.setImageDrawable(getResources().getDrawable(R.drawable.ic_move_lock));
            mPhotoEditorView.setOnTouchListener(null);
        } else {
            isMoveImage = true;
            imgMove.setImageDrawable(getResources().getDrawable(R.drawable.ic_move_open));
            mPhotoEditorView.setOnTouchListener(new imageTouchLisener());
        }
    }

    private Bitmap getBitmapFromView(View view) {
        Bitmap returnedBitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(returnedBitmap);
        Drawable bgDrawable = view.getBackground();
        if (bgDrawable != null) {
            bgDrawable.draw(canvas);
        } else {
            canvas.drawColor(Color.TRANSPARENT);
        }
        view.draw(canvas);
        return returnedBitmap;
    }

 /*   private void saveImage() {
        File file = new File(Environment.getExternalStorageDirectory()
                + File.separator + ""
                + System.currentTimeMillis() + ".png");
        try {
            file.createNewFile();

            SaveSettings saveSettings = new SaveSettings.Builder()
                    .setClearViewsEnabled(true)
                    .setTransparencyEnabled(true)
                    .build();
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                return;
            }
            mPhotoEditor.saveAsFile(file.getAbsolutePath(), saveSettings, new PhotoEditor.OnSaveListener() {
                @Override
                public void onSuccess(@NonNull String imagePath) {
                    Toast.makeText(getApplicationContext(), "Image Saved Successfully", Toast.LENGTH_SHORT).show();
                    //mPhotoEditorView.getSource().setImageURI(Uri.fromFile(new File(imagePath)));
                    Intent intent = new Intent();
                    intent.setData(Uri.parse(imagePath));
                    setResult(Activity.RESULT_OK, intent);
                    finish();
                }

                @Override
                public void onFailure(@NonNull Exception exception) {
                    Toast.makeText(getApplicationContext(), "Failed to save Image", Toast.LENGTH_SHORT).show();
                }
            });
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getApplicationContext(), "" + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }*/

    public void saveImage() {
        try {
            mPhotoEditor.clearHelperBox();
            Bitmap bitmap = getBitmapFromView(mPhotoEditorView);
            new SaveImageTask().execute(bitmap);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private class SaveImageTask extends AsyncTask<Bitmap, Void, File> {
        @Override
        protected void onPreExecute() {
            if (progressDialog != null)
                progressDialog.show();
        }

        protected File doInBackground(Bitmap... args) {
            File file = null;
            Bitmap bitmap = args[0];
            try {
                file = new File(getExternalCacheDir(), "f" + System.currentTimeMillis() + ".png");
                FileOutputStream fOut = new FileOutputStream(file);
                bitmap.compress(Bitmap.CompressFormat.PNG, 90, fOut);
                fOut.flush();
                fOut.close();
                file.setReadable(true, false);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return file;
        }

        protected void onPostExecute(File result) {
            if (progressDialog.isShowing()) {
                progressDialog.dismiss();
            }
            Intent intent = new Intent();
            intent.setData(Uri.fromFile(result));
            setResult(Activity.RESULT_OK, intent);
            finish();
        }
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode, @NonNull String permissions[], @NonNull int[] grantResults) {
        if (requestCode == 2000) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                saveImage();
            }
        }
    }

    public String getEmojiByUnicode(String emoji) {
        String returnedEmoji;
        try {
            int convertEmojiToInt = Integer.parseInt(emoji.substring(2), 16);
            returnedEmoji = new String(Character.toChars(convertEmojiToInt));
        } catch (NumberFormatException e) {
            returnedEmoji = "";
        }
        return returnedEmoji;
    }

  /*  public void Dialog_updatetext(final TextSticker sticker) {
        final Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.lyt_dialog_updatename);
        //dialog.setTitle("Title...");

        // set the custom dialog components - text, image and button
        final EditText edstikertext = dialog.findViewById(R.id.edstikertext);
        edstikertext.setText(sticker.getText().toString().trim());
        edstikertext.requestFocus();

        Button btnok = dialog.findViewById(R.id.btnok);
        Button btncancel = dialog.findViewById(R.id.btncancel);

        btncancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();
            }
        });
        btnok.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (edstikertext.getText().toString().trim().length() == 0) {
                    Toast.makeText(getApplicationContext(), "Add Text", Toast.LENGTH_SHORT).show();
                } else {
                    sticker.setDrawable(getResources().getDrawable(R.drawable.bg_text));
                    sticker.setText(edstikertext.getText().toString().trim());
                    sticker.setTextAlign(Layout.Alignment.ALIGN_CENTER);
                    sticker.setMaxTextSize(20.0f);
                    sticker.resizeText();
                    textSticker = sticker;
                    dialog.dismiss();
                }
            }
        });
        dialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE);
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
    }*/

    public void showColorPickerDialogDemo() {
        int initialColor = global.getColor();
        ColorPickerDialog colorPickerDialog = new ColorPickerDialog(this,
                initialColor, new ColorPickerDialog.OnColorSelectedListener() {

            @Override
            public void onColorSelected(int color) {
                global.setColor(color);
            }
        });
        colorPickerDialog.show();
    }

    public void showTextLayout(String txt, View rootView, int colorCode, Typeface fontTypeface) {
        try {
            frame_textview.setVisibility(View.VISIBLE);
            edit_font.setText(txt);
            text_color = colorCode;
            edit_font.setTextColor(colorCode);
            viewSelectedTextColor.setBackgroundColor(text_color);
            if (fontTypeface != null) {
                typeface = fontTypeface;
                edit_font.setTypeface(fontTypeface);
            }
            rl_color.setVisibility(View.GONE);
            fontstyle = getResources().getStringArray(R.array.font_array);
        } catch (Exception e) {
        }

        tv_done.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                textString = edit_font.getText().toString();
                if (edit_font.getText().toString().trim().equals("")) {
                    Toast.makeText(getApplicationContext(), "Add Text", Toast.LENGTH_SHORT).show();
                } else {
                    if (rootView == null) {
                        textString = edit_font.getText().toString();
                        typeface = edit_font.getTypeface();
                        mPhotoEditor.addText(typeface, textString, text_color);
                    } else {
                        typeface = edit_font.getTypeface();
                        textString = edit_font.getText().toString();
                        mPhotoEditor.editText(rootView, typeface, textString, text_color);
                    }
                }
                edit_font.setText("");
                frame_textview.setVisibility(View.GONE);
                hideKeyBoard(edit_font);
            }
        });
    }

    @Override
    public void onEmojiClick(String emojiUnicode) {
        mPhotoEditor.addEmoji(emojiUnicode);
    }

    public class imageTouchLisener implements View.OnTouchListener {
        @Override
        public boolean onTouch(View v, MotionEvent event) {
            mPhotoEditorView.getSource().setScaleType(ImageView.ScaleType.MATRIX);
            float scale;

            // Dump touch event to log
            dumpEvent(event);

            // Handle touch events here...
            switch (event.getAction() & MotionEvent.ACTION_MASK) {
                case MotionEvent.ACTION_DOWN: //first finger down only
                    savedMatrix.set(matrix);
                    start.set(event.getX(), event.getY());
                    //Log.d(TAG, "mode=DRAG");
                    mode = DRAG;
                    break;

                case MotionEvent.ACTION_POINTER_DOWN:
                    oldDist = spacing(event);
                    if (oldDist > 10f) {
                        savedMatrix.set(matrix);
                        midPoint(mid, event);
                        mode = ZOOM;
                    }
                    lastEvent = new float[4];
                    lastEvent[0] = event.getX(0);
                    lastEvent[1] = event.getX(1);
                    lastEvent[2] = event.getY(0);
                    lastEvent[3] = event.getY(1);
                    d = rotation(event);
                    break;

                case MotionEvent.ACTION_UP: //first finger lifted
                case MotionEvent.ACTION_POINTER_UP: //second finger lifted
                    mode = NONE;
                    //Log.d(TAG, "mode=NONE");
                    break;


                case MotionEvent.ACTION_MOVE:
                    if (mode == DRAG) {
                        matrix.set(savedMatrix);
                        matrix.postTranslate(event.getX() - start.x, event.getY()
                                - start.y);
                    } else if (mode == ZOOM && event.getPointerCount() == 2) {
                        float newDist = spacing(event);
                        matrix.set(savedMatrix);
                        if (newDist > 10f) {
                            scale = newDist / oldDist;
                            matrix.postScale(scale, scale, mid.x, mid.y);
                        }
                        if (lastEvent != null) {
                            newRot = rotation(event);
                            float r = newRot - d;
                            matrix.postRotate(r, mPhotoEditorView.getSource().getMeasuredWidth() / 2,
                                    mPhotoEditorView.getSource().getMeasuredHeight() / 2);
                        }
                    }
                    break;

            }
            // Perform the transformation
            mPhotoEditorView.getSource().setImageMatrix(matrix);

            return true; // indicate event was handled

        }
    }

    private float rotation(MotionEvent event) {
        double delta_x = (event.getX(0) - event.getX(1));
        double delta_y = (event.getY(0) - event.getY(1));
        double radians = Math.atan2(delta_y, delta_x);

        return (float) Math.toDegrees(radians);
    }

    private float spacing(MotionEvent event) {
        float x = event.getX(0) - event.getX(1);
        float y = event.getY(0) - event.getY(1);
        return (float) Math.sqrt(x * x + y * y);

    }

    private void midPoint(PointF point, MotionEvent event) {
        float x = event.getX(0) + event.getX(1);
        float y = event.getY(0) + event.getY(1);
        point.set(x / 2, y / 2);

    }

    private void dumpEvent(MotionEvent event) {
        String names[] = {"DOWN", "UP", "MOVE", "CANCEL", "OUTSIDE",
                "POINTER_DOWN", "POINTER_UP", "7?", "8?", "9?"};
        StringBuilder sb = new StringBuilder();
        int action = event.getAction();
        int actionCode = action & MotionEvent.ACTION_MASK;
        sb.append("event ACTION_").append(names[actionCode]);
        if (actionCode == MotionEvent.ACTION_POINTER_DOWN
                || actionCode == MotionEvent.ACTION_POINTER_UP) {
            sb.append("(pid ").append(
                    action >> MotionEvent.ACTION_POINTER_ID_SHIFT);
            sb.append(")");
        }

        sb.append("[");

        for (int i = 0; i < event.getPointerCount(); i++) {
            sb.append("#").append(i);
            sb.append("(pid ").append(event.getPointerId(i));
            sb.append(")=").append((int) event.getX(i));
            sb.append(",").append((int) event.getY(i));
            if (i + 1 < event.getPointerCount())
                sb.append(";");
        }
        sb.append("]");
    }

    public void hideKeyBoard(View view) {
        InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }

    @Override
    public void onBackPressed() {
        if (frame_textview.getVisibility() == View.VISIBLE) {
            frame_textview.setVisibility(View.GONE);
        } else {
            AlertDialog.Builder dialog = new AlertDialog.Builder(this);
            dialog.setTitle(getString(R.string.label_warning));
            dialog.setMessage("Are you sure you want to discard all changes without save sticker?");
            dialog.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    finish();
                }
            });
            dialog.setNegativeButton("No", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    dialog.dismiss();
                }
            });
            dialog.show();
        }
    }

    public void showmPhotoEditorImageView() {
        mPhotoEditorView.getSource().setVisibility(View.VISIBLE);
    }
}
