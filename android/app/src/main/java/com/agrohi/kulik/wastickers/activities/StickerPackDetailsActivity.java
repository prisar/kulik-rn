package com.agrohi.kulik.wastickers.activities;

import android.view.View;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.text.InputType;
import android.text.TextUtils;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.ViewTreeObserver;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.agrohi.kulik.BuildConfig;
import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.adapters.StickerPreviewAdapter;
import com.agrohi.kulik.wastickers.base.BaseActivity;
import com.agrohi.kulik.wastickers.interfaces.OnImageDownloadTaskCompletion;
import com.agrohi.kulik.wastickers.models.Sticker;
import com.agrohi.kulik.wastickers.models.StickerPack;
import com.agrohi.kulik.wastickers.utils.DataArchiver;
import com.agrohi.kulik.wastickers.utils.DownloadStickerPackImage;
import com.agrohi.kulik.wastickers.utils.GlobalFun;
import com.agrohi.kulik.wastickers.utils.ImageManipulation;
import com.agrohi.kulik.wastickers.utils.StickerBook;
import com.agrohi.kulik.wastickers.utils.WhitelistCheck;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.drawee.view.SimpleDraweeView;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.theartofdev.edmodo.cropper.CropImage;
import com.theartofdev.edmodo.cropper.CropImageView;

import java.io.File;
import java.lang.ref.WeakReference;
import java.util.Objects;


public class StickerPackDetailsActivity extends BaseActivity implements View.OnClickListener {
    /**
     * Do not change below values of below 3 lines as this is also used by WhatsApp
     */
    public static final String EXTRA_STICKER_PACK_ID = "sticker_pack_id";
    public static final String EXTRA_STICKER_PACK_AUTHORITY = "sticker_pack_authority";
    public static final String EXTRA_STICKER_PACK_NAME = "sticker_pack_name";

    public static final int ADD_PACK = 200;
    public static final String EXTRA_STICKER_PACK_WEBSITE = "sticker_pack_website";
    public static final String EXTRA_STICKER_PACK_EMAIL = "sticker_pack_email";
    public static final String EXTRA_STICKER_PACK_PRIVACY_POLICY = "sticker_pack_privacy_policy";
    public static final String EXTRA_STICKER_PACK_TRAY_ICON = "sticker_pack_tray_icon";
    public static final String EXTRA_SHOW_UP_BUTTON = "show_up_button";
    public static final String EXTRA_STICKER_PACK_DATA = "sticker_pack";
    private static final String TAG = "StickerPackDetails";

    public static final String CONTENT_PROVIDER_AUTHORITY = "com.agrohi.kulik" + ".stickercontentprovider";

    private RecyclerView recyclerView;
    private GridLayoutManager layoutManager;
    private StickerPreviewAdapter stickerPreviewAdapter;
    private int numColumns;
    private View addButton, downloadButton;
    private View alreadyAddedText;
    private StickerPack stickerPack;
    private View divider;
    private WhiteListCheckAsyncTask whiteListCheckAsyncTask;
    boolean isPickSticker = true;
    int addStickerPos = 0;
    EditText pack_name;
    EditText author;
    View.OnClickListener clickListener;
    boolean showUpButton = true;
//    AdmobAdsClass admobAdsClass;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.sticker_pack_details);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(R.string.title_activity_ownsticker);
        }

        clickListener = this;
        downloadButton = findViewById(R.id.downloadStickerButton);
        pack_name = findViewById(R.id.pack_name);
        author = findViewById(R.id.author);
        addButton = findViewById(R.id.add_to_whatsapp_button);
        alreadyAddedText = findViewById(R.id.already_added_text);

        //------- init intrestrial ads
//        admobAdsClass = new AdmobAdsClass();
        //admobAdsClass.loadIntrestrialAds(this);

        if (getIntent().hasExtra(GlobalFun.KeyDetailStickersList)) {
            String data = getIntent().getStringExtra(GlobalFun.KeyDetailStickersList);
            StickerPack tmpStickerPack = new Gson().fromJson(data, new TypeToken<StickerPack>() {
            }.getType());

            //check sticker pack is exits or not
            if (StickerBook.getStickerPackById(tmpStickerPack.identifier) == null) {
                downloadButton.setVisibility(View.VISIBLE);
                stickerPack = tmpStickerPack;
            } else {
                downloadButton.setVisibility(View.GONE);
                stickerPack = StickerBook.getStickerPackById(tmpStickerPack.identifier);
            }
        } else {
            showUpButton = getIntent().getBooleanExtra(EXTRA_SHOW_UP_BUTTON, false);
            stickerPack = StickerBook.getStickerPackById(getIntent().getStringExtra(EXTRA_STICKER_PACK_DATA));
        }

        EditText packNameTextView = findViewById(R.id.pack_name);
        EditText packPublisherTextView = findViewById(R.id.author);
        SimpleDraweeView packTrayIcon = findViewById(R.id.tray_image);

        layoutManager = new GridLayoutManager(this, 3);
        recyclerView = findViewById(R.id.sticker_list);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.getViewTreeObserver().addOnGlobalLayoutListener(pageLayoutListener);
        recyclerView.addOnScrollListener(dividerScrollListener);
        divider = findViewById(R.id.divider);
        if (stickerPreviewAdapter == null) {
            stickerPreviewAdapter = new StickerPreviewAdapter(getLayoutInflater(), R.drawable.sticker_error, getResources().getDimensionPixelSize(R.dimen.sticker_pack_details_image_size), getResources().getDimensionPixelSize(R.dimen.sticker_pack_details_image_padding), stickerPack, clickListener);
            recyclerView.setAdapter(stickerPreviewAdapter);
        }

        packNameTextView.setText(stickerPack.name);
        packPublisherTextView.setText(stickerPack.publisher);
        packTrayIcon.setController(Fresco.newDraweeControllerBuilder()
                .setUri(stickerPack.getTrayImageUri())
                .setAutoPlayAnimations(true)
                .build());

        findViewById(R.id.plus_icon_add_sticker).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                openFile();
            }
        });

        if (stickerPack.isDefaultPack()) {
            findViewById(R.id.edit_stickerpack).setVisibility(View.GONE);
            findViewById(R.id.edit_stickericon).setVisibility(View.GONE);
        } else {
            findViewById(R.id.edit_stickerpack).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    editStickerPackInInterface();
                }
            });
            packTrayIcon.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    isPickSticker = false;
                    openFile();
                }
            });
            findViewById(R.id.edit_stickericon).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    packTrayIcon.performClick();
                }
            });
        }

        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (stickerPack.getActualStickers().size() >= 3) {
                    addStickerPackToWhatsApp(stickerPack);
                } else {
                    AlertDialog alertDialog = new AlertDialog.Builder(StickerPackDetailsActivity.this)
                            .setNegativeButton("Ok", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    dialogInterface.dismiss();
                                }
                            }).create();
                    alertDialog.setTitle(getString(R.string.label_warning));
                    alertDialog.setMessage(getString(R.string.label_required_min_sticker_before_publish));
                    alertDialog.show();
                }
            }
        });

        downloadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                /*new DownloadStickerPackAsyncTask(stickerPack, new OnTaskComplite() {
                    @Override
                    public void onFinish() {
                        Toast.makeText(StickerPackDetailsActivity.this, "Done.....", Toast.LENGTH_LONG).show();
                    }
                }).execute();*/
                startDownloadStickerImages(stickerPack);
            }
        });

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(showUpButton);
            getSupportActionBar().setTitle(showUpButton ? R.string.title_activity_sticker_pack_details_multiple_pack : R.string.app_name);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        DataArchiver.writeStickerBookJSON(StickerBook.getAllStickerPacks(), StickerPackDetailsActivity.this);
    }

    private void startDownloadStickerImages(StickerPack downloadStickerPack) {
        if (GlobalFun.isInternetConnected(StickerPackDetailsActivity.this)) {
            showDialog(getString(R.string.label_downloading_sticker));
            new DownloadStickerPackImage(StickerPackDetailsActivity.this, downloadStickerPack.getTrayImageUrlPath(), new OnImageDownloadTaskCompletion() {
                @Override
                public void onFinish(String trayImageFilePath, File saveImgFolder) {
                    try {
                        if (!TextUtils.isEmpty(trayImageFilePath)) {
                            File stickerPackTrayIconFile = new File(trayImageFilePath);
                            StickerPack sp = new StickerPack(downloadStickerPack.identifier, downloadStickerPack.isAnimated(), downloadStickerPack.getName(), downloadStickerPack.getPublisher(), Uri.fromFile(stickerPackTrayIconFile), "", "", "", "", StickerPackDetailsActivity.this, true);
                            StickerBook.addStickerPackExisting(sp);

                            for (int i = 0; i < downloadStickerPack.getStickers().size(); i++) {
                                int pos = i;
                                Sticker downloadSticker = downloadStickerPack.getSticker(pos);
                                new DownloadStickerPackImage(StickerPackDetailsActivity.this, downloadSticker.getUrlPath(), new OnImageDownloadTaskCompletion() {
                                    @Override
                                    public void onFinish(String stickerImageFilePath, File saveImgFolder) {
                                        try {
                                            //show progress
                                            int per = (100 * (pos + 1)) / (downloadStickerPack.getStickers().size() - 1);
                                            updateProgressDialogMessage(getString(R.string.label_downloading_sticker) + " : " + per + "%");

                                            if (!TextUtils.isEmpty(stickerImageFilePath)) {
                                                File stickerFile = new File(stickerImageFilePath);
                                                // TODO: correct isAnimated of the image
                                                sp.addSticker(downloadSticker.isAnimated(), Uri.fromFile(stickerFile), StickerPackDetailsActivity.this, pos);
                                                if (pos == downloadStickerPack.getStickers().size() - 1) {
                                                    GlobalFun.deleteRecursive(saveImgFolder);
                                                    stickerPack = StickerBook.getStickerPackById(downloadStickerPack.identifier);
                                                    stickerPreviewAdapter = new StickerPreviewAdapter(getLayoutInflater(), R.drawable.sticker_error, getResources().getDimensionPixelSize(R.dimen.sticker_pack_details_image_size), getResources().getDimensionPixelSize(R.dimen.sticker_pack_details_image_padding), stickerPack, clickListener);
                                                    recyclerView.setAdapter(stickerPreviewAdapter);
                                                    hideDialog();
                                                    downloadButton.setVisibility(View.GONE);
                                                }
                                            }
                                        } catch (Exception e) {
                                        }
                                    }
                                }).execute();
                            }
                            invalidateOptionsMenu();
                        }
                    } catch (Exception e) {
                    }
                }
            }).execute();
        } else {
            GlobalFun.internetFailedDialog(this);
        }
    }

    private void launchInfoActivity(String publisherWebsite, String publisherEmail, String privacyPolicyWebsite, String trayIconUriString) {
        Intent intent = new Intent(StickerPackDetailsActivity.this, StickerPackInfoActivity.class);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_ID, stickerPack.identifier);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_WEBSITE, publisherWebsite);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_EMAIL, publisherEmail);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_PRIVACY_POLICY, privacyPolicyWebsite);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_TRAY_ICON, stickerPack.getTrayImageUri().toString());
        startActivity(intent);
    }

    private void openFile() {
       /* Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        i.setType("image/*");
        startActivityForResult(i, 3000);*/

        CropImage.activity()
                .setGuidelines(CropImageView.Guidelines.ON)
                .start(StickerPackDetailsActivity.this);
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        if (StickerBook.getStickerPackById(stickerPack.identifier) != null) {
            getMenuInflater().inflate(R.menu.sticker_detail_activity, menu);
        }
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
//           case R.id.action_sharePack:
//                //if (checkIsWhatsappExitsOrNot("com.whatsapp", StickerPackDetailsActivity.this)) {
//                DataArchiver.createZipFileFromStickerPack(stickerPack, StickerPackDetailsActivity.this);
//                break;
            case R.id.action_deletepack:
                delCurrStickerPackPack();
                break;
          /*  case R.id.action_info:
                final String publisherWebsite = stickerPack.publisherWebsite;
                final String publisherEmail = stickerPack.publisherEmail;
                final String privacyPolicyWebsite = stickerPack.privacyPolicyWebsite;
                Uri trayIconUri = stickerPack.getTrayImageUri();
                launchInfoActivity(publisherWebsite, publisherEmail, privacyPolicyWebsite, trayIconUri.toString());
                break;*/
        }
        return super.onOptionsItemSelected(item);
    }


    private void addStickerPackToWhatsApp(StickerPack sp) {
        Intent intent = new Intent();
        intent.setAction("com.whatsapp.intent.action.ENABLE_STICKER_PACK");
        intent.putExtra(EXTRA_STICKER_PACK_ID, sp.getIdentifier());
        intent.putExtra(EXTRA_STICKER_PACK_AUTHORITY, CONTENT_PROVIDER_AUTHORITY);
        intent.putExtra(EXTRA_STICKER_PACK_NAME, sp.getName());
        try {
            startActivityForResult(intent, 200);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, R.string.error_adding_sticker_pack, Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == ADD_PACK) {
            if (resultCode == Activity.RESULT_CANCELED && data != null) {
                final String validationError = data.getStringExtra("validation_error");
                if (validationError != null) {
                    if (BuildConfig.DEBUG) {
                        MessageDialogFragment.newInstance(R.string.title_validation_error, validationError).show(getSupportFragmentManager(), "validation error");
                    }
                    Log.e(TAG, "Validation failed:" + validationError);
                }
            } else {
            }
        } else if (requestCode == CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE) {
            CropImage.ActivityResult result = CropImage.getActivityResult(data);
            if (resultCode == RESULT_OK) {
                Uri resultUri = result.getUri();
                Intent intent = new Intent(this, CreateOwnStickerActivity.class);
                intent.putExtra("resultUri", resultUri.toString());
                intent.putExtra("Shape", result.getCropImageShape());
                startActivityForResult(intent, 1000);
            } else if (resultCode == CropImage.CROP_IMAGE_ACTIVITY_RESULT_ERROR_CODE) {
                Exception error = result.getError();
                Toast.makeText(this, "Fail : " + error, Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == 1000 && resultCode == RESULT_OK) {
            if (data != null) {
                Uri uri = data.getData();
                if (ActivityCompat.checkSelfPermission(this, "android.permission.READ_EXTERNAL_STORAGE") != 0) {
                    // TODO: get isAnimated from intent data
                    stickerPack.addStickerOnSpecificPos(true, uri, this, addStickerPos);
                    verifyStoragePermissions(this);
                } else {
                    if (isPickSticker) {
                        // TODO: get isAnimated from intent data
                        stickerPack.addStickerOnSpecificPos(true, uri, this, addStickerPos);
                        if (stickerPreviewAdapter != null) {
                            stickerPreviewAdapter.notifyDataSetChanged();
                        }
                    } else {
                        try {
                            //getContentResolver().takePersistableUriPermission(Objects.requireNonNull(uri), Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            Uri traUri = ImageManipulation.convertIconTrayToWebP(stickerPack.isAnimated(), uri, stickerPack.identifier, "trayImage", this);
                            stickerPack.setTrayImageUri_local(traUri);
                            Fresco.getImagePipeline().evictFromMemoryCache(traUri);
                            finish();
                            startActivity(getIntent());
                            if (stickerPreviewAdapter != null) {
                                stickerPreviewAdapter.notifyDataSetChanged();
                            }
                        } catch (Exception e) {
                        }
                    }
                }
            }
        }
    }

    private final ViewTreeObserver.OnGlobalLayoutListener pageLayoutListener = new ViewTreeObserver.OnGlobalLayoutListener() {
        @Override
        public void onGlobalLayout() {
            setNumColumns(recyclerView.getWidth() / recyclerView.getContext().getResources().getDimensionPixelSize(R.dimen.sticker_pack_details_image_size));
        }
    };

    private void setNumColumns(int numColumns) {
        if (this.numColumns != numColumns) {
            layoutManager.setSpanCount(numColumns);
            this.numColumns = numColumns;
            if (stickerPreviewAdapter != null) {
                stickerPreviewAdapter.notifyDataSetChanged();
            }
        }
    }

    private final RecyclerView.OnScrollListener dividerScrollListener = new RecyclerView.OnScrollListener() {
        @Override
        public void onScrollStateChanged(@NonNull final RecyclerView recyclerView, final int newState) {
            super.onScrollStateChanged(recyclerView, newState);
            updateDivider(recyclerView);
        }

        @Override
        public void onScrolled(@NonNull final RecyclerView recyclerView, final int dx, final int dy) {
            super.onScrolled(recyclerView, dx, dy);
            updateDivider(recyclerView);
        }

        private void updateDivider(RecyclerView recyclerView) {
            boolean showDivider = recyclerView.computeVerticalScrollOffset() > 0;
            if (divider != null) {
                divider.setVisibility(showDivider ? View.VISIBLE : View.INVISIBLE);
            }
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        whiteListCheckAsyncTask = new WhiteListCheckAsyncTask(this);
        whiteListCheckAsyncTask.execute(stickerPack);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (whiteListCheckAsyncTask != null && !whiteListCheckAsyncTask.isCancelled()) {
            whiteListCheckAsyncTask.cancel(true);
        }
    }

    private void updateAddUI(Boolean isWhitelisted) {
        if (isWhitelisted) {
            addButton.setVisibility(View.GONE);
            alreadyAddedText.setVisibility(View.VISIBLE);
        } else {
            addButton.setVisibility(View.VISIBLE);
            alreadyAddedText.setVisibility(View.GONE);
        }
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.sticker_preview:
                int position = (int) view.getTag();
                if (TextUtils.isEmpty(stickerPack.getSticker(position).getImageFileName())) {
                    gotoStickerImagePickActivity(position);
                }
                /*if (position == stickerPack.getStickers().size()) {
                openFile();
                }*/
                break;
        }
    }

    private void gotoStickerImagePickActivity(int position) {
        isPickSticker = true;
        addStickerPos = position;
        Intent intent = new Intent(this, CreateOwnStickerActivity.class);
        startActivityForResult(intent, 1000);
    }

    static class WhiteListCheckAsyncTask extends AsyncTask<StickerPack, Void, Boolean> {
        private final WeakReference<StickerPackDetailsActivity> stickerPackDetailsActivityWeakReference;

        WhiteListCheckAsyncTask(StickerPackDetailsActivity stickerPackListActivity) {
            this.stickerPackDetailsActivityWeakReference = new WeakReference<>(stickerPackListActivity);
        }

        @Override
        protected final Boolean doInBackground(StickerPack... stickerPacks) {
            StickerPack stickerPack = stickerPacks[0];
            final StickerPackDetailsActivity stickerPackDetailsActivity = stickerPackDetailsActivityWeakReference.get();
            //noinspection SimplifiableIfStatement
            if (stickerPackDetailsActivity == null) {
                return false;
            }
            return WhitelistCheck.isWhitelisted(stickerPackDetailsActivity, stickerPack.identifier);
        }

        @Override
        protected void onPostExecute(Boolean isWhitelisted) {
            final StickerPackDetailsActivity stickerPackDetailsActivity = stickerPackDetailsActivityWeakReference.get();
            if (stickerPackDetailsActivity != null) {
                stickerPackDetailsActivity.updateAddUI(isWhitelisted);
            }
        }
    }

    public void delCurrStickerPackPack() {
        AlertDialog alertDialog = new AlertDialog.Builder(StickerPackDetailsActivity.this)
                .setNegativeButton(R.string.label_no, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        dialogInterface.dismiss();
                    }
                })
                .setPositiveButton(R.string.label_yes_delete, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        dialogInterface.dismiss();
                        StickerBook.deleteStickerPackById(stickerPack.getIdentifier());
                        finish();
                        Toast.makeText(StickerPackDetailsActivity.this, "Sticker Pack deleted successfully", Toast.LENGTH_SHORT).show();
                    }
                }).create();
        alertDialog.setTitle(getString(R.string.label_warning));
        alertDialog.setMessage(getString(R.string.label_sure_want_to_delete));
        alertDialog.show();
    }

    public static void verifyStoragePermissions(Activity activity) {
        int permission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        if (permission != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    activity,
                    new String[]{
                            Manifest.permission.READ_EXTERNAL_STORAGE,
                            Manifest.permission.WRITE_EXTERNAL_STORAGE
                    },
                    1
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case 1:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    finish();
                    startActivity(getIntent());
                    if (stickerPreviewAdapter != null) {
                        stickerPreviewAdapter.notifyDataSetChanged();
                    }
                }
                break;
        }
    }

    private void editStickerPackInInterface() {
        AlertDialog.Builder dialog = new AlertDialog.Builder(this);
        dialog.setTitle("Edit Sticker Pack");
        dialog.setMessage("Please specify title and creator for the pack.");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);

        final EditText nameBox = new EditText(this);
        nameBox.setLines(1);
        LinearLayout.LayoutParams buttonLayoutParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        buttonLayoutParams.setMargins(50, 0, 50, 10);
        nameBox.setLayoutParams(buttonLayoutParams);
        nameBox.setHint("Pack Name");
        nameBox.setInputType(InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE);
        layout.addView(nameBox);

        final EditText creatorBox = new EditText(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            creatorBox.setAutofillHints("Name");
        }
        creatorBox.setLines(1);
        creatorBox.setLayoutParams(buttonLayoutParams);
        creatorBox.setInputType(InputType.TYPE_TEXT_FLAG_AUTO_COMPLETE);
        creatorBox.setHint("Creator");
        layout.addView(creatorBox);

        dialog.setView(layout);

        nameBox.setText(stickerPack.getName());
        creatorBox.setText(stickerPack.getPublisher());

        dialog.setPositiveButton("OK", null);
        dialog.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                dialog.cancel();
            }
        });

        final AlertDialog ad = dialog.create();
        ad.show();
        Button b = ad.getButton(AlertDialog.BUTTON_POSITIVE);
        b.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (TextUtils.isEmpty(nameBox.getText())) {
                    nameBox.setError("Package name is required!");
                }

                if (TextUtils.isEmpty(creatorBox.getText())) {
                    creatorBox.setError("Creator is required!");
                }

                if (!TextUtils.isEmpty(nameBox.getText()) && !TextUtils.isEmpty(creatorBox.getText())) {
                    ad.dismiss();
                    stickerPack.setName(nameBox.getText().toString().trim());
                    stickerPack.setPublisher(creatorBox.getText().toString().trim());
                    pack_name.setText(nameBox.getText().toString().trim());
                    author.setText(creatorBox.getText().toString().trim());
                }
            }
        });

        creatorBox.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if ((event != null && (event.getKeyCode() == KeyEvent.KEYCODE_ENTER)) || (actionId == EditorInfo.IME_ACTION_DONE)) {
                    b.performClick();
                }
                return false;
            }
        });
    }
}
