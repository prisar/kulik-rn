package com.agrohi.kulik.wastickers.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.StrictMode;
import androidx.annotation.NonNull;
import androidx.appcompat.widget.Toolbar;
import android.view.MenuItem;
import android.view.View;

import com.agrohi.kulik.R;
import com.agrohi.kulik.wastickers.adapters.CustomViewPagerAdapter;
import com.agrohi.kulik.wastickers.base.BaseActivity;
import com.agrohi.kulik.wastickers.fragments.FragServerStickersListAndSavedStickersList;
import com.agrohi.kulik.wastickers.fragments.FragStickerMakerList;
import com.agrohi.kulik.wastickers.models.TabDetailsModel;
import com.agrohi.kulik.wastickers.utils.AdmobAdsClass;
import com.agrohi.kulik.wastickers.utils.CustomEnableDisableSwipeViewPager;
import com.agrohi.kulik.wastickers.utils.DataArchiver;
import com.agrohi.kulik.wastickers.utils.GlobalFun;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class DashboardActivity extends BaseActivity {
    CustomEnableDisableSwipeViewPager mViewPager;
    BottomNavigationView bottomNavigationView;
    GlobalFun globalFun;
    CustomViewPagerAdapter customViewPagerAdapter;
//    InterstitialAd interstitialAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboardactivity);

//        interstitialAd = new InterstitialAd(this, "2987994584650084_2988001724649370");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
            StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder()
                    .detectLeakedSqlLiteObjects().detectLeakedClosableObjects().penaltyLog()
                    .penaltyDeath().build());
        }

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        globalFun = new GlobalFun();

        //----------- Bottom navigation
        mViewPager = findViewById(R.id.mViewPager);
        mViewPager.setSwipeEnabled(false);
        bottomNavigationView = (BottomNavigationView) findViewById(R.id.navigation);
        setupViewPagerWithBottomNavigationbar();

        //---------- setup admob
        AdmobAdsClass admobObj = new AdmobAdsClass();
//        admobObj.loadIntrestrialAds(this);

        AdView mAdView = findViewById(R.id.adView);
        if (admobObj.isNetworkAvailable(this)) {
            //------- init banner ads
            AdRequest adRequest = new AdRequest.Builder().build();
            mAdView.loadAd(adRequest);
            mAdView.setAdListener(new AdListener() {
                @Override
                public void onAdFailedToLoad(int i) {
                    super.onAdFailedToLoad(i);
                    mAdView.setVisibility(View.GONE);
                }

                @Override
                public void onAdLoaded() {
                    super.onAdLoaded();
                    mAdView.setVisibility(View.VISIBLE);
                }
            });
        } else {
            mAdView.setVisibility(View.GONE);
        }

        //------------ import zip file
        if (Intent.ACTION_SEND.equals(getIntent().getAction())) {
            Bundle extras = getIntent().getExtras();
            if (extras.containsKey(Intent.EXTRA_STREAM)) {
                Uri uri = (Uri) extras.getParcelable(Intent.EXTRA_STREAM);
                if (uri != null) {
                    DataArchiver.importZipFileToStickerPack(uri, this);
                }
            }
        }
    }

    @Override
    public void onBackPressed() {
//        if (drawer.isDrawerOpen(GravityCompat.START)) {
//            drawer.closeDrawer(GravityCompat.START);
//            ;
//            interstitialAd.loadAd();
//        } else {
//            super.onBackPressed();
//        }
        super.onBackPressed();
    }

    private void setupViewPagerWithBottomNavigationbar() {
        customViewPagerAdapter = new CustomViewPagerAdapter(getSupportFragmentManager());
        customViewPagerAdapter.addFragment(new TabDetailsModel("", new FragServerStickersListAndSavedStickersList()));
        customViewPagerAdapter.addFragment(new TabDetailsModel("", new FragStickerMakerList()));

        mViewPager.setAdapter(customViewPagerAdapter);

        bottomNavigationView.setOnNavigationItemSelectedListener(new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem menuItem) {
                switch (menuItem.getItemId()) {
                    case R.id.navigation_stickersList:
                        mViewPager.setCurrentItem(0);
                        return true;
                     case R.id.navigation_stickermaker:
//                         interstitialAd.loadAd();
                         mViewPager.setCurrentItem(1);
                         return true;
                }
                return false;
            }
        });
    }

    /*SearchView searchView;
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.sticker_list_activity, menu);
        MenuItem searchItem = menu.findItem(R.id.ic_menu_search);
        searchView = (SearchView) searchItem.getActionView();
        searchView.setQueryHint(getString(R.string.search));
        searchView.setMaxWidth(Integer.MAX_VALUE);
        searchView.setOnQueryTextListener(this);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onQueryTextSubmit(String s) {
        return false;
    }

    @Override
    public boolean onQueryTextChange(String text) {
        if (mViewPager.getCurrentItem() == 0)
            ((FragStickerMakerList) customViewPagerAdapter.getItem(0)).SerchingQueryText(text);
        else if (mViewPager.getCurrentItem() == 1)
            ((FragServerStickersListAndSavedStickersList) customViewPagerAdapter.getItem(1)).SerchingQueryText(text);
        return false;
    }

    public void resetSearchText() {
        try {
            //searchView.setQuery("", true);
            searchView.onActionViewCollapsed();
        } catch (Exception e) {
        }
    }*/
}
