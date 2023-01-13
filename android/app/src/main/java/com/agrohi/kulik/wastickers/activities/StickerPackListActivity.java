package com.agrohi.kulik.wastickers.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.widget.SearchView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

//import com.facebook.ads.AdSize;
//import com.google.android.gms.ads.AdListener;
//import com.google.android.gms.ads.AdRequest;
//import com.google.android.gms.ads.AdView;
import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.adapters.StickerPackListAdapter;
import com.agrohi.kulik.wastickers.adapters.StickerPackListItemViewHolder;
import com.agrohi.kulik.wastickers.base.BaseActivity;
import com.agrohi.kulik.wastickers.models.ApiStickersListResponse;
import com.agrohi.kulik.wastickers.models.StickerPack;
import com.agrohi.kulik.wastickers.utils.GlobalFun;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;

public class StickerPackListActivity extends BaseActivity implements SearchView.OnQueryTextListener {
    LinearLayoutManager packLayoutManager;
    RecyclerView packRecyclerView;
    StickerPackListAdapter allStickerPacksListAdapter;
    LinearLayout emptyLayout;
    RelativeLayout listLayout;
//    AdmobAdsClass admobObj;
//    AdView adView;
    ArrayList<StickerPack> stickerPackArrayList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sticker_pack_list);

        //facebook banner ad
//        com.facebook.ads.AdView adView2 = new com.facebook.ads.AdView(this, "2987994584650084_2987995867983289",AdSize.BANNER_HEIGHT_50);
//        LinearLayout adContainer = (LinearLayout) findViewById(R.id.banner_container);
//        adContainer.addView(adView2);
//        adView2.loadAd();

        getSupportActionBar().setDisplayShowHomeEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        packRecyclerView = findViewById(R.id.sticker_pack_list);
        emptyLayout = findViewById(R.id.emptyLayout);
        listLayout = findViewById(R.id.listLayout);

        // init stikerslist
        allStickerPacksListAdapter = new StickerPackListAdapter(stickerPackArrayList, onAddButtonClickedListener, OnContainerLayoutClickedListener, this);
        packRecyclerView.setAdapter(allStickerPacksListAdapter);
        packLayoutManager = new LinearLayoutManager(this);
        packLayoutManager.setOrientation(LinearLayoutManager.VERTICAL);
        packRecyclerView.setLayoutManager(packLayoutManager);
        if (getIntent().getExtras() != null) {
            String StickerPack = getIntent().getStringExtra(GlobalFun.KeyStickerPackList);
            ApiStickersListResponse.Data stickerpackData = new Gson().fromJson(StickerPack, new TypeToken<ApiStickersListResponse.Data>() {
            }.getType());
            stickerPackArrayList.addAll(stickerpackData.getStickerPack());
        }
        refreshLayoutAndList();

        //-----admob
//        admobObj = new AdmobAdsClass();
//        AdView mAdView = findViewById(R.id.adView);
//        if (admobObj.isNetworkAvailable(this)) {
//            //------- init banner ads
//            AdRequest adRequest = new AdRequest.Builder().build();
//            mAdView.loadAd(adRequest);
//            mAdView.setAdListener(new AdListener() {
//                @Override
//                public void onAdFailedToLoad(int i) {
//                    super.onAdFailedToLoad(i);
//                    mAdView.setVisibility(View.GONE);
//                }
//
//                @Override
//                public void onAdLoaded() {
//                    super.onAdLoaded();
//                    mAdView.setVisibility(View.VISIBLE);
//                }
//            });
//
//            //------- init intrestrial ads
//            //admobObj.loadIntrestrialAds(this);
//        } else {
//            mAdView.setVisibility(View.GONE);
//        }
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    private StickerPackListAdapter.OnAddButtonClickedListener onAddButtonClickedListener = new StickerPackListAdapter.OnAddButtonClickedListener() {
        @Override
        public void onAddButtonClicked(StickerPack stickerPack) {
        }
    };

    private final StickerPackListAdapter.OnContainerLayoutClickedListener OnContainerLayoutClickedListener = pack -> {
        openPackDetailScreen(pack);
    };

    private void openPackDetailScreen(StickerPack spack) {
        spack.setDefaultPack(true);
        Intent intent = new Intent(this, StickerPackDetailsActivity.class);
        intent.putExtra(GlobalFun.KeyDetailStickersList, spack.tojson());
        startActivity(intent);
    }

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
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.sticker_list_activity, menu);
        MenuItem searchItem = menu.findItem(R.id.ic_menu_search);
        final SearchView searchView = (SearchView) searchItem.getActionView();
        searchView.setQueryHint(getString(R.string.search));
        searchView.setMaxWidth(Integer.MAX_VALUE);
        searchView.setOnQueryTextListener(this);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onQueryTextSubmit(String s) {
        return false;
    }

    @Override
    public boolean onQueryTextChange(String s) {
        allStickerPacksListAdapter.getFilter().filter(s);
        return false;
    }

    public void refreshLayoutAndList() {
        packRecyclerView.getViewTreeObserver().addOnGlobalLayoutListener(this::recalculateColumnCount);
        if (stickerPackArrayList.size() == 0) {
            listLayout.setVisibility(View.GONE);
            emptyLayout.setVisibility(View.VISIBLE);
        } else {
            listLayout.setVisibility(View.VISIBLE);
            emptyLayout.setVisibility(View.GONE);
        }
    }
}
