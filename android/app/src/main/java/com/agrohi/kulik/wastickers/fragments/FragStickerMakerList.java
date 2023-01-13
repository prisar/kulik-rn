package com.agrohi.kulik.wastickers.fragments;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.preference.PreferenceManager;
import android.text.InputType;
import android.text.TextUtils;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.view.animation.BounceInterpolator;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.SearchView;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.agrohi.kulik.BuildConfig;
import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.activities.CreateOwnStickerActivity;
import com.agrohi.kulik.wastickers.activities.StickerPackDetailsActivity;
import com.agrohi.kulik.wastickers.adapters.StickerPackListAdapter;
import com.agrohi.kulik.wastickers.adapters.StickerPackListItemViewHolder;
import com.agrohi.kulik.wastickers.base.BaseActivity;
import com.agrohi.kulik.wastickers.base.BaseFragment;
import com.agrohi.kulik.wastickers.interfaces.SearchingInterface;
import com.agrohi.kulik.wastickers.models.StickerPack;
import com.agrohi.kulik.wastickers.utils.DataArchiver;
import com.agrohi.kulik.wastickers.utils.GlobalFun;
import com.agrohi.kulik.wastickers.utils.StickerBook;
import com.agrohi.kulik.wastickers.utils.WhitelistCheck;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.theartofdev.edmodo.cropper.CropImage;
//import com.theartofdev.edmodo.cropper.CropImage;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static android.app.Activity.RESULT_OK;
import static com.agrohi.kulik.wastickers.activities.StickerPackDetailsActivity.EXTRA_STICKER_PACK_DATA;
import static com.agrohi.kulik.wastickers.utils.StickerContentProvider.CONTENT_PROVIDER_AUTHORITY;

public class FragStickerMakerList extends BaseFragment implements SearchView.OnQueryTextListener, SearchingInterface {
    public static final String EXTRA_STICKER_PACK_LIST_DATA = "sticker_pack_list";
    private static final String TAG = "StickerPackList";
    private LinearLayoutManager packLayoutManager;
    RecyclerView packRecyclerView;
    StickerPackListAdapter allStickerPacksListAdapter;
    WhiteListCheckAsyncTask whiteListCheckAsyncTask;
    ArrayList<StickerPack> stickerPackList = new ArrayList<StickerPack>();

    public static String newName, newCreator;
    Uri uri;
    FloatingActionButton fabCreatePack;
    boolean isLoadDefaultPackList;
    //Button btnFindMoreSticker;
    LinearLayout emptyLayout;
    RelativeLayout listLayout;
//    AdmobAdsClass admobObj;

    @Override
    protected int getFragmentLayout() {
        return R.layout.fragment_ownstickermakerlist;
    }

    @Override
    protected void initViewsHere() {
        setHasOptionsMenu(true);
        StickerBook.init(getActivity());
        //------- init intrestrial ads (call only one time)
//        admobObj = new AdmobAdsClass();
        //admobObj.loadIntrestrialAds(getActivity());

        packRecyclerView = getView().findViewById(R.id.sticker_pack_list);
        //btnFindMoreSticker = getView().findViewById(R.id.btnFindMoreSticker);
        emptyLayout = getView().findViewById(R.id.emptyLayout);
        listLayout = getView().findViewById(R.id.listLayout);
        fabCreatePack = (FloatingActionButton) getView().findViewById(R.id.fabCreatePack);

        fabCreatePack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                try {
//                    admobObj.showIntrestrialAds(getActivity(), new admobCloseEvent() {
//                        @Override
//                        public void setAdmobCloseEvent() {
//                            addNewStickerPack();
//                        }
//                    });

                    addNewStickerPack();
                } catch (Exception e) {
                    addNewStickerPack();
                }
            }
        });
        animateCreationButton();

        //---------- when show default stickers
        if (getArguments() != null) {
            isLoadDefaultPackList = getArguments().getBoolean(getString(R.string.txt_isLoadDefaultPackList), false);
            if (isLoadDefaultPackList) {
                fabCreatePack.hide();
                setHasOptionsMenu(false);
            }
        }

        //---------- show Tutorial screen and add default stickers
//        if (!isLoadDefaultPackList) {
//            if (toShowIntro()) {
//                /*new AddDefaultStickerTask(new OnTaskComplite() {
//                    @Override
//                    public void onFinish() {
//                        makeIntroNotRunAgain();
//                    }
//                }).execute();*/
//                startActivityForResult(new Intent(getActivity(), NewUserIntroActivity.class), 1114);
//            }
//        }
    }

    private void animateCreationButton() {
        Animation animation = AnimationUtils.loadAnimation(getContext(), R.anim.scale_anim);
        animation.setInterpolator(new BounceInterpolator());
        fabCreatePack.startAnimation(animation);
    }

    @Override
    public void onResume() {
        super.onResume();
        showStickerPackList();
        whiteListCheckAsyncTask = new WhiteListCheckAsyncTask(this);
        whiteListCheckAsyncTask.execute(stickerPackList);
    }

    @Override
    public void onPause() {
        super.onPause();
        DataArchiver.writeStickerBookJSON(StickerBook.getAllStickerPacks(), getContext());
        if (whiteListCheckAsyncTask != null && !whiteListCheckAsyncTask.isCancelled()) {
            whiteListCheckAsyncTask.cancel(true);
        }
    }

    @Override
    public void onDestroy() {
        DataArchiver.writeStickerBookJSON(StickerBook.getAllStickerPacks(), getActivity());
        super.onDestroy();
    }

    public void showStickerPackList() {
        //stickerPackList = StickerBook.getAllStickerPacks();
        stickerPackList.clear();
        for (StickerPack stickerpack : StickerBook.getAllStickerPacks()) {
            if (isLoadDefaultPackList == stickerpack.isDefaultPack()) {
                stickerPackList.add(stickerpack);
            }
        }

        if (stickerPackList.size() == 0) {
            listLayout.setVisibility(View.GONE);
            emptyLayout.setVisibility(View.VISIBLE);
        } else {
            listLayout.setVisibility(View.VISIBLE);
            emptyLayout.setVisibility(View.GONE);
        }

        allStickerPacksListAdapter = new StickerPackListAdapter(stickerPackList, onAddButtonClickedListener, OnContainerLayoutClickedListener, getContext());
        packRecyclerView.setAdapter(allStickerPacksListAdapter);
        packLayoutManager = new LinearLayoutManager(getActivity());
        packLayoutManager.setOrientation(LinearLayoutManager.VERTICAL);
        /*DividerItemDecoration dividerItemDecoration = new DividerItemDecoration(
                packRecyclerView.getContext(),
                packLayoutManager.getOrientation()
        );
        packRecyclerView.addItemDecoration(dividerItemDecoration);*/
        packRecyclerView.setLayoutManager(packLayoutManager);
        packRecyclerView.getViewTreeObserver().addOnGlobalLayoutListener(this::recalculateColumnCount);
    }

    public static void verifyStoragePermissions(Activity activity) {
        int permission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        if (permission != PackageManager.PERMISSION_GRANTED) {
            // We don't have permission so prompt the user
            ActivityCompat.requestPermissions(
                    activity,
                    new String[]{
                            Manifest.permission.READ_EXTERNAL_STORAGE,
                            Manifest.permission.WRITE_EXTERNAL_STORAGE
                    },
                    2
            );
        }
    }

    private final StickerPackListAdapter.OnContainerLayoutClickedListener OnContainerLayoutClickedListener = pack -> {
        openPackDetailScreen(pack);
    };

    private void openPackDetailScreen(StickerPack spack) {
        Intent intent = new Intent(getActivity(), StickerPackDetailsActivity.class);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_SHOW_UP_BUTTON, true);
        intent.putExtra(EXTRA_STICKER_PACK_DATA, spack.identifier);
        startActivity(intent);
    }

    private StickerPackListAdapter.OnAddButtonClickedListener onAddButtonClickedListener = new StickerPackListAdapter.OnAddButtonClickedListener() {
        @Override
        public void onAddButtonClicked(StickerPack pack) {
            if (pack.getStickers().size() >= 3) {
                Intent intent = new Intent();
                intent.setAction("com.whatsapp.intent.action.ENABLE_STICKER_PACK");
                intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_ID, pack.identifier);
                intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_AUTHORITY, CONTENT_PROVIDER_AUTHORITY);
                intent.putExtra(StickerPackDetailsActivity.EXTRA_STICKER_PACK_NAME, pack.name);
                try {
                    startActivityForResult(intent, StickerPackDetailsActivity.ADD_PACK);
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(getContext(), R.string.error_adding_sticker_pack, Toast.LENGTH_LONG).show();
                }
            } else {
                AlertDialog alertDialog = new AlertDialog.Builder(getActivity())
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
    };

    private void recalculateColumnCount() {
        final int previewSize = getResources().getDimensionPixelSize(R.dimen.sticker_pack_list_item_preview_image_size);
        int firstVisibleItemPosition = packLayoutManager.findFirstVisibleItemPosition();
        StickerPackListItemViewHolder viewHolder = (StickerPackListItemViewHolder) packRecyclerView.findViewHolderForAdapterPosition(firstVisibleItemPosition);
        if (viewHolder != null) {
            final int max = Math.max(viewHolder.imageRowView.getMeasuredWidth() / previewSize, 1);
            int numColumns = Math.min(GlobalFun.STICKER_PREVIEW_DISPLAY_LIMIT, max);
            allStickerPacksListAdapter.setMaxNumberOfStickersInARow(numColumns);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == StickerPackDetailsActivity.ADD_PACK) {
            if (resultCode == Activity.RESULT_CANCELED && data != null) {
                final String validationError = data.getStringExtra("validation_error");
                if (validationError != null) {
                    if (BuildConfig.DEBUG) {
                        //validation error should be shown to developer only, not users.
                        BaseActivity.MessageDialogFragment.newInstance(R.string.title_validation_error, validationError).show(getActivity().getSupportFragmentManager(), "validation error");
                    }
                    Log.e(TAG, "Validation failed:" + validationError);
                }
            } else {
                Toast.makeText(getContext(), "Show Ads", Toast.LENGTH_SHORT).show();
            }
        } else if (data != null && requestCode == 2319) {
            Uri uri = data.getData();
            getContext().getContentResolver().takePersistableUriPermission(Objects.requireNonNull(uri), Intent.FLAG_GRANT_READ_URI_PERMISSION);
            createNewStickerPackAndOpenIt(newName, newCreator, uri);
        } else if (requestCode == 1114) {
            makeIntroNotRunAgain();

            /*new MaterialIntroView.Builder(this)
                    .enableIcon(false)
                    .setFocusGravity(FocusGravity.CENTER)
                    .setFocusType(Focus.MINIMUM)
                    .setDelayMillis(500)
                    .enableFadeAnimation(true)
                    .performClick(true)
                    .setInfoText("To add new sticker packs, click here.")
                    .setShape(ShapeType.CIRCLE)
                    .setTarget(findViewById(R.id.fabCreatePack))
                    .setUsageId("intro_card") //THIS SHOULD BE UNIQUE ID
                    .show();*/
        } else if (requestCode == 3000) {
            if (data != null) {
                if (data.getClipData() != null) {
                    ClipData clipData = data.getClipData();
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        ClipData.Item path = clipData.getItemAt(i);
                        Uri uri = path.getUri();
                        getContext().getContentResolver().takePersistableUriPermission(Objects.requireNonNull(uri), Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        createNewStickerPackAndOpenIt(newName, newCreator, uri);
                    }
                } else {
                    Uri uri = data.getData();
                    getContext().getContentResolver().takePersistableUriPermission(Objects.requireNonNull(uri), Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    createNewStickerPackAndOpenIt(newName, newCreator, uri);
                }
            }
        } else if (requestCode == CropImage.CROP_IMAGE_ACTIVITY_REQUEST_CODE) {
            CropImage.ActivityResult result = CropImage.getActivityResult(data);
            if (resultCode == RESULT_OK) {
                Uri resultUri = result.getUri();
                Intent intent = new Intent(getActivity(), CreateOwnStickerActivity.class);
                intent.putExtra("resultUri", resultUri.toString());
                intent.putExtra("Shape", result.getCropImageShape());
                startActivityForResult(intent, 1000);
            } else if (resultCode == CropImage.CROP_IMAGE_ACTIVITY_RESULT_ERROR_CODE) {
                Exception error = result.getError();
                Toast.makeText(getContext(), "Fail : " + error, Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == 1000 && resultCode == RESULT_OK) {
            if (data != null) {
                Uri uri = data.getData();
                //getContentResolver().takePersistableUriPermission(Objects.requireNonNull(uri), Intent.FLAG_GRANT_READ_URI_PERMISSION);
                int permission = ActivityCompat.checkSelfPermission(getActivity(), Manifest.permission.READ_EXTERNAL_STORAGE);
                if (permission != PackageManager.PERMISSION_GRANTED) {
                    this.uri = uri;
                    verifyStoragePermissions(getActivity());
                } else {
                    createNewStickerPackAndOpenIt(newName, newCreator, uri);
                }
            }
        }
    }

    @Override
    public void onCreateOptionsMenu(Menu menu, MenuInflater inflater) {
        if (!isLoadDefaultPackList) {
            inflater.inflate(R.menu.sticker_list_activity, menu);
            MenuItem searchItem = menu.findItem(R.id.ic_menu_search);
            SearchView searchView = (SearchView) searchItem.getActionView();
            searchView.setQueryHint(getString(R.string.search));
            searchView.setMaxWidth(Integer.MAX_VALUE);
            searchView.setOnQueryTextListener(this);
        }
        super.onCreateOptionsMenu(menu, inflater);
    }

    @Override
    public boolean onQueryTextSubmit(String s) {
        return false;
    }

    @Override
    public boolean onQueryTextChange(String searchText) {
        allStickerPacksListAdapter.getFilter().filter(searchText);
        return false;
    }

    /*@Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.ic_menu_info:
                startActivity(new Intent(getActivity(), InfoActivity.class));
                break;
            *//*case R.id.action_add:
                addNewStickerPackInInterface();
                break;*//*
        }
        return super.onOptionsItemSelected(item);
    }*/


    // hear...
    static class WhiteListCheckAsyncTask extends AsyncTask<List<StickerPack>, Void, List<StickerPack>> {
        private final WeakReference<FragStickerMakerList> dashboardActivityWeakReference;

        WhiteListCheckAsyncTask(FragStickerMakerList fragStickerMakerList) {
            this.dashboardActivityWeakReference = new WeakReference<>(fragStickerMakerList);
        }

        @SafeVarargs
        @Override
        protected final List<StickerPack> doInBackground(List<StickerPack>... lists) {
            List<StickerPack> stickerPackList = lists[0];
            final FragStickerMakerList fragStickerMakerList = dashboardActivityWeakReference.get();
            if (fragStickerMakerList == null) {
                return stickerPackList;
            }
            for (StickerPack stickerPack : stickerPackList) {
                stickerPack.setIsWhitelisted(WhitelistCheck.isWhitelisted(fragStickerMakerList.getActivity(), stickerPack.identifier));
            }
            return stickerPackList;
        }

        @Override
        protected void onPostExecute(List<StickerPack> stickerPackList) {
            final FragStickerMakerList fragStickerMakerList = dashboardActivityWeakReference.get();
            if (fragStickerMakerList != null) {
                fragStickerMakerList.allStickerPacksListAdapter.notifyDataSetChanged();
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case 1:
                if (grantResults[0] != PackageManager.PERMISSION_GRANTED) {
                    AlertDialog alertDialog = new AlertDialog.Builder(getActivity())
                            .setPositiveButton("Let's Go", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
//                                    NewUserIntroActivity.verifyStoragePermissions(getActivity());
                                }
                            })
                            .create();
                    alertDialog.setTitle("Notice!");
                    alertDialog.setMessage("We've recognized you denied the storage access permission for this app."
                            + "\n\nIn order for this app to work, storage access is required.");
                    alertDialog.show();
                }
                break;
            case 2:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    createNewStickerPackAndOpenIt(newName, newCreator, uri);
                }
                break;
        }
    }

    private void addNewStickerPack() {
        AlertDialog.Builder dialog = new AlertDialog.Builder(getActivity());
        dialog.setTitle("Create New Sticker Pack");
        dialog.setMessage("Please specify title and creator for the pack.");

        LinearLayout layout = new LinearLayout(getActivity());
        layout.setOrientation(LinearLayout.VERTICAL);

        final EditText nameBox = new EditText(getActivity());
        nameBox.setLines(1);
        LinearLayout.LayoutParams buttonLayoutParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        buttonLayoutParams.setMargins(50, 0, 50, 10);
        nameBox.setLayoutParams(buttonLayoutParams);
        nameBox.setHint("Pack Name");
        nameBox.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
        layout.addView(nameBox);

        final EditText creatorBox = new EditText(getActivity());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            creatorBox.setAutofillHints("name");
        }
        creatorBox.setLines(1);
        creatorBox.setLayoutParams(buttonLayoutParams);
        creatorBox.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
        creatorBox.setHint("Creator");
        layout.addView(creatorBox);

        dialog.setView(layout);
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
                    newName = nameBox.getText().toString();
                    newCreator = creatorBox.getText().toString();
                    Uri resourceURI = Uri.parse("android.resource://" + getActivity().getPackageName() + "/" + R.raw.ic_tray_icon);
                    createNewStickerPackAndOpenIt(newName, newCreator, resourceURI);
                    //createDialogForPickingIconImage(nameBox, creatorBox);
                    //getContentResolver().takePersistableUriPermission(Objects.requireNonNull(uri), Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    //createNewStickerPackAndOpenIt(newName, newCreator, uri);
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

    private void createDialogForPickingIconImage(EditText nameBox, EditText creatorBox) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle("let's Pick your sticker pack icon image");
        builder.setMessage("Now you will pick the new sticker pack's sticker pack icon.")
                .setCancelable(false)
                .setPositiveButton("Let's pick", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.dismiss();
                        //openFileTray(nameBox.getText().toString(), creatorBox.getText().toString());
                        newName = nameBox.getText().toString();
                        newCreator = creatorBox.getText().toString();
                        /*CropImage.activity()
                                .setGuidelines(CropImageView.Guidelines.ON)
                                .start(StickerPackListActivity.this);*/
                    }
                });
        AlertDialog alert = builder.create();
        alert.show();
    }

    private void createNewStickerPackAndOpenIt(String name, String creator, Uri trayImage) {
        String newId = UUID.randomUUID().toString();
        // TODO: set correct isAnimated
        StickerPack sp = new StickerPack(
                newId,
                false,
                name,
                creator,
                trayImage,
                "",
                "",
                "",
                "",
                getActivity(), false);
        //sp.addSticker(trayImage, this);
        StickerBook.addStickerPackExisting(sp);
        Intent intent = new Intent(getActivity(), StickerPackDetailsActivity.class);
        intent.putExtra(StickerPackDetailsActivity.EXTRA_SHOW_UP_BUTTON, true);
        intent.putExtra(EXTRA_STICKER_PACK_DATA, newId);
        intent.putExtra("isNewlyCreated", true);
        this.startActivity(intent);
    }

    private void openFileTray(String name, String creator) {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.setType("image/*");
        newName = name;
        newCreator = creator;
        startActivityForResult(i, 2319);
    }

    private void makeIntroNotRunAgain() {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(getContext());
        boolean previouslyStarted = prefs.getBoolean("isAlreadyShown", false);
        if (!previouslyStarted) {
            SharedPreferences.Editor edit = prefs.edit();
            edit.putBoolean("isAlreadyShown", false);
            edit.commit();
        }
    }

    private boolean toShowIntro() {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(getContext());
        return prefs.getBoolean("isAlreadyShown", true);
    }

    /*public class AddDefaultStickerTask extends AsyncTask<Void, Void, Void> {
        OnTaskComplite onTaskComplite;

        public AddDefaultStickerTask(OnTaskComplite onTaskComplite) {
            this.onTaskComplite = onTaskComplite;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected Void doInBackground(Void... voids) {
            try {
                AssetManager assetManager = getActivity().getAssets();
                String[] folders = assetManager.list(getString(R.string.txt_stickerFolderName));
                for (String folderName : folders) {
                    String trayImagePath = getString(R.string.txt_stickerFolderName) + File.separator + folderName + File.separator + getString(R.string.labal_catIconName);
                    String newId = UUID.randomUUID().toString();
                    StickerPack sp = new StickerPack(newId, folderName, folderName, trayImagePath, "", "", "", "", getActivity());
                    sp.setDefaultPack(true);
                    StickerBook.addStickerPackExisting(sp);

                    String folderPath = getString(R.string.txt_stickerFolderName) + File.separator + folderName;
                    String[] arr_Stickers = assetManager.list(folderPath);
                    for (int i = 0; i < arr_Stickers.length; i++) {
                        if (!arr_Stickers[i].equalsIgnoreCase(getString(R.string.labal_catIconName)))
                            sp.addSticker(folderPath + File.separator + arr_Stickers[i], getActivity(), i);
                    }
                }
            } catch (Exception e) {
            }
            return null;
        }

        @Override
        protected void onPostExecute(Void aVoid) {
            super.onPostExecute(aVoid);
            onTaskComplite.onFinish();
        }

        public Uri StreamToString(InputStream in) throws IOException {
            if (in == null) {
                return null;
            }
            Writer writer = new StringWriter();
            char[] buffer = new char[1024];
            try {
                Reader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
                int n;
                while ((n = reader.read(buffer)) != -1) {
                    writer.write(buffer, 0, n);
                }
            } finally {
            }
            return Uri.parse(writer.toString());
        }
    }*/

   /*@Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
        try {
            if (isVisibleToUser) {
                allStickerPacksListAdapter.getFilter().filter("");
                ((DashboardActivity) getActivity()).resetSearchText();
            }
        } catch (Exception e) {
        }
    }*/


    @Override
    public void SearchingQueryText(String searchText) {
        try {
            allStickerPacksListAdapter.getFilter().filter(searchText);
        } catch (Exception e) {
        }
    }

    @Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
        try {
            if (isVisibleToUser && allStickerPacksListAdapter != null) {
                allStickerPacksListAdapter.getFilter().filter("");
            }
        } catch (Exception e) {
        }
    }
}
